const { dbQueryOne, dbQueryMany } = require("../../shared/utils/mysql");
const { asyncHandler } = require("../../shared/utils/handler");

// Dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const stats = {
    users: (await dbQueryOne("SELECT COUNT(*) as c FROM users")).c,
    problems: (await dbQueryOne("SELECT COUNT(*) as c FROM problem_details")).c,
    contests: (await dbQueryOne("SELECT COUNT(*) as c FROM contest_details")).c,
    submissions: (await dbQueryOne("SELECT COUNT(*) as c FROM problem_submissions")).c,
  };

  // Recent items for quick access
  const recent_problems = await dbQueryMany("SELECT * FROM problem_details ORDER BY id DESC LIMIT 5");
  const recent_contests = await dbQueryMany("SELECT * FROM contest_details ORDER BY id DESC LIMIT 5");

  res.render("layout", {
    page: "admin/dashboard",
    navbar: "admin",
    title: "Admin Dashboard",
    user: req.session.user,
    stats,
    recent_problems,
    recent_contests,
  });
});

exports.getUserList = asyncHandler(async (req, res) => {
  const users = await dbQueryMany("SELECT * FROM users ORDER BY id DESC");
  res.render("layout", { page: "admin/user_list", navbar: "admin", title: "Users", users });
});

// Problems
exports.getProblemList = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;

  const count_result = await dbQueryOne("SELECT COUNT(*) as c FROM problem_details");
  const total_problems = count_result.c;
  const total_pages = Math.ceil(total_problems / limit);

  const problems = await dbQueryMany("SELECT * FROM problem_details ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offset]);

  res.render("layout", { page: "admin/problem_list", navbar: "admin", title: "Problems", problems, current_page: page, total_pages });
});

exports.getAddProblem = asyncHandler(async (req, res) => {
  res.render("layout", { page: "admin/problem_add", navbar: "admin", title: "Add Problem" });
});

exports.postAddProblem = asyncHandler(async (req, res) => {
  const { name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment, is_public } = req.body;
  const is_public_value = is_public === "on" ? 1 : 0;
  await dbQueryMany(
    `INSERT INTO problem_details 
        (name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment, is_public) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, content, points, input_format, output_format, time_ms, memory_kb, test_public || 0, test_all || 0, comment, is_public_value],
  );
  req.session.success = "Problem added successfully";
  res.redirect("/admin/problems");
});

exports.getEditProblem = asyncHandler(async (req, res) => {
  const problem = await dbQueryOne("SELECT * FROM problem_details WHERE id = ?", [req.params.id]);
  if (!problem) return res.redirect("/admin");
  res.render("layout", { page: "admin/problem_edit", navbar: "admin", title: "Edit Problem", problem });
});

exports.postEditProblem = asyncHandler(async (req, res) => {
  const { name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment, is_public } = req.body;
  const is_public_value = is_public === "on" ? 1 : 0;
  await dbQueryMany(
    `UPDATE problem_details 
      SET name=?, content=?, points=?, input_format=?, output_format=?, time_ms=?, memory_kb=?, test_public=?, test_all=?, comment=?, is_public=? 
      WHERE id = ?`,
    [name, content, points, input_format, output_format, time_ms, memory_kb, test_public || 0, test_all || 0, comment, is_public_value, req.params.id],
  );
  req.session.success = "Problem updated successfully";
  res.redirect("/admin/problems");
});

exports.getProblemLanguages = asyncHandler(async (req, res) => {
  const problem = await dbQueryOne("SELECT * FROM problem_details WHERE id = ?", [req.params.id]);
  const all_languages = await dbQueryMany("SELECT * FROM languages");
  const active_languages = await dbQueryMany("SELECT * FROM problem_languages WHERE problem_id = ?", [req.params.id]);

  const active_map = {};
  active_languages.forEach((l) => (active_map[l.language_id] = l));

  res.render("layout", { page: "admin/problem_languages", navbar: "admin", title: "Problem Languages", problem, all_languages, active_map });
});

exports.postProblemLanguages = asyncHandler(async (req, res) => {
  const { language_id, default_code, action } = req.body;
  const problem_id = req.params.id;

  if (action === "add") {
    // Check if exists
    const exists = await dbQueryOne("SELECT * FROM problem_languages WHERE problem_id=? AND language_id=?", [problem_id, language_id]);
    if (exists) {
      await dbQueryMany("UPDATE problem_languages SET default_code=? WHERE id=?", [default_code, exists.id]);
    } else {
      await dbQueryMany("INSERT INTO problem_languages (problem_id, language_id, default_code) VALUES (?, ?, ?)", [problem_id, language_id, default_code]);
    }
  } else if (action === "remove") {
    await dbQueryMany("DELETE FROM problem_languages WHERE problem_id=? AND language_id=?", [problem_id, language_id]);
  }

  res.redirect(`/admin/problems/${problem_id}/languages`);
});

// Contests
exports.getContestList = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;

  const count_result = await dbQueryOne("SELECT COUNT(*) as c FROM contest_details");
  const total_contests = count_result.c;
  const total_pages = Math.ceil(total_contests / limit);

  const contests = await dbQueryMany("SELECT * FROM contest_details ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offset]);

  res.render("layout", { page: "admin/contest_list", navbar: "admin", title: "Contests", contests, current_page: page, total_pages });
});

exports.getAddContest = asyncHandler(async (req, res) => {
  res.render("layout", { page: "admin/contest_add", navbar: "admin", title: "Add Contest" });
});

exports.postAddContest = asyncHandler(async (req, res) => {
  const { name, content, type, start_date, duration_min } = req.body;
  await dbQueryMany(`INSERT INTO contest_details (name, content, type, start_date, duration_min)  VALUES (?, ?, ?, ?, ?)`, [name, content, type, start_date, duration_min]);
  req.session.success = "Contest added successfully";
  res.redirect("/admin/contests");
});

exports.getEditContest = asyncHandler(async (req, res) => {
  const contest = await dbQueryOne("SELECT * FROM contest_details WHERE id = ?", [req.params.id]);
  if (!contest) return res.redirect("/admin");
  res.render("layout", { page: "admin/contest_edit", navbar: "admin", title: "Edit Contest", contest });
});

exports.postEditContest = asyncHandler(async (req, res) => {
  const { name, content, type, start_date, duration_min } = req.body;
  await dbQueryMany(`UPDATE contest_details SET name=?, content=?, type=?, start_date=?, duration_min=? WHERE id=?`, [name, content, type, start_date, duration_min, req.params.id]);
  req.session.success = "Contest updated successfully";
  res.redirect("/admin/contests");
});

exports.getContestProblems = asyncHandler(async (req, res) => {
  const contest = await dbQueryOne("SELECT * FROM contest_details WHERE id = ?", [req.params.id]);
  const added_problems = await dbQueryMany(
    `SELECT cp.*, pd.name FROM contest_problems cp 
         JOIN problem_details pd ON cp.problem_id = pd.id 
         WHERE cp.contest_id = ?`,
    [req.params.id],
  );
  const all_problems = await dbQueryMany("SELECT * FROM problem_details");
  res.render("layout", { page: "admin/contest_problems", navbar: "admin", title: "Contest Problems", contest, added_problems, all_problems });
});

exports.postContestProblems = asyncHandler(async (req, res) => {
  const { problem_id, action } = req.body;
  const contest_id = req.params.id;
  if (action === "add") {
    const exists = await dbQueryOne("SELECT * FROM contest_problems WHERE contest_id=? AND problem_id=?", [contest_id, problem_id]);
    if (!exists) {
      await dbQueryMany("INSERT INTO contest_problems (contest_id, problem_id) VALUES (?, ?)", [contest_id, problem_id]);
    }
  } else if (action === "remove") {
    await dbQueryMany("DELETE FROM contest_problems WHERE contest_id=? AND problem_id=?", [contest_id, problem_id]);
  }
  res.redirect(`/admin/contests/${contest_id}/problems`);
});

exports.getContestParticipants = asyncHandler(async (req, res) => {
  const contest = await dbQueryOne("SELECT * FROM contest_details WHERE id = ?", [req.params.id]);
  const participants = await dbQueryMany(`SELECT cp.*, u.username, u.email FROM contest_participants cp JOIN users u ON cp.user_id = u.id WHERE cp.contest_id = ?`, [req.params.id]);
  res.render("layout", { page: "admin/contest_participants", navbar: "admin", title: "Contest Participants", contest, participants });
});

exports.postContestParticipants = asyncHandler(async (req, res) => {
  const { username, action, user_id } = req.body;
  const contestId = req.params.id;

  if (action === "add") {
    const user = await dbQueryOne("SELECT * FROM users WHERE username = ?", [username]);
    if (user) {
      const exists = await dbQueryOne("SELECT * FROM contest_participants WHERE contest_id=? AND user_id=?", [contestId, user.id]);
      if (!exists) {
        await dbQueryMany("INSERT INTO contest_participants (contest_id, user_id) VALUES (?, ?)", [contestId, user.id]);
        req.session.success = `User ${username} added.`;
      } else {
        req.session.error = `User ${username} already assigned.`;
      }
    } else {
      req.session.error = `User ${username} not found.`;
    }
  } else if (action === "remove") {
    await dbQueryMany("DELETE FROM contest_participants WHERE contest_id=? AND user_id=?", [contestId, user_id]);
    req.session.success = "Participant removed.";
  }
  res.redirect(`/admin/contests/${contestId}/participants`);
});
