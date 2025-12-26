const { dbQueryOne, dbQueryMany } = require('../config/database');
const { PAGINATION, CONTEST_STATUS } = require('../constants');

class ContestService {
  /**
   * Get all contests with pagination
   */
  async getContests({ page = 1, limit = PAGINATION.DEFAULT_LIMIT, status }) {
    const offset = (page - 1) * limit;
    let whereConditions = ['is_public = TRUE'];
    let params = [];

    // Filter by status
    const now = new Date();
    if (status === CONTEST_STATUS.UPCOMING) {
      whereConditions.push('start_time > ?');
      params.push(now);
    } else if (status === CONTEST_STATUS.ONGOING) {
      whereConditions.push('start_time <= ? AND end_time >= ?');
      params.push(now, now);
    } else if (status === CONTEST_STATUS.FINISHED) {
      whereConditions.push('end_time < ?');
      params.push(now);
    }

    const whereClause = whereConditions.join(' AND ');

    const [contests, countResult] = await Promise.all([
      dbQueryMany(
        `SELECT c.*, u.username as author_username,
                (SELECT COUNT(*) FROM contest_participants WHERE contest_id = c.id) as participants_count
         FROM contests c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE ${whereClause}
         ORDER BY c.start_time ASC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      dbQueryOne(
        `SELECT COUNT(*) as total FROM contests WHERE ${whereClause}`,
        params
      )
    ]);

    // Add status to each contest
    contests.forEach(contest => {
      contest.status = this.getContestStatus(contest.start_time, contest.end_time);
    });

    return {
      contests,
      pagination: {
        page,
        limit,
        total: countResult.total
      }
    };
  }

  /**
   * Get contest status
   */
  getContestStatus(startTime, endTime) {
    const now = new Date();
    if (now < new Date(startTime)) return CONTEST_STATUS.UPCOMING;
    if (now > new Date(endTime)) return CONTEST_STATUS.FINISHED;
    return CONTEST_STATUS.ONGOING;
  }

  /**
   * Get contest by ID
   */
  async getContestById(contestId, userId = null) {
    const contest = await dbQueryOne(
      `SELECT c.*, u.username as author_username
       FROM contests c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [contestId]
    );

    if (!contest) {
      throw { statusCode: 404, message: 'Contest not found' };
    }

    // Add status
    contest.status = this.getContestStatus(contest.start_time, contest.end_time);

    // Get problems count
    const problemsCount = await dbQueryOne(
      'SELECT COUNT(*) as count FROM contest_problems WHERE contest_id = ?',
      [contestId]
    );
    contest.problems_count = problemsCount.count;

    // Check if user is participating
    if (userId) {
      const participation = await dbQueryOne(
        'SELECT id FROM contest_participants WHERE contest_id = ? AND user_id = ?',
        [contestId, userId]
      );
      contest.is_participating = !!participation;
    }

    return contest;
  }

  /**
   * Create new contest
   */
  async createContest(contestData, userId) {
    const {
      title,
      description,
      start_time,
      end_time,
      is_public = true
    } = contestData;

    const result = await dbQueryOne(
      `INSERT INTO contests
       (title, description, start_time, end_time, user_id, is_public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, start_time, end_time, userId, is_public]
    );

    return this.getContestById(result.insertId);
  }

  /**
   * Update contest
   */
  async updateContest(contestId, updates, userId, isAdmin = false) {
    const contest = await dbQueryOne(
      'SELECT user_id FROM contests WHERE id = ?',
      [contestId]
    );

    if (!contest) {
      throw { statusCode: 404, message: 'Contest not found' };
    }

    // Check permission
    if (!isAdmin && contest.user_id !== userId) {
      throw { statusCode: 403, message: 'Not authorized to update this contest' };
    }

    const allowedFields = ['title', 'description', 'start_time', 'end_time', 'is_public'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (updateFields.length === 0) {
      throw { statusCode: 400, message: 'No valid fields to update' };
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);

    await dbQueryOne(
      `UPDATE contests SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, contestId]
    );

    return this.getContestById(contestId);
  }

  /**
   * Join contest
   */
  async joinContest(contestId, userId) {
    const contest = await this.getContestById(contestId);

    if (contest.status === CONTEST_STATUS.FINISHED) {
      throw { statusCode: 400, message: 'Contest has already finished' };
    }

    // Check if already participating
    const existing = await dbQueryOne(
      'SELECT id FROM contest_participants WHERE contest_id = ? AND user_id = ?',
      [contestId, userId]
    );

    if (existing) {
      throw { statusCode: 400, message: 'Already participating in this contest' };
    }

    await dbQueryOne(
      'INSERT INTO contest_participants (contest_id, user_id, joined_at) VALUES (?, ?, NOW())',
      [contestId, userId]
    );

    return { message: 'Successfully joined the contest' };
  }

  /**
   * Get contest leaderboard
   */
  async getContestLeaderboard(contestId, { page = 1, limit = 50 }) {
    const offset = (page - 1) * limit;

    const [leaderboard, countResult] = await Promise.all([
      dbQueryMany(
        `SELECT
          u.id, u.username, u.full_name,
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN cp.problem_id END) as solved_count,
          SUM(CASE WHEN s.status = 'accepted' THEN cp.points ELSE 0 END) as total_points,
          MAX(s.created_at) as last_submission_time
         FROM contest_participants cpart
         JOIN users u ON cpart.user_id = u.id
         LEFT JOIN contest_problems cp ON cp.contest_id = cpart.contest_id
         LEFT JOIN submissions s ON s.problem_id = cp.problem_id AND s.user_id = cpart.user_id
         WHERE cpart.contest_id = ?
         GROUP BY u.id, u.username, u.full_name
         ORDER BY total_points DESC, solved_count DESC, last_submission_time ASC
         LIMIT ? OFFSET ?`,
        [contestId, limit, offset]
      ),
      dbQueryOne(
        'SELECT COUNT(*) as total FROM contest_participants WHERE contest_id = ?',
        [contestId]
      )
    ]);

    return {
      leaderboard,
      pagination: {
        page,
        limit,
        total: countResult.total
      }
    };
  }

  /**
   * Get contest problems
   */
  async getContestProblems(contestId) {
    const problems = await dbQueryMany(
      `SELECT p.*, cp.points, cp.order_index
       FROM contest_problems cp
       JOIN problems p ON cp.problem_id = p.id
       WHERE cp.contest_id = ?
       ORDER BY cp.order_index ASC`,
      [contestId]
    );

    return problems;
  }
}

module.exports = new ContestService();
