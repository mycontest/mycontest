const { dbQueryOne, dbQueryMany } = require('../config/database');
const { PAGINATION } = require('../constants');

class ProblemService {
  /**
   * Get all problems with pagination and filters
   */
  async getProblems({ page = 1, limit = PAGINATION.DEFAULT_LIMIT, difficulty, search }) {
    const offset = (page - 1) * limit;
    let whereConditions = ['is_global = TRUE'];
    let params = [];

    if (difficulty) {
      whereConditions.push('difficulty = ?');
      params.push(difficulty);
    }

    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    const [problems, countResult] = await Promise.all([
      dbQueryMany(
        `SELECT id, title, description, difficulty, time_limit, memory_limit,
                created_at, updated_at
         FROM problems
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      dbQueryOne(
        `SELECT COUNT(*) as total FROM problems WHERE ${whereClause}`,
        params
      )
    ]);

    return {
      problems,
      pagination: {
        page,
        limit,
        total: countResult.total
      }
    };
  }

  /**
   * Get problem by ID
   */
  async getProblemById(problemId, userId = null) {
    const problem = await dbQueryOne(
      `SELECT p.*, u.username as author_username
       FROM problems p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [problemId]
    );

    if (!problem) {
      throw { statusCode: 404, message: 'Problem not found' };
    }

    // Get user's submission status if logged in
    if (userId) {
      const userStatus = await dbQueryOne(
        `SELECT
          COUNT(*) as attempts,
          MAX(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as solved
         FROM submissions
         WHERE problem_id = ? AND user_id = ?`,
        [problemId, userId]
      );

      problem.user_status = userStatus || { attempts: 0, solved: 0 };
    }

    return problem;
  }

  /**
   * Create new problem
   */
  async createProblem(problemData, userId) {
    const {
      title,
      description,
      difficulty,
      time_limit = 2000,
      memory_limit = 256,
      is_global = true
    } = problemData;

    const result = await dbQueryOne(
      `INSERT INTO problems
       (title, description, difficulty, time_limit, memory_limit, user_id, is_global, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, difficulty, time_limit, memory_limit, userId, is_global]
    );

    return this.getProblemById(result.insertId);
  }

  /**
   * Update problem
   */
  async updateProblem(problemId, updates, userId, isAdmin = false) {
    const problem = await dbQueryOne(
      'SELECT user_id FROM problems WHERE id = ?',
      [problemId]
    );

    if (!problem) {
      throw { statusCode: 404, message: 'Problem not found' };
    }

    // Check permission
    if (!isAdmin && problem.user_id !== userId) {
      throw { statusCode: 403, message: 'Not authorized to update this problem' };
    }

    const allowedFields = ['title', 'description', 'difficulty', 'time_limit', 'memory_limit', 'is_global'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (updateFields.length === 0) {
      throw { statusCode: 400, message: 'No valid fields to update' };
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);

    await dbQueryOne(
      `UPDATE problems SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, problemId]
    );

    return this.getProblemById(problemId);
  }

  /**
   * Delete problem
   */
  async deleteProblem(problemId, userId, isAdmin = false) {
    const problem = await dbQueryOne(
      'SELECT user_id FROM problems WHERE id = ?',
      [problemId]
    );

    if (!problem) {
      throw { statusCode: 404, message: 'Problem not found' };
    }

    // Check permission
    if (!isAdmin && problem.user_id !== userId) {
      throw { statusCode: 403, message: 'Not authorized to delete this problem' };
    }

    await dbQueryOne('DELETE FROM problems WHERE id = ?', [problemId]);

    return { message: 'Problem deleted successfully' };
  }

  /**
   * Get problem submissions
   */
  async getProblemSubmissions(problemId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const [submissions, countResult] = await Promise.all([
      dbQueryMany(
        `SELECT s.id, s.status, s.language_id, s.created_at,
                u.username, u.full_name
         FROM submissions s
         JOIN users u ON s.user_id = u.id
         WHERE s.problem_id = ?
         ORDER BY s.created_at DESC
         LIMIT ? OFFSET ?`,
        [problemId, limit, offset]
      ),
      dbQueryOne(
        'SELECT COUNT(*) as total FROM submissions WHERE problem_id = ?',
        [problemId]
      )
    ]);

    return {
      submissions,
      pagination: {
        page,
        limit,
        total: countResult.total
      }
    };
  }
}

module.exports = new ProblemService();
