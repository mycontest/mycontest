const { dbQueryMany, dbQueryOne } = require("../../shared/mysql");
const { fnGetFolderInfo } = require("../../shared/helpers");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

exports.fnHome = async (req, res) => {
  try {
    let active_contests = (await dbQueryOne("SELECT count(*) as count FROM contest WHERE now() BETWEEN start_date AND end_date"))?.count || 0;
    let problems_count = (await dbQueryOne("SELECT count(*) as count FROM problems"))?.count || 0;
    let users_count = (await dbQueryOne("SELECT count(*) as count FROM users"))?.count || 0;

    let recent_contests = await dbQueryMany("SELECT * FROM contest ORDER BY contest_id DESC LIMIT 5");
    let recent_problems = await dbQueryMany("SELECT * FROM problems ORDER BY problem_id DESC LIMIT 5");

    return res.render("admin/index", {
      page_info: "home",
      active_contests,
      problems_count,
      users_count,
      recent_contests,
      recent_problems,
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

    let problems = await dbQueryMany("SELECT * FROM problems WHERE problem_id in (SELECT problem_id FROM contest_problems WHERE contest_id=?)", [contest_id]);
    res.render("admin/contestadd", { page_info: "contestadd", contest, problems, contest_id: req.query.contest_id });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnContestRemoveProblem = async (req, res) => {
  try {
    let { problem_id, contest_id } = req.query;
    await dbQueryMany("DELETE FROM contest_problems WHERE problem_id = ? and contest_id=?", [problem_id, contest_id]);
    res.redirect("/admin/contestadd?contest_id=" + contest_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnContestSave = async (req, res) => {
  try {
    let { contest_id, start_date, end_date, name, content, contest_type, group_id } = req.body;
    const admin_id = req.session.data.user_id;
    contest_id = parseInt(contest_id);

    if (contest_id > 0) {
      await dbQueryMany("UPDATE contest SET start_date=?, end_date=?, name=?, content=?, contest_type=?, group_id=?, admin_id=? WHERE contest_id = ?", [start_date, end_date, name, content, contest_type || "public", group_id || 1, admin_id, contest_id]);
    } else {
      contest_id = (await dbQueryMany("INSERT INTO contest (start_date, end_date, name, content, contest_type, group_id, admin_id) VALUE (?,?,?,?,?,?,?)", [start_date, end_date, name, content, contest_type || "public", group_id || 1, admin_id])).insertId;
    }
    res.redirect("/admin/contestadd?contest_id=" + contest_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnContestDelete = async (req, res) => {
  try {
    const contest_id = req.query.contest_id;
    await dbQueryMany("DELETE FROM contest WHERE contest_id = ?", [contest_id]);
    req.flash("success", "Musobaqa o'chirildi");
    res.redirect("/admin/contest");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/admin/contest");
  }
};

exports.fnContestAddProblem = async (req, res) => {
  try {
    let { problem_id, contest_id } = req.body;
    await dbQueryMany("INSERT INTO contest_problems (problem_id, contest_id) VALUE (?, ?)", [problem_id, contest_id]);
    res.redirect("/admin/contestadd?contest_id=" + contest_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnProblemList = async (req, res) => {
  try {
    let page = req.query.page || 0;
    let count = (await dbQueryOne("SELECT count(*) as count FROM problems")).count / 20 + 1;
    let problems_list = await dbQueryMany("SELECT * FROM problems ORDER BY problem_id DESC LIMIT ?, 20", [page * 20]);
    res.render("admin/problems", { page_info: "problems", problems_list, page, count });
  } catch (err) {
    req.flash("error", err.message);
    req.session.save(() => res.redirect(`/admin`));
  }
};

exports.fnProblemForm = async (req, res) => {
  try {
    let problem_id = req.query.problem_id;
    let problem = (await dbQueryOne("SELECT * FROM problems WHERE problem_id = ?", [problem_id])) || {};
    let files = fnGetFolderInfo(path.join(__dirname, "../../data/checker/testcase", problem_id || "-1"));
    res.render("admin/problemsadd", { page_info: "problemsadd", problem, files });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnProblemSave = async (req, res) => {
  try {
    let { problem_id, name, question_content, input_content, output_content, time_ms, memory_kb, test_public, test_all, comment_content, group_id } = req.body;
    const admin_id = req.session.data.user_id;
    problem_id = parseInt(problem_id);

    if (problem_id > 0)
      await dbQueryMany("UPDATE problems SET name=?, question_content=?, input_content=?, output_content=?, time_ms=?, memory_kb=?, test_public=?, test_all=?, comment_content=?, group_id=?, admin_id=? WHERE problem_id=?", [
        name,
        question_content,
        input_content,
        output_content,
        time_ms,
        memory_kb,
        test_public,
        test_all,
        comment_content,
        group_id || 1,
        admin_id,
        problem_id,
      ]);
    else
      problem_id = (
        await dbQueryMany("INSERT INTO problems (name, question_content, input_content, output_content, time_ms, memory_kb, test_public, test_all, comment_content, group_id, admin_id) VALUE (?,?,?,?,?,?,?,?,?,?,?) ", [
          name,
          question_content,
          input_content,
          output_content,
          time_ms,
          memory_kb,
          test_public,
          test_all,
          comment_content,
          group_id || 1,
          admin_id,
        ])
      ).insertId;
    res.redirect("/admin/problemsadd?problem_id=" + problem_id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

exports.fnProblemDelete = async (req, res) => {
  try {
    const problem_id = req.query.problem_id;
    // Also remove test cases? Maybe.
    const upload_path = path.join(__dirname, "../../data/checker/testcase", problem_id.toString());
    if (fs.existsSync(upload_path)) {
      fs.rmSync(upload_path, { recursive: true, force: true });
    }

    await dbQueryMany("DELETE FROM problems WHERE problem_id = ?", [problem_id]);
    req.flash("success", "Masala o'chirildi");
    res.redirect("/admin/problems");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/admin/problems");
  }
};

exports.fnProblemUpload = async (req, res) => {
  try {
    const problem_id = req.body.problem_id;
    const upload_path = path.join(__dirname, "../../data/checker/testcase", problem_id);

    // Ensure a file was uploaded
    if (!req.files || !req.files.zip_file) {
      req.flash("error", "No file uploaded.");
      return res.redirect(`/admin/problemsadd?problem_id=${problem_id}`);
    }

    const zip_file = req.files.zip_file;

    // Check file size limit (10MB)
    const max_size = 10 * 1024 * 1024; // 10MB in bytes
    if (zip_file.size > max_size) {
      req.flash("error", "Fayl hajmi 10MB dan oshmasligi kerak.");
      return res.redirect(`/admin/problemsadd?problem_id=${problem_id}`);
    }

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
      res.redirect(`/admin/problemsadd?problem_id=${problem_id}`);
    });
  } catch (error) {
    console.error("Error during file upload or extraction:", error);
    req.flash("error", error.message);
    res.redirect(`/admin`);
  }
};

exports.fnEmailLogs = async (req, res) => {
  try {
    let page = req.query.page || 0;
    let count = (await dbQueryOne("SELECT count(*) as count FROM email_logs")).count / 20 + 1;
    let logs = await dbQueryMany("SELECT * FROM email_logs ORDER BY created_dt DESC LIMIT ?, 20", [page * 20]);
    res.render("admin/emaillogs", { page_info: "emaillogs", logs, page, count });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

// ==================== USER MANAGEMENT ====================
exports.fnUserList = async (req, res) => {
  try {
    let page = req.query.page || 0;
    let count = (await dbQueryOne("SELECT count(*) as count FROM users")).count / 20 + 1;
    let users = await dbQueryMany("SELECT user_id, username, full_name, email, email_verified, role, created_dt FROM users ORDER BY user_id DESC LIMIT ?, 20", [page * 20]);
    res.render("admin/users", { page_info: "users", users, page, count });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin`);
  }
};

// ==================== CONTEST PARTICIPANTS ====================
exports.fnContestParticipants = async (req, res) => {
  try {
    const contest_id = req.query.contest_id;
    const contest = await dbQueryOne("SELECT * FROM contest WHERE contest_id = ?", [contest_id]);

    if (!contest) {
      req.flash("error", "Contest topilmadi");
      return res.redirect("/admin/contest");
    }

    const participants = await dbQueryMany(
      `SELECT u.user_id, u.username, u.full_name, u.email, cp.created_dt
       FROM contest_participants cp
       JOIN users u ON cp.user_id = u.user_id
       WHERE cp.contest_id = ?
       ORDER BY cp.created_dt DESC`,
      [contest_id]
    );

    const all_users = await dbQueryMany("SELECT user_id, username, full_name, email FROM users ORDER BY username");

    res.render("admin/participants", {
      page_info: "participants",
      contest,
      participants,
      all_users,
      contest_id,
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin/contest`);
  }
};

exports.fnAddParticipant = async (req, res) => {
  try {
    const { contest_id, user_id } = req.body;
    await dbQueryMany("INSERT IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)", [contest_id, user_id]);
    req.flash("success", "Ishtirokchi qo'shildi");
    res.redirect(`/admin/participants?contest_id=${contest_id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin/contest`);
  }
};

exports.fnRemoveParticipant = async (req, res) => {
  try {
    const { contest_id, user_id } = req.query;
    await dbQueryMany("DELETE FROM contest_participants WHERE contest_id = ? AND user_id = ?", [contest_id, user_id]);
    req.flash("success", "Ishtirokchi o'chirildi");
    res.redirect(`/admin/participants?contest_id=${contest_id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin/contest`);
  }
};

// ==================== EMAIL NOTIFICATIONS ====================
exports.fnSendContestNotification = async (req, res) => {
  try {
    const { contest_id } = req.body;
    const { sendContestNotification } = require("../../shared/email");

    const contest = await dbQueryOne("SELECT * FROM contest WHERE contest_id = ?", [contest_id]);
    if (!contest) {
      req.flash("error", "Contest topilmadi");
      return res.redirect("/admin/contest");
    }

    // Get top 1000 active users (users with at least one submission)
    const active_users = await dbQueryMany(
      `SELECT DISTINCT u.user_id, u.username, u.full_name, u.email
       FROM users u
       JOIN attempts a ON u.user_id = a.user_id
       WHERE u.email IS NOT NULL AND u.email_verified = TRUE
       ORDER BY a.created_dt DESC
       LIMIT 1000`,
      []
    );

    const result = await sendContestNotification(active_users, contest);
    req.flash("success", `Email yuborildi: ${result.sent} muvaffaqiyatli, ${result.failed} xato`);
    res.redirect(`/admin/contestadd?contest_id=${contest_id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin/contest`);
  }
};

// ==================== ADMIN CHECKER ====================
exports.fnCheckerPage = async (req, res) => {
  try {
    const problem_id = req.query.problem_id;
    const problem = await dbQueryOne("SELECT * FROM problems WHERE problem_id = ?", [problem_id]);

    if (!problem) {
      req.flash("error", "Problem topilmadi");
      return res.redirect("/admin/problems");
    }

    const languages = await dbQueryMany("SELECT * FROM languages ORDER BY language_name");
    res.render("admin/checker", { page_info: "checker", problem, languages });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/admin/problems`);
  }
};
