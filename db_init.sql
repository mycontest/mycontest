
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