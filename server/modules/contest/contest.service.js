const { dbQueryOne, dbQueryMany } = require("../../utils/mysql");
const { PAGINATION, CONTEST_STATUS } = require("../../utils/constants");

const fnGetContestStatus = (start_time, end_time) => {
  const now = new Date();
  if (now < new Date(start_time)) return CONTEST_STATUS.UPCOMING;
  if (now > new Date(end_time)) return CONTEST_STATUS.FINISHED;
  return CONTEST_STATUS.ONGOING;
};

const fnGetContests = async ({ page = 1, limit = PAGINATION.DEFAULT_LIMIT, status }) => {
  const offset = (page - 1) * limit;
  const where = ["is_public = TRUE"];
  const params = [];

  if (status === CONTEST_STATUS.UPCOMING) {
    where.push("start_time > NOW()");
  } else if (status === CONTEST_STATUS.ONGOING) {
    where.push("start_time <= NOW() AND end_time >= NOW()");
  } else if (status === CONTEST_STATUS.FINISHED) {
    where.push("end_time < NOW()");
  }

  const where_clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [contests, count_result] = await Promise.all([
    dbQueryMany(
      `
        SELECT c.contest_id AS id, c.title, c.description, c.start_time, c.end_time, c.is_public, c.is_global,
               u.username AS author_username
        FROM contests c
        LEFT JOIN users u ON c.creator_id = u.user_id
        ${where_clause}
        ORDER BY c.start_time ASC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    ),
    dbQueryOne(`SELECT COUNT(*) AS total FROM contests ${where_clause}`, params),
  ]);

  contests.forEach((contest) => {
    contest.status = fnGetContestStatus(contest.start_time, contest.end_time);
  });

  return {
    contests,
    pagination: {
      page,
      limit,
      total: count_result.total,
    },
  };
};

const fnGetContestById = async (contest_id) => {
  const contest = await dbQueryOne(
    `
      SELECT c.*, u.username AS author_username
      FROM contests c
      LEFT JOIN users u ON c.creator_id = u.user_id
      WHERE c.contest_id = ?
    `,
    [contest_id]
  );

  if (!contest) {
    throw { statusCode: 404, message: "Contest not found" };
  }

  contest.status = fnGetContestStatus(contest.start_time, contest.end_time);

  const problems_count = await dbQueryOne("SELECT COUNT(*) AS count FROM contest_problems WHERE contest_id = ?", [contest_id]);
  contest.problems_count = problems_count?.count || 0;

  return contest;
};

const fnCreateContest = async (contest_data, user_id) => {
  const { title, description, start_time, end_time, is_public = true, is_global = true } = contest_data;

  const result = await dbQueryOne(
    `
      INSERT INTO contests
      (title, description, creator_id, status, is_public, is_global, start_time, end_time, created_at)
      VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, NOW())
    `,
    [title, description, user_id, is_public, is_global, start_time, end_time]
  );

  return fnGetContestById(result.insertId);
};

const fnUpdateContest = async (contest_id, updates, user_id, is_admin = false) => {
  const contest = await dbQueryOne("SELECT creator_id FROM contests WHERE contest_id = ?", [contest_id]);

  if (!contest) {
    throw { statusCode: 404, message: "Contest not found" };
  }

  if (!is_admin && contest.creator_id !== user_id) {
    throw { statusCode: 403, message: "Not authorized to update this contest" };
  }

  const allowed_fields = ["title", "description", "start_time", "end_time", "is_public", "is_global", "status"];
  const update_fields = Object.keys(updates).filter((key) => allowed_fields.includes(key));

  if (update_fields.length === 0) {
    throw { statusCode: 400, message: "No valid fields to update" };
  }

  const set_clause = update_fields.map((field) => `${field} = ?`).join(", ");
  const values = update_fields.map((field) => updates[field]);

  await dbQueryOne(`UPDATE contests SET ${set_clause}, updated_at = NOW() WHERE contest_id = ?`, [...values, contest_id]);

  return fnGetContestById(contest_id);
};

const fnJoinContest = async (contest_id, user_id) => {
  // No participant table in current schema; just validate contest exists.
  await fnGetContestById(contest_id);
  return { message: "Joined contest (tracking not persisted in current schema)" };
};

const fnGetContestLeaderboard = async (contest_id, { page = 1, limit = 50 }) => {
  const offset = (page - 1) * limit;

  const [leaderboard, count_result] = await Promise.all([
    dbQueryMany(
      `
        SELECT
          u.user_id AS id,
          u.username,
          u.full_name,
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) AS problems_solved,
          SUM(CASE WHEN s.status = 'accepted' THEN s.score ELSE 0 END) AS total_score,
          MAX(s.submitted_at) AS last_submission_time
        FROM submissions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.contest_id = ?
        GROUP BY u.user_id, u.username, u.full_name
        ORDER BY total_score DESC, problems_solved DESC, last_submission_time ASC
        LIMIT ? OFFSET ?
      `,
      [contest_id, limit, offset]
    ),
    dbQueryOne("SELECT COUNT(DISTINCT user_id) AS total FROM submissions WHERE contest_id = ?", [contest_id]),
  ]);

  return {
    leaderboard,
    pagination: {
      page,
      limit,
      total: count_result.total,
    },
  };
};

const fnGetContestProblems = async (contest_id) => {
  const problems = await dbQueryMany(
    `
      SELECT p.problem_id AS id, p.title, p.slug, p.difficulty, cp.problem_order
      FROM contest_problems cp
      JOIN problems p ON cp.problem_id = p.problem_id
      WHERE cp.contest_id = ?
      ORDER BY cp.problem_order ASC
    `,
    [contest_id]
  );

  return problems;
};

module.exports = {
  fnGetContestStatus,
  fnGetContests,
  fnGetContestById,
  fnCreateContest,
  fnUpdateContest,
  fnJoinContest,
  fnGetContestLeaderboard,
  fnGetContestProblems,
};
