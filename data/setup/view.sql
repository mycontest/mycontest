
drop view if exists vw_contest;
create view vw_contest as
select
    c.contest_id,
    c.name,
    c.start_date,
    c.end_date,
    c.content,
    count(ct.task_id) as task_count,
    CONCAT(
        CASE
            WHEN CHAR_LENGTH(FLOOR(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 3600)) < 2 THEN LPAD(FLOOR(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 3600), 2, '0')
            ELSE FLOOR(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 3600)
        END,
        ':',
        CASE
            WHEN CHAR_LENGTH(MOD(FLOOR(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 60), 60)) < 2 THEN LPAD(MOD(FLOOR(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 60), 60), 2, '0')
            ELSE MOD(FLOOR(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 60), 60)
        END
    ) AS during_time,
    case
        when now() > c.end_date then 'Tugagan'
        when now() between c.start_date and c.end_date then 'Faol'
        else 'Boshlanmadi'
    end as event,
    case
        when now() > c.end_date then 2
        when now() between c.start_date and c.end_date then 1
        else 0
    end as event_num
from
    contest c
left join
    contest_tasks ct on c.contest_id = ct.contest_id
group by
    c.contest_id, c.name, c.start_date, c.end_date
order by c.start_date desc, c.end_date desc;

drop view if exists vw_tasks;
create view vw_tasks as
    select
        t1.contest_id,
        t2.*
    from contest_tasks t1
    left join tasks t2 on t1.task_id = t2.task_id;

drop view if exists vw_attempts;
create view vw_attempts as
select
    u.full_name,
    u.username,
    u.role,
    a.*
from attempts a
left join users u on a.user_id = u.user_id ;
