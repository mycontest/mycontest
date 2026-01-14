
drop database if exists mycontest;
create database mycontest;
use mycontest;

drop table if exists users;
create table users (
    user_id int auto_increment primary key,
    full_name varchar(200),
    email varchar(200),
    email_verified boolean default false,
    verification_token varchar(200),
    username varchar(200) unique,
    password varchar(200),
    role enum('admin', 'user') default 'user',
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

drop table if exists problems;
create table problems (
    problem_id int auto_increment primary key,
    group_id int default 1 comment '1=Programming, 2=SQL',
    admin_id int,
    name varchar(255) not null,
    question_content text comment 'Main problem description',
    input_content text comment 'Input format description',
    output_content text comment 'Output format description',
    time_ms int comment 'Time limit in milliseconds',
    memory_kb int comment 'Memory limit in kilobytes',
    test_public int comment 'Number of public test cases shown to users',
    test_all int comment 'Total number of test cases including hidden',
    comment_content text comment 'Additional notes or hints',
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

drop table if exists contest;
create table contest (
    contest_id int auto_increment primary key,
    name varchar(255) not null,
    content text,
    contest_type enum('public', 'private') default 'public',
    admin_id int,
    group_id int default 1 comment '1=Programming, 2=SQL',
    start_date datetime not null,
    end_date datetime not null,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

drop table if exists contest_problems;
create table contest_problems (
    contest_problem_id int auto_increment primary key,
    contest_id int not null,
    problem_id int not null,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp,
    foreign key (contest_id) references contest(contest_id) on delete cascade,
    foreign key (problem_id) references problems(problem_id) on delete cascade
);

drop table if exists contest_participants;
create table contest_participants (
    participant_id int auto_increment primary key,
    contest_id int not null,
    user_id int not null,
    foreign key (contest_id) references contest(contest_id) on delete cascade,
    foreign key (user_id) references users(user_id) on delete cascade,
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp,
    unique key unique_participant (contest_id, user_id)
);

drop table if exists languages;
create table languages (
    language_id int auto_increment primary key,
    group_id int comment 'Group of related languages (e.g., C/C++/Java group)',
    language_name varchar(255) not null comment 'Display name (e.g., GNU GCC C++20)',
    editor_mode varchar(255) not null comment 'CodeMirror mode (e.g., text/x-c++src)',
    compile_script varchar(200) not null comment 'Compilation command or - for interpreted',
    run_script varchar(200) not null comment 'Execution command',
    file_extension varchar(50) not null comment 'Source file extension (e.g., cpp, py, java)',
    docker_image varchar(255) not null comment 'Docker image name (e.g., checker-cpp)',
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

drop table if exists attempts;
create table attempts (
    attempt_id int primary key auto_increment,
    contest_id int default 1,
    problem_id int default null,
    user_id int default null,
    code mediumtext,
    time_ms int default 0 comment 'Execution time in milliseconds',
    memory_kb int default 0 comment 'Memory used in kilobytes',
    status_message varchar(200) default 'Running' comment 'Human-readable status (e.g., Accepted, Wrong Answer #1)',
    status_code int default 0 comment 'Numeric status: 0=Running, 1=Accepted, 2=Wrong Answer, 3=Time Limit, 4=Presentation Error, 5=Compilation Error, 6=Memory Limit, 7=Runtime Error, 10=Server Error',
    error_details varchar(3000) default '' comment 'Error messages and additional execution details',
    language_used varchar(200) default 'GNU GCC C++20' comment 'Programming language name that was used for submission',
    updated_dt datetime default current_timestamp on update current_timestamp,
    created_dt datetime default current_timestamp
);

