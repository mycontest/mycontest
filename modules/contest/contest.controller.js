const { dbQueryOne, dbQueryMany } = require("../../shared/mysql");
const { fnReadPublicTests, fnGetRatingBoard, fnGetProblemsQuery } = require("../../shared/helpers");
const { fnAddToQueue } = require("../../checker/worker");

// Middleware-like helper to check participation
async function checkAccess(req, res, contest) {
  const user_id = req.user_id;
  const is_admin = req.user?.role === "admin";

  // 1. Check if started (admins bypass)
  if (contest.event_num == 0 && !is_admin) {
    return { allowed: false, redirect: `/contest/${contest.contest_id}`, message: "Musobaqa hali boshlanmadi" };
  }

  // 2. Check participation (admins bypass)
  if (!is_admin) {
    if (!user_id) return { allowed: false, redirect: "/sign-in", message: "Tizimga kiring" };

    const participant = await dbQueryOne("SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?", [contest.contest_id, user_id]);
    if (!participant) {
      // If public, they need to join first. If private, they have no access.
      return { allowed: false, redirect: `/contest/${contest.contest_id}`, message: "Musobaqada qatnashish uchun qo'shiling" };
    }
  }

  return { allowed: true };
}

exports.fnContestHome = async (req, res) => {
  const contest_id = req.contest_id;
  const user_id = req.user_id;
  const is_admin = req.user?.role === "admin";
  let is_participant = false;

  if (user_id) {
    const p = await dbQueryOne("SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?", [contest_id, user_id]);
    if (p) is_participant = true;
  }

  res.render("pages/contest", { page_info: "contest", contest: req.contest, is_participant, is_admin });
};

exports.fnJoinContest = async (req, res) => {
  try {
    const contest_id = req.contest_id;
    const user_id = req.user_id;

    if (!user_id) return res.redirect("/sign-in");

    // Only allow joining public contests via this route
    if (req.contest.contest_type === "private") {
      req.flash("error", "Yopiq musobaqaga faqat taklifnoma orqali kirish mumkin.");
      return res.redirect(`/contest/${contest_id}`);
    }

    await dbQueryMany("INSERT IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)", [contest_id, user_id]);
    req.flash("success", "Siz musobaqaga qo'shildingiz!");
    res.redirect(`/contest/${contest_id}/problems`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/contest/${req.contest_id}`);
  }
};

exports.fnParticipantsPage = async (req, res) => {
  const contest_id = req.contest_id;
  const participants = await dbQueryMany(
    `SELECT u.username, u.full_name, cp.created_dt 
     FROM contest_participants cp 
     JOIN users u ON cp.user_id = u.user_id 
     WHERE cp.contest_id = ? 
     ORDER BY cp.created_dt DESC`,
    [contest_id]
  );

  // Decide who can see this page? Usually everyone or just participants.
  // User asked for "participantlar list chiqarilsin ham yan bir tab", implying visibility.

  res.render("pages/participants", { page_info: "participants", contest: req.contest, participants });
};

exports.fnProblemsPage = async (req, res) => {
  const access = await checkAccess(req, res, req.contest);
  if (!access.allowed) {
    if (access.message) req.flash("error", access.message);
    return res.redirect(access.redirect);
  }

  let contest_id = req.contest_id;
  let user_id = req.user_id;

  let problems = await dbQueryMany(fnGetProblemsQuery(), [user_id, contest_id]);
  res.render("pages/problems", { page_info: "problems", contest: req.contest, problems });
};

exports.fnProblemPage = async (req, res) => {
  try {
    const access = await checkAccess(req, res, req.contest);
    if (!access.allowed) {
      if (access.message) req.flash("error", access.message);
      return res.redirect(access.redirect);
    }

    let contest_id = req.contest_id;
    let user_id = req.user_id;
    let problem_id = req.query.problem_id;

    let [problem, languages, attempts] = await Promise.all([
      dbQueryOne(
        `SELECT t.*, ct.contest_id 
        FROM problems t 
        JOIN contest_problems ct ON t.problem_id = ct.problem_id 
        WHERE ct.contest_id=? AND t.problem_id = ?`,
        [contest_id, problem_id]
      ),
      dbQueryMany("SELECT * FROM languages WHERE group_id in (select group_id from vw_problems where contest_id = ? and problem_id = ?)", [contest_id, problem_id]),
      dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? AND problem_id = ? AND user_id = ? ORDER BY attempt_id DESC", [contest_id, problem_id, user_id]),
    ]);

    if (problem) problem.public_tests = await fnReadPublicTests(problem);
    res.render("pages/problem", { page_info: "problem", contest: req.contest, problem, languages, attempts });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect(`/contest/${req.contest_id}`);
  }
};

exports.fnProblemSubmit = async (req, res) => {
  try {
    const access = await checkAccess(req, res, req.contest);
    if (!access.allowed) return res.redirect(access.redirect);

    const { problem_id, language, code } = req.body;
    let contest_id = req.contest_id;
    let contest = req.contest;
    let user_id = req.user_id;

    let [problem, languages] = await Promise.all([
      dbQueryOne(`SELECT * FROM vw_problems WHERE contest_id = ? and problem_id = ? `, [contest_id, problem_id]),
      dbQueryOne("SELECT * FROM languages WHERE group_id in (select group_id from vw_problems where problem_id = ? and contest_id = ?) and editor_mode = ?", [problem_id, contest_id, language]),
    ]);

    if (!languages) {
      req.flash("error", "Dasturlash tili tanlanmagan!");
      return res.redirect(`/contest/${contest_id}`);
    }

    if (contest.event_num != 1 || !problem) {
      // Should be covered by checkAccess but double check strict LIVE event requirement for submission
      // If event_num != 1 (Live), usually submission is disabled or allowed as practice (upsolving).
      // User said "contest boshlanmasa ham savolarni chiqarib beropsan" -> Blocking VIEWING.
      // Submission usually allowed only when live or upsolving.
      if (contest.event_num == 0 && req.user?.role !== "admin") return res.redirect(`/contest/${contest_id}`);
    }

    let ins = await dbQueryMany("INSERT INTO attempts (problem_id, user_id, contest_id, language_used, code) values (?, ?, ?, ?, ?)", [problem_id, user_id, contest_id, languages.language_name, code]);

    fnAddToQueue(ins.insertId, contest_id, problem_id, languages.language_id, code);

    res.redirect(`/contest/${contest_id}/problem?problem_id=${problem_id}#footer`);
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect(`/contest/${req.contest_id}`);
  }
};

exports.fnAttemptsPage = async (req, res) => {
  const access = await checkAccess(req, res, req.contest);
  if (!access.allowed) return res.redirect(access.redirect);

  res.render("pages/attempts", { page_info: "attempts", contest: req.contest });
};

exports.fnAttemptsAll = async (req, res) => {
  try {
    const access = await checkAccess(req, res, req.contest);
    if (!access.allowed) return res.json([]);

    let contest_id = req.contest_id;
    let page = Math.max(0, req.query.page || 0);
    let data = await dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? ORDER BY attempt_id desc LIMIT ?, 20", [contest_id, page * 20]);
    res.json(data);
  } catch (err) {
    return res.json([]);
  }
};

exports.fnAttemptsOne = async (req, res) => {
  try {
    const access = await checkAccess(req, res, req.contest);
    if (!access.allowed) return res.json([]);

    let contest_id = req.contest_id;
    let user_id = req.user_id;
    let problem_id = req.query.problem_id;
    let page = Math.max(0, req.query.page || 0);

    let data = await dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? and problem_id = ? and user_id = ? ORDER BY attempt_id desc LIMIT ?, 10", [contest_id, problem_id, user_id, page * 10]);
    res.json(data);
  } catch (err) {
    return res.json([]);
  }
};

exports.fnRatingPage = async (req, res) => {
  const access = await checkAccess(req, res, req.contest);
  if (!access.allowed) return res.redirect(access.redirect);

  res.render("pages/rating", { page_info: "ratings", contest: req.contest });
};

exports.fnRatingAll = async (req, res) => {
  try {
    const access = await checkAccess(req, res, req.contest);
    if (!access.allowed) return res.json({ ratings: [], count: 0 });

    let contest_id = req.contest_id;
    let contest = req.contest;
    let user_id = req.user_id;

    let count = (await dbQueryOne(`SELECT count(*) as count FROM vw_problems WHERE contest_id = ?`, [contest_id])).count;
    let problems = await dbQueryMany(`SELECT name, problem_id FROM vw_problems WHERE contest_id = ?`, [contest_id]);
    let ratings = (await dbQueryMany(fnGetRatingBoard(problems), [contest.start_date, contest_id]))[1];
    res.json({ ratings, count, user_id });
  } catch (err) {
    return res.json({ ratings: [], count: 0 });
  }
};
