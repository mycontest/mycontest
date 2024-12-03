const express = require("express");
const app = express();
const path = require("path");
const { authStop } = require("../controllers/auth");
const { readExample, readCode, getQuery, getTasksQuery } = require("../controllers/main");
const { execute } = require("uzdev/mysql");
const { fork } = require("child_process");

// const { testing } = require("../../compiler/testing");

app.get("/", async (req, res) => {
      res.render("pages/contest", { data: req.data, pageInfo: "main", contest: req.data.contest });
});

app.get("/tasks", async (req, res) => {
      try {
            let { task_id } = req.query;
            let contest = req.data.contest;

            let [tasks, task, lang, row] = await Promise.all([
                  execute(getTasksQuery(), [req.data.user_id, req.data.contest_id]),
                  execute(`SELECT * FROM vw_tasks WHERE contest_id=? order by if(task_id = ?, 1, 0) desc`, [req.data.contest_id, task_id], 1),
                  execute("SELECT * FROM lang WHERE group_id = (select group_id from vw_tasks order by if(task_id = ?, 1, 0) desc limit 1)", [task_id]),
            ]);

            if (contest.event_num == 0 && !(req.data?.role == "admin")) return res.redirect(`/contest/${req.data.contest_id}`);
            task.example = await readExample(task);

            res.render("pages/tasks", { data: req.data, pageInfo: "tasks", contest, tasks, task, lang });
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?error=${err.message}`);
      }
});

app.post("/tasks", [authStop], async (req, res) => {
      try {
            const { task_id, lang_code, code } = req.body;
            let contest = req.data.contest;

            let [task, lang] = await Promise.all([execute(`SELECT * FROM vw_tasks WHERE contest_id = ? and task_id = ? `, [req.data.contest_id, task_id], 1), execute("SELECT * FROM lang WHERE group_id = (select group_id from vw_tasks where task_id = ?) and code = ?", [task_id, lang_code], 1)]);

            if (!lang) return res.redirect(`/contest/${contest.contest_id}?error=Dasturlash tili tanlanmagan!`);
            if ((contest.event_num != 1 || !task) && !(req.data?.role == "admin")) return res.redirect(`/contest/${req.data.contest_id}`);

            let ins = await execute("INSERT INTO attempts (task_id, user_id, contest_id, lang) values (?, ?, ?, ?)", [task_id, req.data.user_id, req.data.contest_id, lang.name]);

            const child = fork("../checker/main.js");
            child.send({ attempt_id: ins.insertId, task_id: task_id, lang_id: lang.lang_id, code });

            child.on("message", (message) => {
                  console.log("Message from child:", message);
            });

            child.on("error", (error) => {
                  console.error("Child process error:", error);
            });

            child.on("exit", (code) => {
                  console.log(`Child process exited with code ${code}`);
            });

            res.redirect(`/contest/${req.data.contest_id}/tasks?task_id=${task_id}#footer`);
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?error=${err.message}`);
      }
});

app.get("/attempts", async (req, res) => {
      if (req.data.contest.event_num == 0 && req.data.user_id != 1) return res.redirect("/contest/" + req.data.contest_id);
      res.render("pages/attempts", { data: req.data, pageInfo: "attempts", contest: req.data.contest });
});

app.get("/attempts/all", async (req, res) => {
      try {
            let page = Math.max(0, req.query.page || 0);
            if (req.data.contest.event_num == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
            let data = await execute("SELECT * FROM vw_attempts WHERE contest_id = ? and role<>'admin' ORDER BY attempt_id desc LIMIT ?, 20", [req.data.contest_id, page * 20]);
            res.json(data);
      } catch (err) {
            return res.json([]);
      }
});

app.get("/attempts/one", [authStop], async (req, res) => {
      try {
            let page = Math.max(0, req.query.page || 0);
            if (req.data.contest.event_num == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
            let data = await execute("SELECT * FROM vw_attempts WHERE contest_id = ? and task_id = ? and user_id = ? ORDER BY attempt_id desc LIMIT ?, 10", [req.data.contest_id, req.query.task_id, req.data.user_id, page * 10]);
            res.json(data);
      } catch (err) {
            return res.json([]);
      }
});

app.get("/retings", async (req, res) => {
      if (req.data.contest.event_num == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
      res.render("pages/retings", { data: req.data, pageInfo: "retings", contest: req.data.contest });
});

app.get("/retings/api", async (req, res) => {
      try {
            if (req.data.contest.event_num == 0 && !(req.data?.role == "admin")) return res.redirect("/contest/" + req.data.contest_id);
            let count = (await execute(`SELECT count(*) as count FROM vw_tasks WHERE contest_id = ?`, [req.data.contest_id], 1)).count;
            let tasks = await execute(`SELECT name, task_id FROM vw_tasks WHERE contest_id = ?`, [req.data.contest_id]);
            let ratings = (await execute(getQuery(tasks), [req.data.contest.start_date, req.data.contest_id]))[1];
            res.json({ ratings, count, user_id: req.data.user_id });
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?error=${err.message}`);
      }
});

app.get("/code", [authStop], async (req, res) => {
      try {
            let [tasks, attempt, lang] = await Promise.all([
                  execute(`SELECT name, task_id FROM vw_tasks WHERE contest_id =? `, [req.data.contest_id]),
                  execute("SELECT * FROM attempts WHERE user_id = ? and attempt_id = ?", [req.data.user_id, req.query.attempt_id], 1),
                  execute("SELECT * FROM lang WHERE name in (SELECT lang FROM attempts WHERE attempt_id = ?)", [req.query.attempt_id], 1),
            ]);

            if (!attempt) res.redirect("/about");
            let code_path = path.join(__dirname, "../../checker/temp/" + parseInt(req.query.attempt_id) + "/source." + lang?.file_type);
            let info_path = path.join(__dirname, "../../checker/temp/" + parseInt(req.query.attempt_id) + "/info.log");
            let error_path = path.join(__dirname, "../../checker/temp/" + parseInt(req.query.attempt_id) + "/error.log");
            return res.render("pages/code", { data: req.data, pageInfo: "code", tasks, contest: req.data.contest, attempt_id: req.query.attempt_id, code: readCode(code_path), info: readCode(info_path), error: readCode(error_path) });
      } catch (err) {
            return res.redirect(`/contest/${req.data.contest_id}?error=${err.message}`);
      }
});

module.exports = app;
