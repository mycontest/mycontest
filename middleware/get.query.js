let getQuery = (tasks) => {
    let str = ""
    for (let i = 0; i < tasks.length; i++)
        str += `COALESCE(MAX(CASE WHEN tasks_id = ${tasks[i].id} THEN count END),0) count${i + 1},
           COALESCE(MAX(CASE WHEN tasks_id = ${tasks[i].id} THEN accept END),0)  isAccept${i + 1},`

    let ans = `
    with cte as (
        select users_id,
               tasks_id,
               count(*) as count ,
               max(IF(eventnum = 1, 1, 0)) as accept,
               sum(IF(eventnum > 1, 1, 0)) * 10 +  COALESCE(TIMESTAMPDIFF(MINUTE,?, MIN(IF(eventnum=1,savetime,null))),0) as error
        from attempts
        where cid = ?
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

module.exports = getQuery