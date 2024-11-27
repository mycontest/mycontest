
drop database if exists my_contest;
create database my_contest;
use my_contest ;

drop table if exists users;
create table users (
    user_id int auto_increment primary key,
    full_name varchar(200),
    email varchar(200),
    username varchar(200) unique ,
    password varchar(200),
    role enum('admin', 'user') default 'user',
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

insert into users (full_name, email, username, password, role)
values ('Utkir Khujaev', 'balkibumen@gmail.com', 'admin', md5('!123456:A9fG3kL1mNpQrS7tUvWzYx8J6oVb'), 'admin'),
       ('Utkir Khujaev', 'balkibumen@gmail.com', 'user', md5('!123456:A9fG3kL1mNpQrS7tUvWzYx8J6oVb'), 'user');

select * from users ;

-- create tasks table
drop table if exists tasks;
create table tasks (
    task_id int auto_increment primary key,
    name varchar(255) not null,
    sub_text text,
    inp_text text,
    out_text text,
    time int,
    memory int,
    test_count int,
    all_test text,
    code varchar(255),
    comment_text text,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

drop table if exists contest;
create table contest (
    contest_id int auto_increment primary key,
    name varchar(255) not null,
    type int,
    content text,
    start_date datetime not null,
    end_date datetime not null,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

drop table if exists contest_tasks;
create table contest_tasks (
    key_id int auto_increment primary key,
    contest_id int not null,
    tasks_id int not null,
    foreign key (contest_id) references contest(contest_id) on delete cascade,
    foreign key (tasks_id) references tasks(task_id) on delete cascade,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

insert into contest (name, content, start_date, end_date) values ('Test #0', '<b>Hi</b>', now(), now());

drop table if exists langs;
create table contest (
    contest_id int auto_increment primary key,
    name varchar(255) not null,
    type int,
    content text,
    start_date datetime not null,
    end_date datetime not null,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);


drop view if exists v_contest;
create view v_contest as
select
    c.contest_id,
    c.name,
    c.start_date,
    c.end_date,
    count(ct.tasks_id) as task_count,
    date_format(timediff(c.end_date, c.start_date), '%H:%i') as during_time,
    case
        when now() > c.end_date then 'Tugagan'
        when now() between c.start_date and c.end_date then 'Davom etmoqda'
        else 'Boshlanmagan'
    end as event,
    case
        when now() > c.end_date then 2
        when now() between c.start_date and c.end_date then 0
        else 1
    end as eventnum
from
    contest c
left join
    contest_tasks ct on c.contest_id = ct.contest_id
group by
    c.contest_id, c.name, c.start_date, c.end_date;

/*
SELECT t1.name, t1.id, ifnull(status, 0)  as status
FROM v_tasks t1
LEFT JOIN (
       SELECT contest_id , tasks_id, min(if(eventnum > 0, eventnum, 10)) as status
       FROM attempts
       WHERE users_id = ?
       GROUP BY  contest_id , tasks_id
) as t2 ON t1.contest_id = t2.contest_id and t1.id = t2.tasks_id
WHERE contest_id = ?
*/