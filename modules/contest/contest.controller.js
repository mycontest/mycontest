const { dbQueryOne, dbQueryMany } = require("../../shared/mysql");
const { fnReadPublicTests, fnGetRatingBoard, fnGetTasksQuery } = require("../../shared/helpers");
const { fnAddToQueue } = require("../../checker/worker");

exports.fnContestHome = async (req, res) => {
  res.render("pages/contest", { page_info: "contest", contest: req.contest });
};

exports.fnProblemsPage = async (req, res) => {
  let contest_id = req.contest_id;
  let contest = req.contest;
  let user_id = req.user_id;

  if (contest.event_num == 0 && !(req.user?.role == "admin")) return res.redirect("/contest/" + contest_id);

  let tasks = await dbQueryMany(fnGetTasksQuery(), [user_id, contest_id]);
  res.render("pages/problems", { page_info: "problems", contest, tasks });
};

exports.fnProblemPage = async (req, res) => {
  try {
    let contest_id = req.contest_id;
    let contest = req.contest;
    let user_id = req.user_id;
    let task_id = req.query.task_id;

    if (contest.event_num == 0 && !(req.user?.role == "admin")) {
      return res.redirect(`/contest/${contest_id}`);
    }

    let [task, languages, attempts] = await Promise.all([
      dbQueryOne(
        `
        SELECT t.*, ct.contest_id 
        FROM tasks t 
        JOIN contest_tasks ct ON t.task_id = ct.task_id 
        WHERE ct.contest_id=? AND t.task_id = ?
      `,
        [contest_id, task_id]
      ),
      dbQueryMany("SELECT * FROM languages WHERE group_id in (select group_id from vw_tasks where contest_id = ? and task_id = ?)", [contest_id, task_id]),
      dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? AND task_id = ? AND user_id = ? ORDER BY attempt_id DESC", [contest_id, task_id, user_id]),
    ]);

    if (task) task.public_tests = await fnReadPublicTests(task);
    res.render("pages/problem", { page_info: "problem", contest, task, languages, attempts });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect(`/contest/${req.contest_id}`);
  }
};

exports.fnProblemSubmit = async (req, res) => {
  try {
    const { task_id, language, code } = req.body;
    let contest_id = req.contest_id;
    let contest = req.contest;
    let user_id = req.user_id;

    let [task, languages] = await Promise.all([
      dbQueryOne(`SELECT * FROM vw_tasks WHERE contest_id = ? and task_id = ? `, [contest_id, task_id]),
      dbQueryOne("SELECT * FROM languages WHERE group_id in (select group_id from vw_tasks where task_id = ? and contest_id = ?) and editor_mode = ?", [task_id, contest_id, language]),
    ]);

    if (!languages) {
      req.flash("error", "Dasturlash tili tanlanmagan!");
      return res.redirect(`/contest/${contest_id}`);
    }

    if ((contest.event_num != 1 || !task) && !(req.user?.role == "admin")) {
      return res.redirect(`/contest/${contest_id}`);
    }

    let ins = await dbQueryMany("INSERT INTO attempts (task_id, user_id, contest_id, language_used, code) values (?, ?, ?, ?, ?)", [task_id, user_id, contest_id, languages.language_name, code]);

    fnAddToQueue(ins.insertId, contest_id, task_id, languages.language_id, code);

    res.redirect(`/contest/${contest_id}/problem?task_id=${task_id}#footer`);
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
    if (contest.event_num == 0 && !(req.user?.role == "admin")) {
      return res.redirect(`/contest/${contest_id}`);
    }
    let data = await dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? and role <> 'admin' ORDER BY attempt_id desc LIMIT ?, 20", [contest_id, page * 20]);
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
    let task_id = req.query.task_id;
    let page = Math.max(0, req.query.page || 0);

    if (contest.event_num == 0 && !(req.user?.role == "admin")) {
      return res.redirect(`/contest/${contest_id}`);
    }
    let data = await dbQueryMany("SELECT * FROM vw_attempts WHERE contest_id = ? and task_id = ? and user_id = ? ORDER BY attempt_id desc LIMIT ?, 10", [contest_id, task_id, user_id, page * 10]);
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
    if (contest.event_num == 0 && !(req.user?.role == "admin")) {
      return res.redirect(`/contest/${contest_id}`);
    }
    let count = (await dbQueryOne(`SELECT count(*) as count FROM vw_tasks WHERE contest_id = ?`, [contest_id])).count;
    let tasks = await dbQueryMany(`SELECT name, task_id FROM vw_tasks WHERE contest_id = ?`, [contest_id]);
    let ratings = (await dbQueryMany(fnGetRatingBoard(tasks), [contest.start_date, contest_id]))[1];
    res.json({ ratings, count, user_id });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect(`/contest/${req.contest_id}`);
  }
};
