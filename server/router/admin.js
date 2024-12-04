const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { execute } = require("uzdev/mysql/index.js");
const { exec } = require('child_process');
const { getFolderInfo } = require("../controllers/main");

app.get("/", async (req, res) => {
    try {
        return res.render("admin/index", { data: req.data, pageInfo: "home" });
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.get("/contest", async (req, res) => {
    try {
        let page = req.query.page || 0;
        let count = (await execute("SELECT count(*) as count FROM vw_contest "))[0].count / 20 + 1;
        let arr = await execute("SELECT * FROM vw_contest ORDER BY contest_id DESC LIMIT ?,20", [page * 20]);
        res.render("admin/contest", { data: req.data, pageInfo: "contest", arr, page, count });
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.get("/contestadd", async (req, res) => {
    try {
        let contest_id = req.query.contest_id;
        let contest = (await execute("SELECT * FROM contest WHERE contest_id = ?", [contest_id]))[0] || {};
        let tasks = await execute("SELECT * FROM tasks WHERE task_id in (SELECT task_id FROM contest_tasks WHERE contest_id=?)", [contest_id]);
        res.render("admin/contestadd", { data: req.data, pageInfo: "contestadd", contest, tasks, contest_id: req.query.contest_id });
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.get("/deltasks", async (req, res) => {
    try {
        let { task_id, contest_id } = req.query;
        await execute("DELETE FROM contest_tasks WHERE task_id = ? and contest_id=?", [task_id, contest_id]);
        res.redirect("/admin/contestadd?contest_id=" + contest_id);
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.post("/contestadd", async (req, res) => {
    try {
        let { contest_id, start_date, end_date, name, content } = req.body;
        if (contest_id > 0) await execute("UPDATE contest SET start_date=?, end_date=?, name=?, content=? WHERE contest_id = ?", [start_date, end_date, name, content, contest_id]);
        else contest_id = (await execute("INSERT INTO contest (start_date, end_date , name , content) VALUE (?,?,?,?) ", [start_date, end_date, name, content])).insertId;
        res.redirect("/admin/contestadd?contest_id=" + contest_id);
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.post("/addtasks", async (req, res) => {
    try {
        let { task_id, contest_id } = req.body;
        await execute("INSERT INTO contest_tasks (task_id, contest_id) VALUE (?, ?)", [task_id, contest_id]);
        res.redirect("/admin/contestadd?contest_id=" + contest_id);
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.get("/tasks", async (req, res) => {
    try {
        let page = req.query.page || 0;
        let count = (await execute("SELECT count(*) as count FROM tasks"))[0].count / 20 + 1;
        let arr = await execute("SELECT * FROM tasks ORDER BY task_id DESC LIMIT ?, 20", [page * 20]);
        res.render("admin/tasks", { data: req.data, pageInfo: "tasks", arr, page, count });
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.get("/tasksadd", async (req, res) => {
    try {
        let task_id = req.query.task_id;
        let task = await execute("SELECT * FROM tasks WHERE task_id = ?", [task_id], 1) || {};
        let files = getFolderInfo(path.join(__dirname, '../../checker/testcase', task_id || "-1"))
        res.render("admin/tasksadd", { data: req.data, pageInfo: "tasksadd", task, files });
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.post("/tasksadd", async (req, res) => {
    try {
        let { task_id, name, sub_text, inp_text, out_text, time, memory, test_count, all_test, comment_text } = req.body;
        if (task_id > 0) await execute("UPDATE tasks SET name=?, sub_text=?, inp_text=?, out_text=?, time=?, memory=?, test_count=?, all_test=?, comment_text=? WHERE task_id=?", [name, sub_text, inp_text, out_text, time, memory, test_count, all_test, comment_text, task_id]);
        else task_id = (await execute("INSERT INTO tasks (name, sub_text, inp_text, out_text, time, memory, test_count, all_test, comment_text) VALUE (?,?,?,?,?,?,?,?,?) ", [name, sub_text, inp_text, out_text, time, memory, test_count, all_test, comment_text])).insertId;
        res.redirect("/admin/tasksadd?task_id=" + task_id);
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.post("/taskszip", async (req, res) => {
    try {
        const task_id = req.body.task_id;
        const upload_path = path.join(__dirname, '../../checker/testcase', task_id);

        // Ensure a file was uploaded
        if (!req.files || !req.files.zip_file) {
            return res.redirect(`/admin?error=No file uploaded.`);
        }

        const zip_file = req.files.zip_file;

        // Ensure the upload path is ready
        if (fs.existsSync(upload_path)) {
            fs.rmSync(upload_path, { recursive: true, force: true });
        }
        fs.mkdirSync(upload_path, { recursive: true });

        const temp_zip_path = path.join(upload_path, 'temp.zip');

        // Move the uploaded file to a temporary location
        await zip_file.mv(temp_zip_path);

        // Extract the ZIP file using the 'unzip' command
        exec(`unzip -o ${temp_zip_path} -d ${upload_path}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Unzip error: ${error.message}`);
                return res.redirect(`/admin?error=Unzip failed: ${error.message}`);
            }

            if (stderr) {
                console.warn(`Unzip stderr: ${stderr}`);
            }

            // Clean up temporary ZIP file
            fs.unlinkSync(temp_zip_path);

            res.redirect(`/admin/tasksadd?task_id=${task_id}&success=File unzipped to ${upload_path}`);
        });
    } catch (error) {
        console.error("Error during file upload or extraction:", error);
        res.redirect(`/admin?error=${error.message}`);
    }
});

app.get("/news", async (req, res) => {
    try {
        let news = await execute("SELECT * FROM news ORDER BY news_id DESC LIMIT 20", []);
        res.render("admin/news", { data: req.data, pageInfo: "news", news });
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.get("/newsadd", async (req, res) => {
    try {
        let news_id = req.query.news_id;
        let news = (await execute("SELECT * FROM news WHERE news_id = ?", [news_id], 1)) || {};
        res.render("admin/newsadd", { data: req.data, pageInfo: "newsadd", news, news_id: req.query.news_id });
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});

app.post("/newsadd", async (req, res) => {
    try {
        let { news_id, title, content } = req.body;
        if (news_id > 0) await execute("UPDATE news SET title = ?, content = ? WHERE news_id = ?", [title, content, news_id]);
        else news_id = (await execute("INSERT INTO news (title, content) VALUE (?, ?) ", [title, content])).insertId;
        res.redirect("/admin/newsadd?news_id=" + news_id);
    } catch (err) {
        res.redirect(`/admin?error=${err.message}`);
    }
});


module.exports = app;
