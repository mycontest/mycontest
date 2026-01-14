const { dbQueryOne, dbQueryMany } = require("../../shared/mysql");
const { fnReadPublicTests, fnGetRatingBoard, fnGetProblemsQuery } = require("../../shared/helpers");
const { fnAddToQueue } = require("../../checker/worker");

exports.fnContestHome = async (req, res) => {
  res.render("pages/contest", { page_info: "contest", contest: req.contest });
};

exports.fnProblemsPage = async (req, res) => {
  let contest_id = req.contest_id;
  let contest = req.contest;
  let user_id = req.user_id;

  if (contest.event_num == 0 && !(req.user?.role == "admin")) return res.redirect("/contest/" + contest_id);

  let problems = await dbQueryMany(fnGetProblemsQuery(), [user_id, contest_id]);
  res.render("pages/problems", { page_info: "problems", contest, problems });
};

exports.fnProblemPage = async (req, res) => {
  try {
    let contest_id = req.contest_id;
    let contest = req.contest;
    let user_id = req.user_id;
    let problem_id = req.query.problem_id;

    if (contest.event_num == 0 && !(req.user?.role == "admin")) {
      return res.redirect(`/contest/${contest_id}`);
    }

    let [problem, languages, attempts] = await Promise.all([
      dbQueryOne(
        `
        SELECT t.*, ct.contest_id 
        FROM problems t 
        JOIN contest_problems ct ON t.problem_id = ct.problem_id 
        WHERE ct.contest_id=? AND t.problem_id = ?
      `,
        [contest_id, problem_id]
      ),
      dbQueryMany("SELECT * FROM languages WHERE group_id in (select group_id from vw_problems where contest_id = ? and problem_id = ?)", [contest_id, problem_id]),
      dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? AND problem_id = ? AND user_id = ? ORDER BY attempt_id DESC", [contest_id, problem_id, user_id]),
    ]);

    if (problem) problem.public_tests = await fnReadPublicTests(problem);
    res.render("pages/problem", { page_info: "problem", contest, problem, languages, attempts });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect(`/contest/${req.contest_id}`);
  }
};

exports.fnProblemSubmit = async (req, res) => {
  try {
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
      return res.redirect(`/contest/${contest_id}`);
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
  let contest = req.contest;
  let user_id = req.user_id;
  if (contest.event_num == 0 && user_id != 1) {
    return res.redirect(`/contest/${req.contest_id}`);
  }
  res.render("pages/attempts", { page_info: "attempts", contest });
};

exports.fnAttemptsAll = async (req, res) => {
  try {
    let contest_id = req.contest_id;
    let contest = req.contest;
    let page = Math.max(0, req.query.page || 0);
    if (contest.event_num == 0) {
      return res.redirect(`/contest/${contest_id}`);
    }
    let data = await dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? ORDER BY attempt_id desc LIMIT ?, 20", [contest_id, page * 20]);
    res.json(data);
  } catch (err) {
    return res.json([]);
  }
};

exports.fnAttemptsOne = async (req, res) => {
  try {
    let contest_id = req.contest_id;
    let contest = req.contest;
    let user_id = req.user_id;
    let problem_id = req.query.problem_id;
    let page = Math.max(0, req.query.page || 0);

    if (contest.event_num == 0 && !(req.user?.role == "admin")) {
      return res.redirect(`/contest/${contest_id}`);
    }
    let data = await dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? and problem_id = ? and user_id = ? ORDER BY attempt_id desc LIMIT ?, 10", [contest_id, problem_id, user_id, page * 10]);
    res.json(data);
  } catch (err) {
    return res.json([]);
  }
};

exports.fnRatingPage = async (req, res) => {
  let contest_id = req.contest_id;
  let contest = req.contest;
  if (contest.event_num == 0 && !(req.user?.role == "admin")) {
    return res.redirect(`/contest/${contest_id}`);
  }
  res.render("pages/rating", { page_info: "ratings", contest });
};

exports.fnRatingAll = async (req, res) => {
  try {
    let contest_id = req.contest_id;
    let contest = req.contest;
    let user_id = req.user_id;
    if (contest.event_num == 0) {
      return res.redirect(`/contest/${contest_id}`);
    }
    let count = (await dbQueryOne(`SELECT count(*) as count FROM vw_problems WHERE contest_id = ?`, [contest_id])).count;
    let problems = await dbQueryMany(`SELECT name, problem_id FROM vw_problems WHERE contest_id = ?`, [contest_id]);
    let ratings = (await dbQueryMany(fnGetRatingBoard(problems), [contest.start_date, contest_id]))[1];
    res.json({ ratings, count, user_id });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect(`/contest/${req.contest_id}`);
  }
};
