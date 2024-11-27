const express = require("express")
const app = express()
const { query } = require("../database/db.fun") 
const path = require("path")
const fs = require("fs")

// admin panel 
app.get("/",async(req, res) => {
    return  res.render("admin/index",{data: req.data, pageInfo:"menu"})
})

// fs manger 
app.use('/manger',(req,res,next)=>{
    req.session.folder = req.session.folder || path.join(__dirname,'../../testcase') 
    req.session.basicpath = path.join(__dirname,'../../testcase') 
    req.session.name = "manger"
    // console.log(req.session.folder,req.session.basicpath )
   next()
},require("./manger.js"));

// fs manger 
app.use('/public',(req,res,next)=>{
    req.session.folder = req.session.folder || path.join(__dirname,'../../public') 
    req.session.basicpath = path.join(__dirname,'../../public') 
    req.session.name = "public"
    // console.log(req.session.folder,req.session.basicpath )
   next()
},require("./manger.js"));
   
//task add admin panel 
app.get("/tasks",async(req, res) => {
    let page = req.query.page || 0  ;
    let count  = (await query("SELECT count(*) as count FROM tasks "))[0].count/20+1
    let arr  = await query("SELECT *FROM tasks ORDER BY id DESC LIMIT ?,20",[page*20])
    res.render("admin/tasks",{data: req.data, pageInfo:"tasks" , arr , page, count})
})

//task add admin panel 
app.get("/contest",async(req, res) => {
    let page = req.query.page || 0  ;
    let count  = (await query("SELECT count(*) as count FROM v_contest "))[0].count/20+1
    let arr  = await query("SELECT *FROM v_contest ORDER BY id DESC LIMIT ?,20",[page*20])
    res.render("admin/contest",{data: req.data, pageInfo:"contest" , arr , page, count})
})

//contestadd add admin panel 
app.get("/contestadd",async(req, res) => {
    let cid = req.query.cid ;
    let arr  = (await query("SELECT *FROM contest WHERE id=?",[cid]))[0] || {}
    let arr2  = await query("SELECT *FROM tasks WHERE id in (SELECT tasks_id FROM contest_tasks WHERE contest_id=?)",[cid])
    res.render("admin/contestadd",{data: req.data, pageInfo:"contestadd" , arr , arr2 , cid:req.query.cid })
})

//contestadd add admin panel 
app.get("/deltasks",async(req, res) => {
    let {tid,cid} = req.query
    await query("DELETE FROM contest_tasks WHERE tasks_id=? and contest_id=?",[tid,cid])
    res.redirect("/admin/contestadd?cid="+cid)
})

//contestadd add admin panel 
app.post("/addtasks",async(req, res) => {
    let {tid,cid} = req.body 
    await query("INSERT INTO contest_tasks (tasks_id,contest_id) VALUE (?,?)",[tid,cid])
    res.redirect("/admin/contestadd?cid="+cid)
})

//contestadd add admin panel 
app.post("/contestadd",async(req, res) => {
    let {id, sdate  ,edate , name , contente , sdatetime , edatetime } = req.body 
    let cid = id 
    if(id>0) await query("UPDATE contest SET sdate=?,edate=?,name=?,contente=? WHERE id=?",[sdate+"T"+sdatetime,edate+"T"+edatetime, name , contente,id])
    else cid = (await query("INSERT INTO contest (sdate  ,edate , name , contente) VALUE (?,?,?,?) ", [sdate + "T" + sdatetime, edate + "T" + edatetime, name, contente])).insertId
    res.redirect("/admin/contestadd?cid="+cid)
})

//tasksadd add admin panel 
app.get("/tasksadd",async(req, res) => {
    let tid = req.query.tid ;
    let arr  = (await query("SELECT * FROM tasks WHERE id=?",[tid]))[0] || {}
    res.render("admin/tasksadd",{data: req.data, pageInfo:"tasksadd" , arr  })
})


//tasksadd add admin panel 
app.post("/tasksadd",async(req, res) => {
    let { id,name,sub_text,inp_text,out_text,time,memory,test_count,all_test,code,comment_text} = req.body 
     
    try   { fs.mkdirSync(path.join(__dirname,"../../testcase/",code)) }
    catch(e) { console.log("Not create folder maybe created :)") }

    let tid = id 
    if(id>0) await query("UPDATE tasks SET name=?,sub_text=?,inp_text=?,out_text=?,time=?,memory=?,test_count=?,all_test=?,code=?,comment_text=? WHERE id=?",[name,sub_text,inp_text,out_text,time,memory,test_count,all_test,code,comment_text,id])
    else tid = (await query("INSERT INTO tasks (name,sub_text,inp_text,out_text,time,memory,test_count,all_test,code,comment_text) VALUE (?,?,?,?,?,?,?,?,?,?) ",[name,sub_text,inp_text,out_text,time,memory,test_count,all_test,code,comment_text])).insertId
    res.redirect("/admin/tasksadd?tid="+tid)
})
 
module.exports = app