const express = require("express")
const app = express()
const fs = require("fs")
const path = require("path")
const { query } = require("../database/db.fun");
const { authGood, authAdminIS } = require("../middleware/auth");
const { langName, langAll, langTypeWithName, langIs } = require("../middleware/lang");
const { texample } = require("../middleware/texample")
const getQuery = require("../middleware/get.query");

// contest ... 
app.get("/", async (req, res) => {
      res.render("pages/contest", { data: req.data, pageInfo: "", contest: req.data.contest })
})

// tasks ... 
app.get("/tasks", async (req, res) => {
      try {
            let contest = req.data.contest
            let tasks = await query(`SELECT vt.name,vt.id, ifnull(status,0)  as status FROM v_tasks vt
                  LEFT JOIN (
                  SELECT cid , tasks_id,min(if(eventnum>0,eventnum,10)) as status FROM attempts
                  WHERE users_id = ?
                  GROUP BY  cid , tasks_id
                  ) as T
                  ON cid = contest_id and vt.id = tasks_id
                  WHERE   contest_id = ?`, [req.data.user_id, req.data.cid])
            let task = await query(`SELECT  * FROM v_tasks WHERE contest_id=? and id=? `, [req.data.cid, req.query.task_id || 0])
            if (task.length == 0 || task.err) task = await query(`SELECT * FROM v_tasks WHERE contest_id=? LIMIT 1`, [req.data.cid])
            if (contest.eventnum == 0 && !(await authAdminIS(req.data.user_id)))
                  return res.redirect("/contest/" + req.data.cid)
            task = task[0]
            task.example = await texample(task)
            res.render("pages/tasks", { data: req.data, pageInfo: "tasks", contest, tasks, task, lang: await langAll(contest.type) })
      } catch (e) {
            console.log(e)
            return res.redirect("/contest/" + req.data.cid)
      }
})

// tasks ... 
app.post("/tasks", [authGood], async (req, res) => {
      const { task_id, lang, code } = req.body
      let contest = req.data.contest
      let isTask = await query(`SELECT  * FROM v_tasks WHERE contest_id=? and id=?`, [req.data.cid, task_id])

      if (!(await langIs(contest.type, lang)))
            return res.redirect("/contest/" + req.data.cid)

      if ((contest.eventnum != 1 || isTask.length == 0) && !(await authAdminIS(req.data.user_id)))
            return res.redirect("/contest/" + req.data.cid)

      //start testing 
      const testing = require("../middleware/testing")
      let ins = await query("INSERT INTO attempts (tasks_id,users_id,lang,cid) values (?,?,?,?)", [task_id, req.data.user_id, await langName(lang), req.data.cid])
      testing(task_id, lang, ins.insertId, code, isTask[0].code, isTask[0].time, isTask[0].memory)

      // redricet
      res.redirect("/contest/" + req.data.cid + "/tasks?task_id=" + task_id + "#footer")
})

// attempts ... 
app.get("/attempts", async (req, res) => {
      if (req.data.contest.eventnum == 0 && req.data.user_id != 1) return res.redirect("/contest/" + req.data.cid)
      res.render("pages/attempts", { data: req.data, pageInfo: "attempts", contest: req.data.contest })
})

// attempts ... 
app.get("/attempts/api", async (req, res) => {
      let page = Math.max(0, req.query.page || 0)
      if (req.data.contest.eventnum == 0 && !(await authAdminIS(req.data.user_id))) return res.redirect("/contest/" + req.data.cid)
      let data = await query("SELECT *FROM v_attempts WHERE cid=? and role<>'admin' ORDER BY id desc LIMIT ?,20", [req.data.cid, page * 20])
      res.json(data)
})

// attempts ... 
app.get("/attempts/v2api", [authGood], async (req, res) => {
      let page = Math.max(0, req.query.page || 0)
      if (req.data.contest.eventnum == 0 && !(await authAdminIS(req.data.user_id))) return res.redirect("/contest/" + req.data.cid)
      let data = await query("SELECT *FROM v_attempts WHERE cid=? and tasks_id=? and users_id=? ORDER BY id desc LIMIT ?,10", [req.data.cid, req.query.task_id, req.data.user_id, page * 10])
      res.json(data)
})

// retings ... 
app.get("/retings", async (req, res) => {
      if (req.data.contest.eventnum == 0 && !(await authAdminIS(req.data.user_id))) return res.redirect("/contest/" + req.data.cid)
      res.render("pages/retings", { data: req.data, pageInfo: "retings", contest: req.data.contest })
})

// retings ... 
app.get("/retings/api", async (req, res) => {
      try {
            if (req.data.contest.eventnum == 0 && !(await authAdminIS(req.data.user_id))) return res.redirect("/contest/" + req.data.cid)
            let count = (await query(`SELECT count(*) as n FROM v_tasks WHERE contest_id=?`, [req.data.cid]))[0].n
            let tasks = await query(`SELECT  name, id FROM v_tasks WHERE contest_id=?`, [req.data.cid])
            let data = await query(getQuery(tasks), [req.data.contest.sdate, req.data.cid])
            res.json({ data, count, uid: req.data.user_id })
      } catch (e) {
            return res.redirect("/contest/" + req.data.cid + "?err=" + e)
      }
})

// code
app.get("/mycode", [authGood], async (req, res) => {
      let fsRead = (e) => {
            try {
                  return fs.readFileSync(e, { encoding: "utf-8" }) || 0
            } catch {
                  return "Sorry not!!!"
            }
      }
      let tasks = await query(`SELECT  name,id FROM v_tasks WHERE contest_id=?`, [req.data.cid])
      let isCode = await query("SELECT * FROM attempts WHERE users_id=? and id=?", [req.data.user_id, req.query.id])
      if (isCode.length != 0) {
            let p = path.join(__dirname, '../../compiler/tmp/' + parseInt(req.query.id) + "v/Main." + (await langTypeWithName(isCode[0].lang)))
            let e = path.join(__dirname, '../../compiler/tmp/' + parseInt(req.query.id) + "v/err.txt")
            return res.render("pages/mycode", { data: req.data, pageInfo: "mycode", tasks, contest: req.data.contest, sid: req.query.id, code: fsRead(p), err: fsRead(e) })
      }
      res.redirect("/about")
})


module.exports = app