
-- Insert users
insert into users (full_name, email, username, password, role)
values ('Utkir Khujaev', 'balkibumen@gmail.com', 'admin', md5('admin:SecretKey123!MyContest2026'), 'admin'),
       ('Test User', 'user@example.com', 'user', md5('user123:SecretKey123!MyContest2026'), 'user');

-- Insert contest
insert into contest (name, content, start_date, end_date) 
values ('Sinov #0', '<header><h4>Buxoro Davlat Universiteti Saralash Bosqichi</h4></header>', now(), date_add(now(), interval 7 day));

-- Insert problems
insert into problems (group_id, name, question_content, input_content, output_content, time_ms, memory_kb, test_public, test_all, comment_content) values
(1, 'Solve Linear Equation',  
 'Solve the linear equation ax + b = 0 for x.', 
 'Input: Two integers a and b (a != 0).', 
 'Output: The value of x.', 
 1000, 65536, 2, 2, 
 'Solve the equation efficiently and correctly.'),
 
(1, 'Find the Largest Number', 
 'Find the largest number in a given list of integers.', 
 'Input: A list of integers.', 
 'Output: The largest integer in the list.', 
 1000, 131072, 2, 2, 
 'Make sure to handle both positive and negative integers.');

-- Insert contest_problems
insert into contest_problems (contest_id, problem_id) values (1, 1), (1, 2);

-- Insert languages
insert into languages (group_id, file_extension, editor_mode, language_name, compile_script, run_script, docker_image) values
(1, 'cpp', 'text/x-c++src', 'GNU GCC C++20', 'g++ source.cpp -o executable -std=c++20', './executable', 'checker-cpp'),
(1, 'java', 'text/x-java', 'Java 21.0.5', 'javac Main.java', 'java Main', 'checker-java'),
(1, 'py', 'text/x-python', 'Python 3.12.3', '-', 'python3 source.py', 'checker-python'),
(1, 'js', 'text/javascript', 'Node.js 20.x', '-', 'node source.js', 'checker-nodejs'),
(1, 'cs', 'text/x-csharp', 'C# Mono', 'mono-csc source.cs', 'mono source.exe', 'checker-csharp'),
(1, 'go', 'text/x-go', 'Go 1.21+', 'go build -o executable source.go', './executable', 'checker-go');
