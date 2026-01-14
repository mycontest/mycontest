const { dbQueryMany, dbQueryOne } = require("../../shared/mysql");
const { fnGetFolderInfo } = require("../../shared/helpers");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

exports.fnHome = async (req, res) => {
  try {
    let active_contests = (await dbQueryOne("SELECT count(*) as count FROM contest WHERE now() BETWEEN start_date AND end_date"))?.count || 0;
    let tasks_count = (await dbQueryOne("SELECT count(*) as count FROM tasks"))?.count || 0;
    let users_count = (await dbQueryOne("SELECT count(*) as count FROM users"))?.count || 0;

    let recent_contests = await dbQueryMany("SELECT * FROM contest ORDER BY contest_id DESC LIMIT 5");
    let recent_tasks = await dbQueryMany("SELECT * FROM tasks ORDER BY task_id DESC LIMIT 5");

    return res.render("admin/index", {
      page_info: "home",
      active_contests,
      tasks_count,
      users_count,
      recent_contests,
      recent_tasks,
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnContestList = async (req, res) => {
  try {
    let page = req.query.page || 0;
    let count = (await dbQueryOne("SELECT count(*) as count FROM vw_contest ")).count / 20 + 1;
    let contests = await dbQueryMany("SELECT * FROM vw_contest ORDER BY contest_id DESC LIMIT ?,20", [page * 20]);
    res.render("admin/contest", { page_info: "contest", contests, page, count });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/`);
  }
};

exports.fnContestForm = async (req, res) => {
  try {
    let contest_id = req.query.contest_id;
    let contest = (await dbQueryOne("SELECT * FROM contest WHERE contest_id = ?", [contest_id])) || {};

    // Convert MySQL datetime to HTML5 datetime-local format (YYYY-MM-DDTHH:MM)
    if (contest.start_date) {
      contest.start_date = new Date(contest.start_date).toISOString().slice(0, 16);
    }
    if (contest.end_date) {
      contest.end_date = new Date(contest.end_date).toISOString().slice(0, 16);
    }

    let tasks = await dbQueryMany("SELECT * FROM tasks WHERE task_id in (SELECT task_id FROM contest_tasks WHERE contest_id=?)", [contest_id]);
    res.render("admin/contestadd", { page_info: "contestadd", contest, tasks, contest_id: req.query.contest_id });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnContestRemoveTask = async (req, res) => {
  try {
    let { task_id, contest_id } = req.query;
    await dbQueryMany("DELETE FROM contest_tasks WHERE task_id = ? and contest_id=?", [task_id, contest_id]);
    res.redirect("/admin/contestadd?contest_id=" + contest_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnContestSave = async (req, res) => {
  try {
    let { contest_id, start_date, end_date, name, content } = req.body;
    if (contest_id > 0) await dbQueryMany("UPDATE contest SET start_date=?, end_date=?, name=?, content=? WHERE contest_id = ?", [start_date, end_date, name, content, contest_id]);
    else contest_id = (await dbQueryMany("INSERT INTO contest (start_date, end_date , name , content) VALUE (?,?,?,?) ", [start_date, end_date, name, content])).insertId;
    res.redirect("/admin/contestadd?contest_id=" + contest_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnContestAddTask = async (req, res) => {
  try {
    let { task_id, contest_id } = req.body;
    await dbQueryMany("INSERT INTO contest_tasks (task_id, contest_id) VALUE (?, ?)", [task_id, contest_id]);
    res.redirect("/admin/contestadd?contest_id=" + contest_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnTaskList = async (req, res) => {
  try {
    let page = req.query.page || 0;
    let count = (await dbQueryOne("SELECT count(*) as count FROM tasks")).count / 20 + 1;
    let tasks_list = await dbQueryMany("SELECT * FROM tasks ORDER BY task_id DESC LIMIT ?, 20", [page * 20]);
    res.render("admin/tasks", { page_info: "tasks", tasks_list, page, count });
  } catch (err) {
    req.flash("error", err.message);
    req.session.save(() => res.redirect(`/admin`));
  }
};

exports.fnTaskForm = async (req, res) => {
  try {
    let task_id = req.query.task_id;
    let task = (await dbQueryOne("SELECT * FROM tasks WHERE task_id = ?", [task_id])) || {};
    let files = fnGetFolderInfo(path.join(__dirname, "../../data/checker/testcase", task_id || "-1"));
    res.render("admin/tasksadd", { page_info: "tasksadd", task, files });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnTaskSave = async (req, res) => {
  try {
    let { task_id, name, question_content, input_content, output_content, time_ms, memory_kb, test_public, test_all, comment_content } = req.body;
    if (task_id > 0)
      await dbQueryMany("UPDATE tasks SET name=?, question_content=?, input_content=?, output_content=?, time_ms=?, memory_kb=?, test_public=?, test_all=?, comment_content=? WHERE task_id=?", [
        name,
        question_content,
        input_content,
        output_content,
        time_ms,
        memory_kb,
        test_public,
        test_all,
        comment_content,
        task_id,
      ]);
    else
      task_id = (
        await dbQueryMany("INSERT INTO tasks (name, question_content, input_content, output_content, time_ms, memory_kb, test_public, test_all, comment_content) VALUE (?,?,?,?,?,?,?,?,?) ", [
          name,
          question_content,
          input_content,
          output_content,
          time_ms,
          memory_kb,
          test_public,
          test_all,
          comment_content,
        ])
      ).insertId;
    res.redirect("/admin/tasksadd?task_id=" + task_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnTaskUpload = async (req, res) => {
  try {
    const task_id = req.body.task_id;
    const upload_path = path.join(__dirname, "../../data/checker/testcase", task_id);

    // Ensure a file was uploaded
    if (!req.files || !req.files.zip_file) {
      req.flash("error", "No file uploaded.");
      return res.redirect(`/admin`);
    }

    const zip_file = req.files.zip_file;

    // Ensure the upload path is ready
    if (fs.existsSync(upload_path)) {
      fs.rmSync(upload_path, { recursive: true, force: true });
    }
    fs.mkdirSync(upload_path, { recursive: true });

    const temp_zip_path = path.join(upload_path, "temp.zip");

    // Move the uploaded file to a temporary location
    await zip_file.mv(temp_zip_path);

    // Extract the ZIP file using the 'unzip' command
    exec(`unzip -o ${temp_zip_path} -d ${upload_path}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Unzip error: ${error.message}`);
        req.flash("error", `Unzip failed: ${error.message}`);
        return res.redirect(`/admin`);
      }

      if (stderr) {
        console.warn(`Unzip stderr: ${stderr}`);
      }

      // Clean up temporary ZIP file
      fs.unlinkSync(temp_zip_path);

      req.flash("success", `File unzipped to ${upload_path}`);
      res.redirect(`/admin/tasksadd?task_id=${task_id}`);
    });
  } catch (error) {
    console.error("Error during file upload or extraction:", error);
    req.flash("error", error.message);
    res.redirect(`/admin`);
  }
};

exports.fnNewsList = async (req, res) => {
  try {
    let news = await dbQueryMany("SELECT * FROM news ORDER BY news_id DESC LIMIT 20", []);
    res.render("admin/news", { page_info: "news", news });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnNewsForm = async (req, res) => {
  try {
    let news_id = req.query.news_id;
    let news = (await dbQueryOne("SELECT * FROM news WHERE news_id = ?", [news_id])) || {};
    res.render("admin/newsadd", { page_info: "newsadd", news, news_id: req.query.news_id });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnNewsSave = async (req, res) => {
  try {
    let { news_id, title, content } = req.body;
    if (news_id > 0) await dbQueryMany("UPDATE news SET title = ?, content = ? WHERE news_id = ?", [title, content, news_id]);
    else news_id = (await dbQueryMany("INSERT INTO news (title, content) VALUE (?, ?) ", [title, content])).insertId;
    res.redirect("/admin/newsadd?news_id=" + news_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};
