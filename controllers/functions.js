const fs = require("fs");

exports.clientInfo = (req, res, next) => {
    req.cilentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 0;
    next()
}

exports.readCode = (code_path) => {
    try {
        return fs.readFileSync(code_path, { encoding: "utf-8" }) || 0;
    } catch (err) {
        console.log(err.message)
        return "Not found!";
    }
};

exports.readExample = async (task) => {
    const fs = require("fs");
    let arr = []
    try {
        for (let i = 0; i < task.test_count; i++) {
            let inp = fs.readFileSync(`./testcase/${task.task_id}/input${i}.txt`)
            let out = fs.readFileSync(`./testcase/${task.task_id}/output${i}.txt`)
            arr.push({ inp, out })
        }
    } catch (err) {
        console.log("There is an error in some read file!")
    }
    return arr;
}

exports.getQuery = (tasks) => {
    let str = ""
    for (let i = 0; i < tasks.length; i++) {
        str += `COALESCE(MAX(CASE WHEN task_id = ${tasks[i].task_id} THEN count END),0) count${i + 1}, COALESCE(MAX(CASE WHEN task_id = ${tasks[i].task_id} THEN accept END),0)  isAccept${i + 1},`
    }

    let ans = `
    with cte as (
        select user_id,
               task_id,
               count(*) as count ,
               max(IF(eventnum = 1, 1, 0)) as accept,
               sum(IF(eventnum > 1, 1, 0)) * 10 + COALESCE(TIMESTAMPDIFF(MINUTE,?, MIN(IF(eventnum=1, created_dt,null))),0) as error
        from attempts
        where contest_id = ?
        group by user_id, task_id
    )
     SELECT         users.username,
                    users.full_name,
                    ${str}
                    COALESCE(SUM(error),0)as error,
                    COALESCE(SUM(accept),0) as accept,
                    dense_rank() over (ORDER BY COALESCE(SUM(accept),0) desc,COALESCE(SUM(error),0)) as num
    FROM cte INNER JOIN  users ON cte.user_id =  users.user_id and users.role<>'admin'
    GROUP BY users.username,users.full_name 
    ORDER BY accept desc, error`
    return ans;
}


exports.getTasksQuery = () => {
    return `SELECT t1.name, t1.task_id, ifnull(status, 0) as status FROM vw_tasks t1
            LEFT JOIN (
                SELECT contest_id, task_id, min(if(eventnum > 0, eventnum, 10)) as status FROM attempts
                WHERE user_id = ?
                GROUP BY contest_id, task_id
            ) as t2
            ON t1.contest_id = t2.contest_id and t1.task_id = t2.task_id
            WHERE t1.contest_id = ?`
}