const express = require("express")
const app = express()
const fs = require("fs")
const path = require("path")
const { getQuery, readExample } = require("../controllers/functions");
const { langName, langAll, langTypeWithName, langIs } = require("../controllers/lang");
const { authStop } = require("../controllers/auth");

app.get("/", async (req, res) => {
      res.render("pages/contest", { data: req.data, pageInfo: "", contest: req.data.contest })
})

app.get("/tasks", async (req, res) => {
      try {
            let contest = req.data.contest
            let tasks = await query(`SELECT vt.name,vt.id, ifnull(status,0)  as status FROM v_tasks vt
                  LEFT JOIN (
                  SELECT contest_id , tasks_id,min(if(eventnum > 0, eventnum, 10)) as status FROM attempts
                  WHERE users_id = ?
                  GROUP BY  contest_id , tasks_id
                  ) as T
                  ON contest_id = contest_id and vt.id = tasks_id
                  WHERE   contest_id = ?`, [req.data.user_id, req.data.contest_id])
            let task = await query(`SELECT  * FROM v_tasks WHERE contest_id=? and id=? `, [req.data.contest_id, req.query.task_id || 0])
            if (task.length == 0 || task.err) task = await query(`SELECT * FROM v_tasks WHERE contest_id = ? LIMIT 1`, [req.data.contest_id])
            if (contest.eventnum == 0 && !(req.data?.role == 'admin')) return res.redirect("/contest/" + req.data.contest_id)
            task = task[0]
            task.example = await readExample(task)
            res.render("pages/tasks", { data: req.data, pageInfo: "tasks", contest, tasks, task, lang: await langAll(contest.type) })
      } catch (err) {
            return res.redirect("/contest/" + req.data.contest_id)
      }
})


app.post("/tasks", [authStop], async (req, res) => {
      const { task_id, lang, code } = req.body
      let contest = req.data.contest
      let task = await query(`SELECT  * FROM v_tasks WHERE contest_id = ? and id = ?`, [req.data.contest_id, task_id])

      if (!(await langIs(contest.type, lang))) return res.redirect("/contest/" + req.data.contest_id)
      if ((contest.eventnum != 1 || task.length == 0) && !(req.data?.role == 'admin')) return res.redirect("/contest/" + req.data.contest_id)

      const testing = require("../middleware/testing")
      let ins = await query("INSERT INTO attempts (tasks_id, users_id, lang, contest_id) values (?,?,?,?)", [task_id, req.data.user_id, await langName(lang), req.data.contest_id])
      testing(task_id, lang, ins.insertId, code, task[0].code, task[0].time, task[0].memory)

      res.redirect("/contest/" + req.data.contest_id + "/tasks?task_id=" + task_id + "#footer")
})

app.get("/attempts", async (req, res) => {
      if (req.data.contest.eventnum == 0 && req.data.user_id != 1) return res.redirect("/contest/" + req.data.contest_id)
      res.render("pages/attempts", { data: req.data, pageInfo: "attempts", contest: req.data.contest })
})

app.get("/attempts/api", async (req, res) => {
      let page = Math.max(0, req.query.page || 0)
      if (req.data.contest.eventnum == 0 && !(req.data?.role == 'admin')) return res.redirect("/contest/" + req.data.contest_id)
      let data = await query("SELECT *FROM v_attempts WHERE contest_id=? and role<>'admin' ORDER BY id desc LIMIT ?,20", [req.data.contest_id, page * 20])
      res.json(data)
})


app.get("/attempts/v2api", [authStop], async (req, res) => {
      let page = Math.max(0, req.query.page || 0)
      if (req.data.contest.eventnum == 0 && !(req.data?.role == 'admin')) return res.redirect("/contest/" + req.data.contest_id)
      let data = await query("SELECT * FROM v_attempts WHERE contest_id = ? and tasks_id = ? and users_id=? ORDER BY id desc LIMIT ?,10", [req.data.contest_id, req.query.task_id, req.data.user_id, page * 10])
      res.json(data)
})

app.get("/retings", async (req, res) => {
      if (req.data.contest.eventnum == 0 && !(req.data?.role == 'admin')) return res.redirect("/contest/" + req.data.contest_id)
      res.render("pages/retings", { data: req.data, pageInfo: "retings", contest: req.data.contest })
})

app.get("/retings/api", async (req, res) => {
      try {
            if (req.data.contest.eventnum == 0 && !(req.data?.role == 'admin')) return res.redirect("/contest/" + req.data.contest_id)
            let count = (await query(`SELECT count(*) as n FROM v_tasks WHERE contest_id=?`, [req.data.contest_id]))[0].n
            let tasks = await query(`SELECT  name, id FROM v_tasks WHERE contest_id=?`, [req.data.contest_id])
            let data = await query(getQuery(tasks), [req.data.contest.start_date, req.data.contest_id])
            res.json({ data, count, uid: req.data.user_id })
      } catch (e) {
            return res.redirect("/contest/" + req.data.contest_id + "?err=" + e)
      }
})


app.get("/mycode", [authStop], async (req, res) => {
      let fsRead = (e) => {
            try {
                  return fs.readFileSync(e, { encoding: "utf-8" }) || 0
            } catch {
                  return "Sorry not!!!"
            }
      }
      let tasks = await query(`SELECT  name,id FROM v_tasks WHERE contest_id=?`, [req.data.contest_id])
      let isCode = await query("SELECT * FROM attempts WHERE users_id=? and id=?", [req.data.user_id, req.query.id])
      if (isCode.length != 0) {
            let p = path.join(__dirname, '../../compiler/tmp/' + parseInt(req.query.id) + "v/Main." + (await langTypeWithName(isCode[0].lang)))
            let e = path.join(__dirname, '../../compiler/tmp/' + parseInt(req.query.id) + "v/err.txt")
            return res.render("pages/mycode", { data: req.data, pageInfo: "mycode", tasks, contest: req.data.contest, sid: req.query.id, code: fsRead(p), err: fsRead(e) })
      }
      res.redirect("/about")
})


module.exports = app