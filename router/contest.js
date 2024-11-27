const express = require("express");
const app = express();
const path = require("path");
const { authStop } = require("../controllers/auth");
const { readExample, readCode, getQuery, getTasksQuery } = require("../controllers/functions");
const { langName, langAll, langType, langIs } = require("../controllers/lang");
const { execute } = require("uzdev/mysql");

app.get("/", async (req, res) => {
      res.render("pages/contest", { data: req.data, pageInfo: "main", contest: req.data.contest });
});

app.get("/tasks", async (req, res) => {
      try {
            let contest = req.data.contest;
            let [tasks, task] = await Promise.all([execute(getTasksQuery(), [req.data.user_id, req.data.contest_id]), execute(`SELECT * FROM vw_tasks WHERE contest_id=? and task_id = ?`, [req.data.contest_id, req.query.task_id || 0], 1)]);

            if (!task) task = await execute(`SELECT * FROM vw_tasks WHERE contest_id = ? LIMIT 1`, [req.data.contest_id], 1);
            if (contest.eventnum == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
            task.example = await readExample(task);

            res.render("pages/tasks", { data: req.data, pageInfo: "tasks", contest, tasks, task, lang: await langAll(contest.type) });
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?err=${err.message}`);
      }
});

app.post("/tasks", [authStop], async (req, res) => {
      try {
            const { task_id, lang, code } = req.body;
            let contest = req.data.contest;
            let task = await execute(`SELECT * FROM vw_tasks WHERE contest_id = ? and task_id = ? `, [req.data.contest_id, task_id]);

            if (!(await langIs(contest.type, lang))) return res.redirect("/contest/" + req.data.contest_id);
            if ((contest.eventnum != 1 || task.length == 0) && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);

            const testing = require("../controllers/testing");
            let ins = await execute("INSERT INTO attempts (task_id, user_id, lang, contest_id) values (?,?,?,?)", [task_id, req.data.user_id, await langName(lang), req.data.contest_id]);
            testing(task_id, lang, ins.insertId, code, task[0].task_id, task[0].time, task[0].memory);

            res.redirect(`/contest/${req.data.contest_id}/tasks?task_id=${task_id}#footer`);
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?err=${err.message}`);
      }
});

app.get("/attempts", async (req, res) => {
      if (req.data.contest.eventnum == 0 && req.data.user_id != 1) return res.redirect("/contest/" + req.data.contest_id);
      res.render("pages/attempts", { data: req.data, pageInfo: "attempts", contest: req.data.contest });
});

app.get("/attempts/api", async (req, res) => {
      try {
            let page = Math.max(0, req.query.page || 0);
            if (req.data.contest.eventnum == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
            let data = await execute("SELECT * FROM vw_attempts WHERE contest_id = ? and role<>'admin' ORDER BY id desc LIMIT ?, 20", [req.data.contest_id, page * 20]);
            res.json(data);
      } catch (err) {
            console.log(err);
            return res.json([]);
      }
});

app.get("/attempts/v2api", [authStop], async (req, res) => {
      try {
            let page = Math.max(0, req.query.page || 0);
            if (req.data.contest.eventnum == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
            let data = await execute("SELECT * FROM vw_attempts WHERE contest_id = ? and task_id = ? and user_id = ? ORDER BY id desc LIMIT ?, 10", [req.data.contest_id, req.query.task_id, req.data.user_id, page * 10]);
            res.json(data);
      } catch (err) {
            console.log(err);
            return res.json([]);
      }
});

app.get("/retings", async (req, res) => {
      if (req.data.contest.eventnum == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
      res.render("pages/retings", { data: req.data, pageInfo: "retings", contest: req.data.contest });
});

app.get("/retings/api", async (req, res) => {
      try {
            if (req.data.contest.eventnum == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
            let count = (await execute(`SELECT count(*) as n FROM vw_tasks WHERE contest_id = ?`, [req.data.contest_id]))[0].n;
            let tasks = await execute(`SELECT name, task_id FROM vw_tasks WHERE contest_id = ?`, [req.data.contest_id]);
            let data = await execute(getQuery(tasks), [req.data.contest.start_date, req.data.contest_id]);
            res.json({ data, count, user_id: req.data.user_id });
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?err=${err.message}`);
      }
});

app.get("/mycode", [authStop], async (req, res) => {
      try {
            let tasks = await execute(`SELECT name, task_id FROM vw_tasks WHERE contest_id =? `, [req.data.contest_id]);
            let iscode = await execute("SELECT * FROM attempts WHERE user_id = ? and id=?", [req.data.user_id, req.query.id]);
            if (iscode.length != 0) {
                  let p = path.join(__dirname, "../compiler/tmp/" + parseInt(req.query.id) + "v/Main." + (await langType(iscode[0].lang)));
                  let e = path.join(__dirname, "../compiler/tmp/" + parseInt(req.query.id) + "v/err.txt");
                  return res.render("pages/mycode", { data: req.data, pageInfo: "mycode", tasks, contest: req.data.contest, sid: req.query.id, code: readCode(p), err: readCode(e) });
            }
            res.redirect("/about");
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?err=${err.message}`);
      }
});

module.exports = app;
