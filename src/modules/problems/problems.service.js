/**
 * Problems Service
 */

const fs = require("fs");
const path = require("path");
const { dbQueryOne, dbQueryMany } = require("../../utils/mysql");

const resolveTestCaseValue = (value) => {
  if (!value) return "";
  const candidate_path = path.resolve(__dirname, "../../..", value);
  if (fs.existsSync(candidate_path)) {
    return {
      path: value,
      content: fs.readFileSync(candidate_path, "utf-8").trim(),
    };
  }
  return { path: String(value).trim(), content: String(value).trim() };
};

const fnGetAllProblems = async (page = 1, limit = 20, filters = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  const where = ["is_global = TRUE"];

  if (filters.search) {
    where.push("title LIKE ?");
    params.push(`%${filters.search}%`);
  }

  if (filters.difficulty) {
    where.push("difficulty = ?");
    params.push(filters.difficulty);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [problems, count] = await Promise.all([
    dbQueryMany(
      `
        SELECT problem_id, title, slug, difficulty, is_global, language_count, attempt_count, solved_count
        FROM vw_global_problems
        ${whereSql}
        ORDER BY problem_id DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    ),
    dbQueryOne(
      `
        SELECT COUNT(*) as total
        FROM vw_global_problems
        ${whereSql}
      `,
      params
    ),
  ]);

  return {
    problems,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

const fnGetProblemById = async (problem_id) => {
  const problem = await dbQueryOne(
    `
        SELECT p.*, u.username as creator_username
        FROM problems p
        LEFT JOIN users u ON p.created_by = u.user_id
        WHERE p.problem_id = ? AND p.is_active = TRUE
    `,
    [problem_id]
  );

  if (!problem) throw new Error("Problem not found");

  // Fetch languages and samples in parallel
  const [languages, samples_raw] = await Promise.all([
    dbQueryMany(
      `
            SELECT pl.*, l.lang_name, l.lang_code, l.file_extension
            FROM problem_languages pl
            JOIN languages l ON pl.lang_id = l.lang_id
            WHERE pl.problem_id = ? AND l.is_active = TRUE
        `,
      [problem_id]
    ),
    dbQueryMany(
      `
            SELECT input_data, expected_output
            FROM test_cases
            WHERE problem_id = ? AND is_sample = TRUE
            ORDER BY test_order
        `,
      [problem_id]
    ),
  ]);

  const samples = samples_raw.map((sample) => {
    const input = resolveTestCaseValue(sample.input_data);
    const output = resolveTestCaseValue(sample.expected_output);
    return {
      ...sample,
      input_path: input.path,
      output_path: output.path,
      input_data: input.content,
      expected_output: output.content,
    };
  });

  return { ...problem, languages, samples };
};

const fnGetTestCases = async (problem_id) => {
  const rows = await dbQueryMany(
    `
        SELECT test_id, input_data, expected_output, points
        FROM test_cases WHERE problem_id = ? ORDER BY test_order
    `,
    [problem_id]
  );
  return rows.map((row) => {
    const input = resolveTestCaseValue(row.input_data);
    const output = resolveTestCaseValue(row.expected_output);
    return {
      ...row,
      input_path: input.path,
      output_path: output.path,
      input_data: input.content,
      expected_output: output.content,
    };
  });
};

const fnSubmitSolution = async (user_id, problem_id, lang_id, code_body, contest_id = null) => {
  const test_count = await dbQueryOne("SELECT COUNT(*) as total FROM test_cases WHERE problem_id = ?", [problem_id]);

  const result = await dbQueryMany(
    `
        INSERT INTO submissions
        (user_id, problem_id, lang_id, code_body, contest_id, test_total, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `,
    [user_id, problem_id, lang_id, code_body, contest_id, test_count.total]
  );

  return { submission_id: result.insertId, test_total: test_count.total };
};

const fnGetSubmission = async (submission_id) => {
  return await dbQueryOne(
    `
        SELECT s.*, p.title as problem_title, u.username, l.lang_name
        FROM submissions s
        JOIN problems p ON s.problem_id = p.problem_id
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN languages l ON s.lang_id = l.lang_id
        WHERE s.submission_id = ?
    `,
    [submission_id]
  );
};

module.exports = {
  fnGetAllProblems,
  fnGetProblemById,
  fnGetTestCases,
  fnSubmitSolution,
  fnGetSubmission,
};
