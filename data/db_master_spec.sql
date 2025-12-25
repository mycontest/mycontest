-- MASTER SPEC DATABASE SCHEMA
-- Professional Code Judge & Contest Platform

DROP DATABASE IF EXISTS my_contest;
CREATE DATABASE my_contest;
USE my_contest;

-- ============================================
-- 1. USERS TABLE (Enhanced with subscriptions)
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(200) UNIQUE,
    email VARCHAR(200) UNIQUE NOT NULL,
    github_id VARCHAR(100),
    google_id VARCHAR(100),
    full_name VARCHAR(200),
    password VARCHAR(200),
    role ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
    total_score INT DEFAULT 0,
    subscription ENUM('basic', 'pro', 'premium') DEFAULT 'basic',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_github_id (github_id),
    INDEX idx_subscription (subscription)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. PROBLEMS TABLE (Master Spec naming)
-- ============================================
DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    problem_type ENUM('python', 'sql', 'pandas', 'cpp', 'java', 'javascript') NOT NULL,
    description TEXT,
    template_code TEXT,
    time_limit INT DEFAULT 1000 COMMENT 'Time limit in milliseconds',
    memory_limit INT DEFAULT 256 COMMENT 'Memory limit in MB',
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_difficulty (difficulty),
    INDEX idx_problem_type (problem_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. TEST_CASES TABLE (Master Spec naming)
-- ============================================
DROP TABLE IF EXISTS test_cases;
CREATE TABLE test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE COMMENT 'Hidden test cases shown only after submission',
    points_per_case INT DEFAULT 10 COMMENT 'Points awarded for passing this test case',
    test_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_problem_id (problem_id),
    INDEX idx_is_hidden (is_hidden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. SUBMISSIONS TABLE (Master Spec naming)
-- ============================================
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    contest_id INT DEFAULT NULL,
    status ENUM('pending', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error') DEFAULT 'pending',
    code_body TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    execution_time INT DEFAULT 0 COMMENT 'Execution time in milliseconds',
    memory_used INT DEFAULT 0 COMMENT 'Memory used in KB',
    score_earned INT DEFAULT 0,
    test_passed INT DEFAULT 0,
    test_total INT DEFAULT 0,
    error_message TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_contest_id (contest_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. CONTESTS TABLE (Master Spec naming)
-- ============================================
DROP TABLE IF EXISTS contests;
CREATE TABLE contests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_global BOOLEAN DEFAULT FALSE COMMENT 'Global contests visible on homepage',
    unique_link VARCHAR(100) UNIQUE COMMENT 'Unique shareable link for private contests',
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_creator_id (creator_id),
    INDEX idx_is_global (is_global),
    INDEX idx_unique_link (unique_link),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. CONTEST_PROBLEMS (Junction Table)
-- ============================================
DROP TABLE IF EXISTS contest_problems;
CREATE TABLE contest_problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,
    problem_order INT DEFAULT 0,
    bonus_points INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contest_problem (contest_id, problem_id),
    INDEX idx_contest_id (contest_id),
    INDEX idx_problem_id (problem_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. DISCUSSIONS TABLE (For comments/discussions)
-- ============================================
DROP TABLE IF EXISTS discussions;
CREATE TABLE discussions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    parent_id INT DEFAULT NULL COMMENT 'For nested comments',
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES discussions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. USER_RATINGS TABLE (For rating system)
-- ============================================
DROP TABLE IF EXISTS user_ratings;
CREATE TABLE user_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT DEFAULT NULL,
    problem_id INT DEFAULT NULL,
    rating_change INT DEFAULT 0,
    new_rating INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_contest_id (contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Super Admin (password will be MD5 hashed)
INSERT INTO users (full_name, email, username, password, role, subscription)
VALUES
    ('Admin User', 'admin@mycontest.dev', 'admin', MD5('admin123'), 'super_admin', 'premium'),
    ('Test User', 'test@example.com', 'testuser', MD5('test123'), 'user', 'basic');

-- Insert sample problem
INSERT INTO problems (title, slug, difficulty, problem_type, description, template_code, time_limit, memory_limit, created_by)
VALUES
    ('Two Sum', 'two-sum', 'easy', 'python', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
     'def twoSum(nums, target):\n    # Your code here\n    pass', 1000, 128, 1);

-- Insert test cases for the problem
INSERT INTO test_cases (problem_id, input_data, expected_output, is_hidden, points_per_case, test_order)
VALUES
    (1, '[2,7,11,15]\n9', '[0,1]', FALSE, 50, 1),
    (1, '[3,2,4]\n6', '[1,2]', TRUE, 50, 2);

-- Insert sample contest
INSERT INTO contests (creator_id, title, description, is_global, start_time, end_time)
VALUES
    (1, 'Weekly Contest #1', 'First weekly programming contest', TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR));

-- Link problem to contest
INSERT INTO contest_problems (contest_id, problem_id, problem_order, bonus_points)
VALUES
    (1, 1, 1, 10);

-- ============================================
-- VIEWS FOR CONVENIENT QUERIES
-- ============================================

-- View for user statistics
CREATE OR REPLACE VIEW vw_user_stats AS
SELECT
    u.id,
    u.username,
    u.full_name,
    u.total_score,
    u.subscription,
    COUNT(DISTINCT s.problem_id) as problems_solved,
    COUNT(DISTINCT s.contest_id) as contests_participated,
    AVG(s.score_earned) as avg_score
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id AND s.status = 'accepted'
GROUP BY u.id, u.username, u.full_name, u.total_score, u.subscription;

-- View for problem statistics
CREATE OR REPLACE VIEW vw_problem_stats AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.difficulty,
    p.problem_type,
    COUNT(DISTINCT s.user_id) as total_attempts,
    COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count,
    COUNT(tc.id) as test_case_count
FROM problems p
LEFT JOIN submissions s ON p.id = s.problem_id
LEFT JOIN test_cases tc ON p.id = tc.problem_id
GROUP BY p.id, p.title, p.slug, p.difficulty, p.problem_type;

-- View for contest leaderboard
CREATE OR REPLACE VIEW vw_contest_leaderboard AS
SELECT
    c.id as contest_id,
    c.title as contest_title,
    u.id as user_id,
    u.username,
    u.full_name,
    COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as problems_solved,
    SUM(s.score_earned) as total_score,
    MAX(s.submitted_at) as last_submission_time
FROM contests c
JOIN submissions s ON c.id = s.contest_id
JOIN users u ON s.user_id = u.id
GROUP BY c.id, c.title, u.id, u.username, u.full_name
ORDER BY c.id, total_score DESC, last_submission_time ASC;

SELECT 'Database schema created successfully!' as status;
