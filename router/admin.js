const express = require("express")
const app = express()
const path = require("path")
const fs = require("fs")
const { execute } = require("uzdev/mysql/index.js")

// admin panel 
app.get("/", async (req, res) => {
    return res.render("admin/index", { data: req.data, pageInfo: "menu" })
})

// fs manger 
app.use('/manger', (req, res, next) => {
    req.session.folder = req.session.folder || path.join(__dirname, '../testcase')
    req.session.basicpath = path.join(__dirname, '../testcase')
    req.session.name = "manger"
    // console.log(req.session.folder,req.session.basicpath )
    next()
}, require("./manger.js"));

// fs manger 
app.use('/public', (req, res, next) => {
    req.session.folder = req.session.folder || path.join(__dirname, '../public')
    req.session.basicpath = path.join(__dirname, '../public')
    req.session.name = "public"
    // console.log(req.session.folder,req.session.basicpath )
    next()
}, require("./manger.js"));

//task add admin panel 
app.get("/tasks", async (req, res) => {
    let page = req.query.page || 0;
    let count = (await execute("SELECT count(*) as count FROM tasks"))[0].count / 20 + 1
    let arr = await execute("SELECT * FROM tasks ORDER BY task_id DESC LIMIT ?,20", [page * 20])
    res.render("admin/tasks", { data: req.data, pageInfo: "tasks", arr, page, count })
})

//task add admin panel 
app.get("/contest", async (req, res) => {
    let page = req.query.page || 0;
    let count = (await execute("SELECT count(*) as count FROM vw_contest "))[0].count / 20 + 1
    let arr = await execute("SELECT * FROM vw_contest ORDER BY contest_id DESC LIMIT ?,20", [page * 20])
    res.render("admin/contest", { data: req.data, pageInfo: "contest", arr, page, count })
})

//contestadd add admin panel 
app.get("/contestadd", async (req, res) => {
    let contest_id = req.query.contest_id;
    let arr = (await execute("SELECT * FROM contest WHERE contest_id = ?", [contest_id]))[0] || {}
    let arr2 = await execute("SELECT * FROM tasks WHERE task_id in (SELECT task_id FROM contest_tasks WHERE contest_id=?)", [contest_id])
    res.render("admin/contestadd", { data: req.data, pageInfo: "contestadd", arr, arr2, contest_id: req.query.contest_id })
})

//contestadd add admin panel 
app.get("/deltasks", async (req, res) => {
    let { task_id, contest_id } = req.query
    await execute("DELETE FROM contest_tasks WHERE task_id = ? and contest_id=?", [task_id, contest_id])
    res.redirect("/admin/contestadd?contest_id=" + contest_id)
})

//contestadd add admin panel 
app.post("/addtasks", async (req, res) => {
    let { task_id, contest_id } = req.body
    await execute("INSERT INTO contest_tasks (task_id, contest_id) VALUE (?, ?)", [task_id, contest_id])
    res.redirect("/admin/contestadd?contest_id=" + contest_id)
})

//contestadd add admin panel 
app.post("/contestadd", async (req, res) => {
    let { contest_id, start_date, end_date, name, content, start_datetime, end_datetime } = req.body
    if (contest_id > 0) await execute("UPDATE contest SET start_date=?, end_date=?, name=?, content=? WHERE contest_id = ?", [start_date + "T" + start_datetime, end_date + "T" + end_datetime, name, content, contest_id])
    else contest_id = (await execute("INSERT INTO contest (start_date, end_date , name , content) VALUE (?,?,?,?) ", [start_date + "T" + start_datetime, end_date + "T" + end_datetime, name, content])).insertId
    res.redirect("/admin/contestadd?contest_id=" + contest_id)
})

//tasksadd add admin panel 
app.get("/tasksadd", async (req, res) => {
    let task_id = req.query.task_id;
    let arr = (await execute("SELECT * FROM tasks WHERE task_id = ?", [task_id]))[0] || {}
    res.render("admin/tasksadd", { data: req.data, pageInfo: "tasksadd", arr })
})

//tasksadd add admin panel 
app.post("/tasksadd", async (req, res) => {
    let { task_id, name, sub_text, inp_text, out_text, time, memory, test_count, all_test, code, comment_text } = req.body
    try { fs.mkdirSync(path.join(__dirname, "../../testcase/", code)) }
    catch (e) { console.log("Not create folder maybe created :)") }
    if (task_id > 0) await execute("UPDATE tasks SET name=?, sub_text=?, inp_text=?, out_text=?, time=?, memory=?, test_count=?, all_test=?,code=?,comment_text=? WHERE task_id=?", [name, sub_text, inp_text, out_text, time, memory, test_count, all_test, code, comment_text, task_id])
    else task_id = (await execute("INSERT INTO tasks (name, sub_text, inp_text, out_text, time, memory, test_count, all_test, code, comment_text) VALUE (?,?,?,?,?,?,?,?,?,?) ", [name, sub_text, inp_text, out_text, time, memory, test_count, all_test, code, comment_text])).insertId
    res.redirect("/admin/tasksadd?task_id=" + task_id)
})

module.exports = app