exports.clientInfo = (req, res, next) => {
    req.cilentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 0;
    next()
}

exports.readExample = async (task) => {
    const fs = require("fs");
    let arr = []
    try {
        for (let i = 0; i < task.test_count; i++) {
            let inp = fs.readFileSync(`./testcase/${task.code}/input${i}.txt`)
            let out = fs.readFileSync(`./testcase/${task.code}/output${i}.txt`)
            arr.push({ inp, out })
        }
    } catch (err) {
        console.log("There is an error in some read file!")
    }

    return arr;
}

exports.getQuery = (tasks) => {
    let str = ""
    for (let i = 0; i < tasks.length; i++)
        str += `COALESCE(MAX(CASE WHEN tasks_id = ${tasks[i].id} THEN count END),0) count${i + 1}, COALESCE(MAX(CASE WHEN tasks_id = ${tasks[i].id} THEN accept END),0)  isAccept${i + 1},`
    let ans = `
    with cte as (
        select users_id,
               tasks_id,
               count(*) as count ,
               max(IF(eventnum = 1, 1, 0)) as accept,
               sum(IF(eventnum > 1, 1, 0)) * 10 +  COALESCE(TIMESTAMPDIFF(MINUTE,?, MIN(IF(eventnum=1,savetime,null))),0) as error
        from attempts
        where contest_id = ?
        group by users_id, tasks_id
    )
    SELECT          users.username ,
                    users.full_name ,
                    ${str}
                    COALESCE(SUM(error),0)as error,
                    COALESCE(SUM(accept),0) as accept,
                    dense_rank()    over (ORDER BY COALESCE(SUM(accept),0) desc,COALESCE(SUM(error),0)) as num
    FROM cte INNER JOIN  users ON cte.users_id =  users.id and users.role<>'admin'
    GROUP BY   users.username,users.full_name 
    ORDER BY accept desc, error`
    return ans;
}
