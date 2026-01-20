INSERT INTO languages (name, file_extension, compile_script, run_script, docker_image) VALUES 
('C++', 'cpp', 'g++ -o main main.cpp', './main', 'gcc:latest'),
('Python', 'py', 'python main.py', 'python main.py', 'python:3.9-slim'),
('Java', 'java', 'javac Main.java', 'java Main', 'openjdk:17-slim'),
('MySQL', 'sql', 'mysql -u root -p', 'mysql -u root -p', 'mysql:latest');

INSERT INTO users (name, email, username, password, role) VALUES 
('Admin User', 'admin@example.com', 'admin', '$2b$10$oW5H7X9e4ba3PZGthSqVZu4k7o6yNxsONf6PyF3M1rkou.KTcpKr.', 'admin'); 
-- username: admin, password: password

INSERT INTO problem_details (name, content, points, time_ms, memory_kb, test_public, test_all) VALUES 
('A+B', 'Calculate the sum of two integers A and B.', 100, 1000, 256000, '1 2\n', '1 2\n3\n|5 10\n15\n');

INSERT INTO contest_details (name, content, type, start_date, duration_min) VALUES 
('Contest 1', 'Description for Contest 1', 'public', '2025-01-01 00:00:00', 60);