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
  const recentProblems = await dbQueryMany("SELECT * FROM problem_details ORDER BY id DESC LIMIT 5");
  const recentContests = await dbQueryMany("SELECT * FROM contest_details ORDER BY id DESC LIMIT 5");

  res.render("layout", {
    page: "admin/dashboard",
    navbar: "admin",
    title: "Admin Dashboard",
    user: req.session.user,
    stats,
    recentProblems,
    recentContests,
  });
});

exports.getUserList = asyncHandler(async (req, res) => {
  const users = await dbQueryMany("SELECT * FROM users ORDER BY id DESC");
  res.render("layout", { page: "admin/user_list", navbar: "admin", title: "Users", users });
});

// Problems
exports.getAddProblem = asyncHandler(async (req, res) => {
  res.render("layout", {
    page: "admin/problem_add",
    navbar: "admin",
    title: "Add Problem",
    user: req.session.user,
  });
});

exports.postAddProblem = asyncHandler(async (req, res) => {
  const { name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment } = req.body;
  await dbQueryMany(
    `INSERT INTO problem_details 
        (name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment],
  );
  req.session.success = "Problem added successfully";
  res.redirect("/admin");
});

exports.getEditProblem = asyncHandler(async (req, res) => {
  const problem = await dbQueryOne("SELECT * FROM problem_details WHERE id = ?", [req.params.id]);
  if (!problem) return res.redirect("/admin");
  res.render("layout", { page: "admin/problem_edit", navbar: "admin", title: "Edit Problem", problem });
});

exports.postEditProblem = asyncHandler(async (req, res) => {
  const { name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment } = req.body;
  await dbQueryMany(
    `UPDATE problem_details SET 
        name=?, content=?, points=?, input_format=?, output_format=?, time_ms=?, memory_kb=?, test_public=?, test_all=?, comment=? 
        WHERE id=?`,
    [name, content, points, input_format, output_format, time_ms, memory_kb, test_public, test_all, comment, req.params.id],
  );
  req.session.success = "Problem updated successfully";
  res.redirect("/admin");
});

exports.getProblemLanguages = asyncHandler(async (req, res) => {
  const problem = await dbQueryOne("SELECT * FROM problem_details WHERE id = ?", [req.params.id]);
  const allLanguages = await dbQueryMany("SELECT * FROM languages");
  const activeLanguages = await dbQueryMany("SELECT * FROM problem_languages WHERE problem_id = ?", [req.params.id]);

  // Map active languages for easy lookup
  const activeMap = {};
  activeLanguages.forEach((l) => (activeMap[l.language_id] = l));

  res.render("layout", { page: "admin/problem_languages", navbar: "admin", title: "Problem Languages", problem, allLanguages, activeMap });
});

exports.postProblemLanguages = asyncHandler(async (req, res) => {
  const { language_id, default_code, action } = req.body;
  const problemId = req.params.id;

  if (action === "add") {
    // Check if exists
    const exists = await dbQueryOne("SELECT * FROM problem_languages WHERE problem_id=? AND language_id=?", [problemId, language_id]);
    if (exists) {
      await dbQueryMany("UPDATE problem_languages SET default_code=? WHERE id=?", [default_code, exists.id]);
    } else {
      await dbQueryMany("INSERT INTO problem_languages (problem_id, language_id, default_code) VALUES (?, ?, ?)", [problemId, language_id, default_code]);
    }
  } else if (action === "remove") {
    await dbQueryMany("DELETE FROM problem_languages WHERE problem_id=? AND language_id=?", [problemId, language_id]);
  }

  res.redirect(`/admin/problems/${problemId}/languages`);
});

// Contests
exports.getAddContest = asyncHandler(async (req, res) => {
  res.render("layout", {
    page: "admin/contest_add",
    navbar: "admin",
    title: "Add Contest",
    user: req.session.user,
  });
});

exports.postAddContest = asyncHandler(async (req, res) => {
  const { name, content, type, start_date, duration_min } = req.body;
  await dbQueryMany(
    `INSERT INTO contest_details (name, content, type, start_date, duration_min) 
        VALUES (?, ?, ?, ?, ?)`,
    [name, content, type, start_date, duration_min],
  );
  req.session.success = "Contest added successfully";
  res.redirect("/admin");
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
  res.redirect("/admin");
});

exports.getContestProblems = asyncHandler(async (req, res) => {
  const contest = await dbQueryOne("SELECT * FROM contest_details WHERE id = ?", [req.params.id]);
  const addedProblems = await dbQueryMany(
    `SELECT cp.*, pd.name FROM contest_problems cp 
         JOIN problem_details pd ON cp.problem_id = pd.id 
         WHERE cp.contest_id = ?`,
    [req.params.id],
  );
  const allProblems = await dbQueryMany("SELECT * FROM problem_details");

  res.render("layout", { page: "admin/contest_problems", navbar: "admin", title: "Contest Problems", contest, addedProblems, allProblems });
});

exports.postContestProblems = asyncHandler(async (req, res) => {
  const { problem_id, action } = req.body;
  const contestId = req.params.id;

  if (action === "add") {
    const exists = await dbQueryOne("SELECT * FROM contest_problems WHERE contest_id=? AND problem_id=?", [contestId, problem_id]);
    if (!exists) {
      await dbQueryMany("INSERT INTO contest_problems (contest_id, problem_id) VALUES (?, ?)", [contestId, problem_id]);
    }
  } else if (action === "remove") {
    await dbQueryMany("DELETE FROM contest_problems WHERE contest_id=? AND problem_id=?", [contestId, problem_id]);
  }
  res.redirect(`/admin/contests/${contestId}/problems`);
});

exports.getContestParticipants = asyncHandler(async (req, res) => {
  const contest = await dbQueryOne("SELECT * FROM contest_details WHERE id = ?", [req.params.id]);
  const participants = await dbQueryMany(
    `SELECT cp.*, u.username, u.email FROM contest_participants cp 
         JOIN users u ON cp.user_id = u.id 
         WHERE cp.contest_id = ?`,
    [req.params.id],
  );
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
