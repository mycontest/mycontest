const { dbQueryOne, dbQueryMany } = require("../../utils/mysql");
const { PAGINATION } = require("../../utils/constants");

const fnGetProblems = async ({ page = 1, limit = PAGINATION.DEFAULT_LIMIT, difficulty, search }) => {
  const offset = (page - 1) * limit;
  const where = ["is_global = TRUE", "is_active = TRUE"];
  const params = [];

  if (difficulty) {
    where.push("difficulty = ?");
    params.push(difficulty);
  }

  if (search) {
    where.push("(title LIKE ? OR description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where_clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [problems, count_result] = await Promise.all([
    dbQueryMany(
      `
        SELECT problem_id AS id, title, slug, difficulty, time_limit, memory_limit, is_global, created_at FROM problems
        ${where_clause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    ),
    dbQueryOne(`SELECT COUNT(*) AS total FROM problems ${whereClause}`, params),
  ]);

  return {
    problems,
    pagination: { page, limit, total: count_result.total },
  };
};

const fnGetProblemById = async (problem_id, user_id = null) => {
  const problem = await dbQueryOne(
    `
      SELECT p.*, u.username AS author_username
      FROM problems p
      LEFT JOIN users u ON p.created_by = u.user_id
      WHERE p.problem_id = ?
    `,
    [problem_id]
  );

  if (!problem) {
    throw { statusCode: 404, message: "Problem not found" };
  }

  if (user_id) {
    const userStatus = await dbQueryOne(
      `SELECT
        COUNT(*) AS attempts,
        MAX(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS solved
      FROM submissions
      WHERE problem_id = ? AND user_id = ?`,
      [problem_id, user_id]
    );
    problem.user_status = userStatus || { attempts: 0, solved: 0 };
  }

  return problem;
};

const fnCreateProblem = async (problemData, user_id) => {
  const { title, slug, description, difficulty, time_limit = 2000, memory_limit = 256, is_global = true } = problemData;

  const safeSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const result = await dbQueryOne(
    `
      INSERT INTO problems
      (title, slug, description, difficulty, time_limit, memory_limit, created_by, is_global, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
    `,
    [title, safeSlug, description, difficulty, time_limit, memory_limit, user_id, is_global]
  );

  return fnGetProblemById(result.insertId);
};

const fnUpdateProblem = async (problem_id, updates, user_id, isAdmin = false) => {
  const problem = await dbQueryOne("SELECT created_by FROM problems WHERE problem_id = ?", [problem_id]);

  if (!problem) {
    throw { statusCode: 404, message: "Problem not found" };
  }

  if (!isAdmin && problem.created_by !== user_id) {
    throw { statusCode: 403, message: "Not authorized to update this problem" };
  }

  const allowedFields = ["title", "slug", "description", "difficulty", "time_limit", "memory_limit", "is_global", "is_active"];
  const updateFields = Object.keys(updates).filter((key) => allowedFields.includes(key));

  if (updateFields.length === 0) {
    throw { statusCode: 400, message: "No valid fields to update" };
  }

  const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
  const values = updateFields.map((field) => updates[field]);

  await dbQueryOne(`UPDATE problems SET ${setClause}, updated_at = NOW() WHERE problem_id = ?`, [...values, problem_id]);

  return fnGetProblemById(problem_id);
};

const fnDeleteProblem = async (problem_id, user_id, isAdmin = false) => {
  const problem = await dbQueryOne("SELECT created_by FROM problems WHERE problem_id = ?", [problem_id]);

  if (!problem) {
    throw { statusCode: 404, message: "Problem not found" };
  }

  if (!isAdmin && problem.created_by !== user_id) {
    throw { statusCode: 403, message: "Not authorized to delete this problem" };
  }

  await dbQueryOne("DELETE FROM problems WHERE problem_id = ?", [problem_id]);

  return { message: "Problem deleted successfully" };
};

const fnGetProblemSubmissions = async (problem_id, { page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const [submissions, countResult] = await Promise.all([
    dbQueryMany(
      `
        SELECT s.submission_id AS id, s.status, s.lang_id, s.submitted_at,
               u.username, u.full_name
        FROM submissions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.problem_id = ?
        ORDER BY s.submitted_at DESC
        LIMIT ? OFFSET ?
      `,
      [problem_id, limit, offset]
    ),
    dbQueryOne("SELECT COUNT(*) AS total FROM submissions WHERE problem_id = ?", [problem_id]),
  ]);

  return {
    submissions,
    pagination: {
      page,
      limit,
      total: countResult.total,
    },
  };
};

module.exports = {
  fnGetProblems,
  fnGetProblemById,
  fnCreateProblem,
  fnUpdateProblem,
  fnDeleteProblem,
  fnGetProblemSubmissions,
};
