-- 1. USERS: Bir nechta insertni bitta so'rovda guruhlash
INSERT INTO users (username, email, full_name, password, role, subscription) VALUES
('admin', 'admin@mycontest.com', 'System Administrator', MD5('cAD62VlzeB7jb4wnL5xc4y8admin123'), 'admin', 'business'),
('demo_user', 'demo@mycontest.com', 'Demo User', MD5('cAD62VlzeB7jb4wnL5xc4y8user123'), 'user', 'free'),
('john_doe', 'john@example.com', 'John Doe', MD5('cAD62VlzeB7jb4wnL5xc4y8user123'), 'organization', 'plus')
ON DUPLICATE KEY UPDATE role=VALUES(role), subscription=VALUES(subscription);

-- 2. LANGUAGES: Docker va buyruqlarni bitta blokda yozish
INSERT INTO languages (lang_name, lang_code, file_extension, compile_command, run_command, docker_image) VALUES
('Python 3', 'python', 'py', NULL, 'python3 {file}', 'python:3.11-slim'),
('Node.js', 'javascript', 'js', NULL, 'node {file}', 'node:20-slim'),
('MySQL', 'sql', 'sql', NULL, 'mysql -h localhost -u root < {file}', 'mysql:8.0'),
('C++17', 'cpp', 'cpp', 'g++ -std=c++17 -O2 -o {exe} {file}', './{exe}', 'gcc:13'),
('Java 17', 'java', 'java', 'javac {file}', 'java {class}', 'openjdk:17-slim')
ON DUPLICATE KEY UPDATE docker_image=VALUES(docker_image);

-- 3. PROBLEMS & LANGUAGES & TEST CASES (Two Sum)
-- To'g'ridan-to'g'ri slug orqali sub-query ishlatamiz, @variable-larsiz
INSERT INTO problems (title, slug, difficulty, description, created_by, is_global) 
VALUES ('Two Sum', 'two-sum', 'easy', 'Find two numbers that add up to target.', 1, true)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO problem_languages (problem_id, lang_id, template_code) 
SELECT problem_id, 1, 'def two_sum(nums, target): pass' FROM problems WHERE slug = 'two-sum'
UNION ALL
SELECT problem_id, 2, 'function twoSum(nums, target) {}' FROM problems WHERE slug = 'two-sum';

INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample)
SELECT problem_id, 'in/01.txt', 'out/01.txt', TRUE FROM problems WHERE slug = 'two-sum';

-- 4. CONTESTS
INSERT INTO contests (title, start_time, end_time, status, is_global, creator_id) VALUES
('Beginner Contest #1', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY), 'upcoming', TRUE, 1)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Masalalarni contestga bog'lash
INSERT INTO contest_problems (contest_id, problem_id, problem_order)
SELECT c.contest_id, p.problem_id, 1 
FROM contests c, problems p 
WHERE c.title = 'Beginner Contest #1' AND p.slug = 'two-sum'
ON DUPLICATE KEY UPDATE problem_order=VALUES(problem_order);

-- Natijani tekshirish
SELECT 'Database Seeded!' AS status;