
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
    all_test int,
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
    task_id int not null,
    foreign key (contest_id) references contest(contest_id) on delete cascade,
    foreign key (task_id) references tasks(task_id) on delete cascade,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

insert into contest (name, type, content, start_date, end_date) values ('Test #0', 1,  '<header>
        <h4>Buxoro Davlat Universiteti Saralash Bosqichi</h4>
    </header>

    <section>
        <h5>Maqsad:</h5>
        <p>Saralash bosqichi universitetga kirishga ariza topshirgan abituriyentlarning bilim va ko‘nikmalarini baholash, eng malakali talabalarni tanlab olish uchun mo‘ljallangan.</p>

        <h5>Jarayon:</h5>
        <ul>
            <li><strong>Arizalar qabul qilish:</strong> Arizalar universitetning rasmiy saytida qabul qilinadi.</li>
            <li><strong>Imtihon:</strong> Test imtihonlari umumiy bilim va ixtisoslashgan fanlardan o‘tkaziladi.</li>
            <li><strong>Intervyu:</strong> Yaxshi natijalar ko‘rsatgan abituriyentlar bilan intervyu o‘tkaziladi.</li>
            <li><strong>Natijalar:</strong> Yakuniy natijalar rasmiy sayt orqali e''lon qilinadi.</li>
        </ul>

        <h5>Tavsiyalar:</h5>
        <ul>
            <li>Test savollariga tayyorlaning.</li>
            <li>O‘z fikrlaringizni aniq ifodalashga o‘rganing.</li>
        </ul>

        <h5>Afzalliklar:</h5>
        <ul>
            <li>Yuqori malakali o‘qituvchilar.</li>
            <li>Zamonaviy o‘quv infratuzilmasi.</li>
            <li>Xalqaro hamkorlik va karyera imkoniyatlari.</li>
        </ul>
    </section>', now(), now() + 100);-- Example data for tasks table
insert into tasks (name, sub_text, inp_text, out_text, time, memory, test_count, all_test, code, comment_text) values
('Solve Linear Equation',  'Solve the linear equation ax + b = 0 for x.', 'Input: Two integers a and b (a != 0).',
'Output: The value of x.', 1000, 64, 2, 2, '', 'Solve the equation efficiently and correctly.'),

('Find the Largest Number', 'Find the largest number in a given list of integers.', 'Input: A list of integers.', 'Output: The largest integer in the list.', 1000, 128, 2, 2, '', 'Make sure to handle both positive and negative integers.')

insert into contest_tasks (contest_id, task_id) values (1, 1), (1, 2);

drop table if exists lang;
create table lang (
    lang_id int auto_increment primary key,
    contest_type int,
    file_type varchar(255) not null,
    name varchar(255) not null,
    code varchar(255) not null,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

insert into lang (contest_type, file_type, code, name) values (1, 'cpp', 'text/x-c++src', 'C++'), (1, 'java', 'text/x-java', 'Java'), (1, 'py', 'text/x-python', 'Python3'), (1, 'js', 'text/javascript', 'Javascript'), (1, 'cs', 'text/x-csharp', 'C#');

drop table if exists attempts;
create table attempts (
  id int primary key auto_increment,
  contest_id int default '1',
  task_id int default null,
  user_id int default null,
  time int default '0',
  memory int default '0',
  event char(200) default 'Kutish',
  eventnum int default '0',
  err_testnum int default '0',
  lang char(200) default 'c++',
  updated_dt datetime default current_timestamp on update current_timestamp,
  created_dt datetime default current_timestamp
);

drop view if exists vw_contest;
create view vw_contest as
select
    c.contest_id,
    c.type,
    c.name,
    c.start_date,
    c.end_date,
    c.content,
    count(ct.task_id) as task_count,
    CONCAT(
        FLOOR(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 3600), ':',
        LPAD(MOD(TIMESTAMPDIFF(SECOND, c.start_date, c.end_date) / 60, 60), 2, '0')
    ) AS during_time,
    case
        when now() > c.end_date then 'Tugagan'
        when now() between c.start_date and c.end_date then 'Davom etmoqda'
        else 'Boshlanmagan'
    end as event,
    case
        when now() > c.end_date then 2
        when now() between c.start_date and c.end_date then 1
        else 0
    end as eventnum
from
    contest c
left join
    contest_tasks ct on c.contest_id = ct.contest_id
group by
    c.contest_id, c.name, c.start_date, c.end_date;

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

select * from vw_attempts



DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `InlineMaxFun`(val1 int, val2 int) RETURNS int
    READS SQL DATA
    DETERMINISTIC
begin

   if(val1 > val2)  then return val1;

   else return coalesce(val2,val1,0);

  end if;

end ;;
DELIMITER ;
