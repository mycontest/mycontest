const fs = require("fs");
const path = require("path");

exports.fnReadPublicTests = async (task) => {
  let public_tests = [];
  try {
    for (let i = 1; i <= task.test_public; i++) {
      let inp = fs.readFileSync(path.join(__dirname, `../data/checker/testcase/${task.task_id}/input${i}.txt`));
      let out = fs.readFileSync(path.join(__dirname, `../data/checker/testcase/${task.task_id}/output${i}.txt`));
      public_tests.push({ inp, out });
    }
  } catch (err) {
    console.log("There is an error in some read file!", err.message);
  }
  return public_tests;
};

exports.fnGetFolderInfo = (folder_path) => {
  try {
    files = fs.readdirSync(folder_path, { withFileTypes: true });

    const file_details = files.map((file) => {
      const file_path = path.join(folder_path, file.name);
      const stats = fs.statSync(file_path);

      const last_modified = stats.mtime.toString().split("T")[0];
      const size_in_kb = (stats.size / 1024).toFixed(2);

      return {
        name: file.name,
        type: file.isDirectory() ? "Directory" : "File",
        size: size_in_kb,
        last_modified: last_modified,
      };
    });

    return file_details.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  } catch (err) {
    return [];
  }
};

exports.fnGetRatingBoard = (tasks) => {
  let str = "";
  for (let i = 0; i < tasks.length; i++) {
    str += `COALESCE(MAX(CASE WHEN task_id = ${tasks[i].task_id} THEN count END),0) count${i + 1}, COALESCE(MAX(CASE WHEN task_id = ${tasks[i].task_id} THEN accept END),0) is_accept${i + 1}, COALESCE(MAX(CASE WHEN task_id = ${tasks[i].task_id} THEN accept_time END),0) accept_time${i + 1},`;
  }

  return `
        set @contest_time = ?;

        with cte as (
            select user_id,
                task_id,
                count(*) as count ,
                max(if(status_code = 1, 1, 0)) as accept,
                min(CONCAT(
                        CASE
                            WHEN CHAR_LENGTH(FLOOR(TIMESTAMPDIFF(SECOND, @contest_time, created_dt) / 3600)) < 2 THEN LPAD(FLOOR(TIMESTAMPDIFF(SECOND, @contest_time, created_dt) / 3600), 2, '0')
                            ELSE FLOOR(TIMESTAMPDIFF(SECOND, @contest_time, created_dt) / 3600)
                        END,
                        ':',
                        CASE
                            WHEN CHAR_LENGTH(MOD(FLOOR(TIMESTAMPDIFF(SECOND, @contest_time, created_dt) / 60), 60)) < 2 THEN LPAD(MOD(FLOOR(TIMESTAMPDIFF(SECOND, @contest_time, created_dt) / 60), 60), 2, '0')
                            ELSE MOD(FLOOR(TIMESTAMPDIFF(SECOND, @contest_time, created_dt) / 60), 60)
                        END
                )) as accept_time,
                sum(if(status_code > 1, 1, 0)) * 10 + COALESCE(TIMESTAMPDIFF(MINUTE, @contest_time, min(if(status_code = 1, created_dt, null))), 0) as penalty
            from attempts
            where contest_id = ?
            group by user_id, task_id
        )

        SELECT
            users.username,
            users.full_name,
            ${str}
            COALESCE(SUM(if(accept=1, penalty, 0)), 0) as penalty,
            COALESCE(SUM(accept), 0) as accept,
            dense_rank() over (ORDER BY COALESCE(SUM(accept),0) desc, COALESCE(SUM(if(accept=1, penalty, 0)),0)) as num
        FROM cte
        INNER JOIN users ON cte.user_id = users.user_id and users.role <> 'admin'
        GROUP BY users.username, users.full_name
        ORDER BY accept desc, penalty`;
};

exports.fnGetTasksQuery = () => {
  return `SELECT t1.name, t1.task_id, ifnull(status, 0) as status FROM vw_tasks t1
          LEFT JOIN (
              SELECT contest_id, task_id, min(if(status_code > 0, status_code, 10)) as status FROM attempts
              WHERE user_id = ?
              GROUP BY contest_id, task_id
          ) as t2
          ON t1.contest_id = t2.contest_id and t1.task_id = t2.task_id
          WHERE t1.contest_id = ?`;
};
