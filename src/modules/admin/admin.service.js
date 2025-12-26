const { dbQueryOne, dbQueryMany, dbTransaction } = require("../../utils/mysql");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const TEST_CASE_ROOT = path.join(__dirname, "../../../data/storage/test_cases");

const fnCreateProblem = async (problem_data, test_zip_buffer) => {
  const temp_path = path.join(__dirname, "../../../temp", "upload_" + Date.now());
  const { title, slug, difficulty, description, input_format, output_format, constraints, time_limit, memory_limit, created_by } = problem_data;

  const zip = new AdmZip(test_zip_buffer);
  zip.extractAllTo(temp_path, true);

  const input_dir = path.join(temp_path, "input");
  const output_dir = path.join(temp_path, "output");

  if (!fs.existsSync(input_dir) || !fs.existsSync(output_dir)) {
    fs.rmSync(temp_path, { recursive: true, force: true });
    throw new Error("ZIP must contain input/ and output/ folders");
  }

  const input_files = fs
    .readdirSync(input_dir)
    .filter((f) => f.endsWith(".txt"))
    .sort();
  const output_files = fs
    .readdirSync(output_dir)
    .filter((f) => f.endsWith(".txt"))
    .sort();

  if (input_files.length !== output_files.length || input_files.length === 0) {
    fs.rmSync(temp_path, { recursive: true, force: true });
    throw new Error("Invalid test cases");
  }

  const result = await dbTransaction(async (conn) => {
    const [problem_result] = await conn.execute(
      `
            INSERT INTO problems (title, slug, difficulty, description, input_format, output_format, constraints, time_limit, memory_limit, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [title, slug, difficulty, description, input_format, output_format, constraints, time_limit, memory_limit, created_by]
    );

    const problem_id = problem_result.insertId;

    // Persist test cases to data/storage/test_cases/<problem_id>/...
    const problem_test_root = path.join(TEST_CASE_ROOT, String(problem_id));
    const input_dest_dir = path.join(problem_test_root, "input");
    const output_dest_dir = path.join(problem_test_root, "output");
    fs.mkdirSync(input_dest_dir, { recursive: true });
    fs.mkdirSync(output_dest_dir, { recursive: true });

    for (let i = 0; i < input_files.length; i++) {
      const input_src = path.join(input_dir, input_files[i]);
      const output_src = path.join(output_dir, output_files[i]);

      const input_dest = path.join(input_dest_dir, input_files[i]);
      const output_dest = path.join(output_dest_dir, output_files[i]);

      fs.copyFileSync(input_src, input_dest);
      fs.copyFileSync(output_src, output_dest);

      const input_path = path.relative(path.join(__dirname, "../../../"), input_dest);
      const output_path = path.relative(path.join(__dirname, "../../../"), output_dest);

      await conn.execute(
        `
                INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample, points, test_order)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
        [problem_id, input_path, output_path, i < 2, 10, i + 1]
      );
    }

    return { problem_id, test_count: input_files.length };
  });

  fs.rmSync(temp_path, { recursive: true, force: true });
  return result;
};

const fnAddProblemLanguage = async (problem_id, lang_id, template_code) => {
  await dbQueryMany("INSERT INTO problem_languages (problem_id, lang_id, template_code) VALUES (?, ?, ?)", [problem_id, lang_id, template_code]);
  return true;
};

const fnAddLanguage = async (lang_data) => {
  const { lang_name, lang_code, file_extension, compile_command, run_command } = lang_data;
  const result = await dbQueryMany("INSERT INTO languages (lang_name, lang_code, file_extension, compile_command, run_command) VALUES (?, ?, ?, ?, ?)", [lang_name, lang_code, file_extension, compile_command || null, run_command]);
  return { lang_id: result.insertId };
};

const fnGetAllLanguages = async (page = 1, limit = 30) => {
  const offset = (page - 1) * limit;

  const [languages, count] = await Promise.all([dbQueryMany("SELECT * FROM languages ORDER BY lang_name LIMIT ? OFFSET ?", [limit, offset]), dbQueryOne("SELECT COUNT(*) as total FROM languages")]);

  return {
    languages,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

const fnToggleLanguage = async (lang_id) => {
  await dbQueryMany("UPDATE languages SET is_active = NOT is_active WHERE lang_id = ?", [lang_id]);
  return true;
};

const fnGetAllUsers = async (page = 1, limit = 30) => {
  const offset = (page - 1) * limit;

  const [users, count] = await Promise.all([dbQueryMany("SELECT user_id, username, email, full_name, role, subscription, total_score, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]), dbQueryOne("SELECT COUNT(*) as total FROM users")]);

  return {
    users,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

const fnGetDashboardStats = async () => {
  // Fetch all counts in parallel for better performance
  const [users, problems, submissions, recent_submissions] = await Promise.all([
    dbQueryOne("SELECT COUNT(*) as total FROM users"),
    dbQueryOne("SELECT COUNT(*) as total FROM problems WHERE is_active = TRUE"),
    dbQueryOne("SELECT COUNT(*) as total FROM submissions"),
    dbQueryMany(
      "SELECT s.submission_id, s.status, s.submitted_at, u.username, p.title as problem_title, l.lang_name FROM submissions s JOIN users u ON s.user_id = u.user_id JOIN problems p ON s.problem_id = p.problem_id LEFT JOIN languages l ON s.lang_id = l.lang_id ORDER BY s.submitted_at DESC LIMIT 10"
    ),
  ]);

  return {
    total_users: users.total,
    total_problems: problems.total,
    total_submissions: submissions.total,
    recent_submissions,
  };
};

const fnToggleProblemGlobal = async (problem_id) => {
  await dbQueryMany("UPDATE problems SET is_global = NOT is_global WHERE problem_id = ?", [problem_id]);
  return true;
};

const fnToggleContestGlobal = async (contest_id) => {
  await dbQueryMany("UPDATE contests SET is_global = NOT is_global WHERE contest_id = ?", [contest_id]);
  return true;
};

const fnGetAllProblems = async (page = 1, limit = 30) => {
  const offset = (page - 1) * limit;

  const [problems, count] = await Promise.all([
    dbQueryMany("SELECT problem_id, title, slug, difficulty, is_global, is_active, created_at FROM problems ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]),
    dbQueryOne("SELECT COUNT(*) as total FROM problems"),
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

module.exports = {
  fnCreateProblem,
  fnAddProblemLanguage,
  fnAddLanguage,
  fnGetAllLanguages,
  fnToggleLanguage,
  fnGetAllUsers,
  fnGetDashboardStats,
  fnToggleProblemGlobal,
  fnToggleContestGlobal,
  fnGetAllProblems,
};
