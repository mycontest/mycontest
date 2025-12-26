/**
 * Contests Service
 * Database operations for contests
 */

const { dbQueryOne, dbQueryMany } = require("../../utils/mysql");

const fnGetAllContests = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [contests, count] = await Promise.all([
    dbQueryMany(
      `
            SELECT * FROM vw_global_contests
            ORDER BY start_time DESC
            LIMIT ? OFFSET ?
        `,
      [limit, offset]
    ),
    dbQueryOne("SELECT COUNT(*) as total FROM contests WHERE is_public = TRUE AND is_global = TRUE"),
  ]);

  return {
    contests,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

const fnGetContestById = async (contest_id) => {
  const contest = await dbQueryOne(
    `
        SELECT
            c.*,
            u.username as creator_name
        FROM contests c
        LEFT JOIN users u ON c.creator_id = u.user_id
        WHERE c.contest_id = ?
    `,
    [contest_id]
  );

  if (!contest) {
    throw new Error("Contest not found");
  }

  const problems = await dbQueryMany(
    `
        SELECT
            p.problem_id,
            p.title,
            p.slug,
            p.difficulty,
            cp.problem_order,
            COUNT(DISTINCT s.submission_id) as total_submissions,
            COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count
        FROM contest_problems cp
        JOIN problems p ON cp.problem_id = p.problem_id
        LEFT JOIN submissions s ON p.problem_id = s.problem_id
        WHERE cp.contest_id = ?
        GROUP BY p.problem_id, p.title, p.slug, p.difficulty, cp.problem_order
        ORDER BY cp.problem_order
    `,
    [contest_id]
  );

  return {
    ...contest,
    problems,
  };
};

const fnGetContestLeaderboard = async (contest_id) => {
  return await dbQueryMany(
    `
        SELECT
            u.user_id,
            u.username,
            u.full_name,
            SUM(s.score) as total_score,
            COUNT(DISTINCT s.problem_id) as problems_solved,
            MAX(s.submitted_at) as last_submission_time
        FROM submissions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.contest_id = ?
        GROUP BY u.user_id
        ORDER BY total_score DESC, last_submission_time ASC
        LIMIT 100
    `,
    [contest_id]
  );
};

module.exports = {
  fnGetAllContests,
  fnGetContestById,
  fnGetContestLeaderboard,
};
