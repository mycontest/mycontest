-- ================================================================
-- MYCONTEST PLATFORM - DATABASE SCHEMA
-- EJS-based MVC Platform with Multi-Language Support
-- ================================================================

DROP DATABASE IF EXISTS my_contest;
CREATE DATABASE my_contest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE my_contest;

-- ================================================================
-- 1. USERS TABLE
-- ================================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(200) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    full_name VARCHAR(200),
    password VARCHAR(200),
    github_id VARCHAR(100),
    google_id VARCHAR(100),
    role ENUM('admin', 'user') DEFAULT 'user',
    subscription ENUM('basic', 'pro', 'premium') DEFAULT 'basic',
    total_score INT DEFAULT 0,
    avatar_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 2. LANGUAGES TABLE (Admin can add new languages)
-- ================================================================
DROP TABLE IF EXISTS languages;
CREATE TABLE languages (
    lang_id INT AUTO_INCREMENT PRIMARY KEY,
    lang_name VARCHAR(100) NOT NULL UNIQUE,
    lang_code VARCHAR(50) NOT NULL UNIQUE,
    file_extension VARCHAR(20) NOT NULL,
    compile_command VARCHAR(500),
    run_command VARCHAR(500) NOT NULL,
    docker_image VARCHAR(200) DEFAULT 'run_test_1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lang_code (lang_code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 3. PROBLEMS TABLE (Without problem_type)
-- ================================================================
DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    problem_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    description TEXT,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    time_limit INT DEFAULT 1000 COMMENT 'Milliseconds',
    memory_limit INT DEFAULT 256 COMMENT 'MB',
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_difficulty (difficulty),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 4. PROBLEM_LANGUAGES (One problem can have multiple languages)
-- ================================================================
DROP TABLE IF EXISTS problem_languages;
CREATE TABLE problem_languages (
    pl_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    lang_id INT NOT NULL,
    template_code TEXT,
    solution_code TEXT COMMENT 'Admin solution for testing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    FOREIGN KEY (lang_id) REFERENCES languages(lang_id) ON DELETE CASCADE,
    UNIQUE KEY unique_problem_lang (problem_id, lang_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_lang_id (lang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 5. TEST_CASES TABLE
-- ================================================================
DROP TABLE IF EXISTS test_cases;
CREATE TABLE test_cases (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT FALSE COMMENT 'Visible sample cases',
    points INT DEFAULT 10,
    test_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    INDEX idx_problem_id (problem_id),
    INDEX idx_is_sample (is_sample)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 6. SUBMISSIONS TABLE
-- ================================================================
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    lang_id INT NOT NULL,
    contest_id INT DEFAULT NULL,
    code_body TEXT NOT NULL,
    status ENUM('pending', 'running', 'accepted', 'wrong_answer',
                'runtime_error', 'time_limit', 'memory_limit',
                'compilation_error') DEFAULT 'pending',
    test_passed INT DEFAULT 0,
    test_total INT DEFAULT 0,
    score INT DEFAULT 0,
    execution_time INT DEFAULT 0 COMMENT 'Milliseconds',
    memory_used INT DEFAULT 0 COMMENT 'KB',
    error_message TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    FOREIGN KEY (lang_id) REFERENCES languages(lang_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 7. CONTESTS TABLE
-- ================================================================
DROP TABLE IF EXISTS contests;
CREATE TABLE contests (
    contest_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    unique_code VARCHAR(50) UNIQUE COMMENT 'For private contests',
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_is_public (is_public),
    INDEX idx_unique_code (unique_code),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 8. CONTEST_PROBLEMS TABLE
-- ================================================================
DROP TABLE IF EXISTS contest_problems;
CREATE TABLE contest_problems (
    cp_id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,
    problem_order INT DEFAULT 0,
    bonus_points INT DEFAULT 0,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    UNIQUE KEY unique_contest_problem (contest_id, problem_id),
    INDEX idx_contest_id (contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 9. DISCUSSIONS TABLE
-- ================================================================
DROP TABLE IF EXISTS discussions;
CREATE TABLE discussions (
    discussion_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES discussions(discussion_id) ON DELETE CASCADE,
    INDEX idx_problem_id (problem_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- SEED DATA
-- ================================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, full_name, password, role, subscription)
VALUES ('admin', 'admin@mycontest.dev', 'Admin User', MD5('admin123'), 'admin', 'premium');

-- Insert default languages
INSERT INTO languages (lang_name, lang_code, file_extension, compile_command, run_command, docker_image)
VALUES
('Python 3', 'python', 'py', NULL, 'python3 source.py', 'run_test_1'),
('JavaScript', 'javascript', 'js', NULL, 'node source.js', 'run_test_1'),
('C++', 'cpp', 'cpp', 'g++ source.cpp -o executable -std=c++20', './executable', 'run_test_1'),
('Java', 'java', 'java', 'javac Main.java', 'java Main', 'run_test_1'),
('Go', 'go', 'go', NULL, 'go run source.go', 'run_test_1');

-- ================================================================
-- USEFUL VIEWS
-- ================================================================

-- User statistics view
DROP VIEW IF EXISTS vw_user_stats;
CREATE VIEW vw_user_stats AS
SELECT
    u.user_id,
    u.username,
    u.full_name,
    u.total_score,
    u.subscription,
    COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as solved_count,
    COUNT(DISTINCT s.problem_id) as attempted_count,
    COUNT(s.submission_id) as total_submissions
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
GROUP BY u.user_id, u.username, u.full_name, u.total_score, u.subscription;

-- Problem statistics view
DROP VIEW IF EXISTS vw_problem_stats;
CREATE VIEW vw_problem_stats AS
SELECT
    p.problem_id,
    p.title,
    p.slug,
    p.difficulty,
    COUNT(DISTINCT pl.lang_id) as language_count,
    COUNT(DISTINCT s.user_id) as attempt_count,
    COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count
FROM problems p
LEFT JOIN problem_languages pl ON p.problem_id = pl.problem_id
LEFT JOIN submissions s ON p.problem_id = s.problem_id
WHERE p.is_active = TRUE
GROUP BY p.problem_id, p.title, p.slug, p.difficulty;

SELECT 'Database schema created successfully!' as status;
