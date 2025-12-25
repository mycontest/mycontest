-- ================================================================
-- MYCONTEST PLATFORM - SEED DATA
-- Demo users, languages, and sample problems
-- ================================================================

USE my_contest;

-- ================================================================
-- 1. SEED USERS (password: admin123, user123)
-- ================================================================
INSERT INTO users (username, email, full_name, password, role, subscription, total_score) VALUES
('admin', 'admin@mycontest.com', 'System Administrator', '0192023a7bbd73250516f069df18b500', 'admin', 'premium', 0),
('demo_user', 'demo@mycontest.com', 'Demo User', 'ab86a1e1ef70dff97959067b723c5c24', 'user', 'basic', 0),
('john_doe', 'john@example.com', 'John Doe', 'ab86a1e1ef70dff97959067b723c5c24', 'user', 'pro', 0);

-- ================================================================
-- 2. SEED LANGUAGES (Python, JavaScript, SQL, C++, Java)
-- ================================================================
INSERT INTO languages (lang_name, lang_code, file_extension, compile_command, run_command, docker_image) VALUES
('Python 3', 'python', 'py', NULL, 'python3 {file}', 'python:3.11-slim'),
('JavaScript (Node.js)', 'javascript', 'js', NULL, 'node {file}', 'node:20-slim'),
('SQL (MySQL)', 'sql', 'sql', NULL, 'mysql -h localhost -u root -p < {file}', 'mysql:8.0'),
('C++17', 'cpp', 'cpp', 'g++ -std=c++17 -O2 -o {exe} {file}', './{exe}', 'gcc:13'),
('Java 17', 'java', 'java', 'javac {file}', 'java {class}', 'openjdk:17-slim');

-- ================================================================
-- 3. SEED SAMPLE PROBLEM: Two Sum
-- ================================================================
INSERT INTO problems (title, slug, difficulty, description, input_format, output_format, constraints, time_limit, memory_limit, created_by) VALUES
(
    'Two Sum',
    'two-sum',
    'easy',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    'First line: space-separated integers (array)\nSecond line: target integer',
    'Two space-separated integers (indices)',
    '- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists',
    2000,
    256,
    1
);

-- Add Python template for Two Sum
INSERT INTO problem_languages (problem_id, lang_id, template_code) VALUES
(
    1,
    1,
    'def two_sum(nums, target):\n    # Write your code here\n    pass\n\n# Read input\nnums = list(map(int, input().split()))\ntarget = int(input())\n\n# Get result\nresult = two_sum(nums, target)\nprint(result[0], result[1])'
);

-- Add JavaScript template for Two Sum
INSERT INTO problem_languages (problem_id, lang_id, template_code) VALUES
(
    1,
    2,
    'function twoSum(nums, target) {\n    // Write your code here\n}\n\nconst readline = require(''readline'');\nconst rl = readline.createInterface({\n    input: process.stdin\n});\n\nlet lines = [];\nrl.on(''line'', (line) => {\n    lines.push(line);\n}).on(''close'', () => {\n    const nums = lines[0].split('' '').map(Number);\n    const target = parseInt(lines[1]);\n    const result = twoSum(nums, target);\n    console.log(result[0], result[1]);\n});'
);

-- Add test cases for Two Sum
INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample, points, test_order) VALUES
(1, '2 7 11 15\n9', '0 1', TRUE, 10, 1),
(1, '3 2 4\n6', '1 2', TRUE, 10, 2),
(1, '3 3\n6', '0 1', FALSE, 10, 3),
(1, '1 5 3 7 9\n12', '2 4', FALSE, 10, 4),
(1, '-1 -2 -3 -4 -5\n-8', '2 4', FALSE, 10, 5);

-- ================================================================
-- 4. SEED SAMPLE PROBLEM: FizzBuzz
-- ================================================================
INSERT INTO problems (title, slug, difficulty, description, input_format, output_format, constraints, time_limit, memory_limit, created_by) VALUES
(
    'FizzBuzz',
    'fizzbuzz',
    'easy',
    'Given an integer n, return a string array answer (1-indexed) where:\n\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.',
    'Single integer n',
    'n lines, each containing the FizzBuzz result for that number',
    '1 <= n <= 10^4',
    1000,
    128,
    1
);

-- Add Python template for FizzBuzz
INSERT INTO problem_languages (problem_id, lang_id, template_code) VALUES
(
    2,
    1,
    'def fizzbuzz(n):\n    # Write your code here\n    pass\n\nn = int(input())\nresult = fizzbuzz(n)\nfor item in result:\n    print(item)'
);

-- Add test cases for FizzBuzz
INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample, points, test_order) VALUES
(2, '3', '1\n2\nFizz', TRUE, 20, 1),
(2, '5', '1\n2\nFizz\n4\nBuzz', TRUE, 20, 2),
(2, '15', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', FALSE, 20, 3);

-- ================================================================
-- 5. CREATE SAMPLE CONTEST
-- ================================================================
INSERT INTO contests (title, description, start_time, end_time, status, is_public, created_by) VALUES
(
    'Beginner Contest #1',
    'A friendly contest for beginners to practice basic problem solving',
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    DATE_ADD(NOW(), INTERVAL 8 DAY),
    'upcoming',
    TRUE,
    1
);

-- Add problems to contest
INSERT INTO contest_problems (contest_id, problem_id, points, problem_order) VALUES
(1, 1, 100, 1),
(1, 2, 150, 2);

-- ================================================================
-- SEED COMPLETE
-- ================================================================
SELECT 'Seed data inserted successfully!' as message;
SELECT CONCAT('Total users: ', COUNT(*)) as count FROM users;
SELECT CONCAT('Total languages: ', COUNT(*)) as count FROM languages;
SELECT CONCAT('Total problems: ', COUNT(*)) as count FROM problems;
SELECT CONCAT('Total contests: ', COUNT(*)) as count FROM contests;
