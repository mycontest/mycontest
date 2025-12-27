-- ================================================================
-- MYCONTEST PLATFORM - DATABASE SCHEMA
-- EJS-based MVC Platform with Multi-Language Support
-- ================================================================

DROP DATABASE IF EXISTS mycontest;
CREATE DATABASE mycontest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mycontest;

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
    role ENUM('admin', 'organization', 'user') DEFAULT 'user',
    subscription ENUM('free', 'plus', 'business') DEFAULT 'free',
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
    is_global BOOLEAN DEFAULT FALSE COMMENT 'Shows on main problem list',
    organization_id INT DEFAULT NULL COMMENT 'Belongs to organization',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_difficulty (difficulty),
    INDEX idx_is_active (is_active),
    INDEX idx_is_global (is_global),
    INDEX idx_organization_id (organization_id)
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
    lang_id INT DEFAULT NULL,
    contest_id INT DEFAULT NULL,
    code_body TEXT NOT NULL,
    status ENUM('pending', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit', 'memory_limit', 'compilation_error') DEFAULT 'pending',
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
    status ENUM('upcoming', 'active', 'ended') DEFAULT 'upcoming',
    is_global BOOLEAN DEFAULT FALSE COMMENT 'Shows on main contest list',
    organization_id INT DEFAULT NULL COMMENT 'Belongs to organization',
    unique_code VARCHAR(50) UNIQUE COMMENT 'For private contests',
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_organization_id (organization_id),
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
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    UNIQUE KEY unique_contest_problem (contest_id, problem_id),
    INDEX idx_contest_id (contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 9. ORGANIZATIONS TABLE
-- ================================================================
DROP TABLE IF EXISTS organizations;
CREATE TABLE organizations (
    org_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE COMMENT 'Organization owner',
    org_name VARCHAR(200) NOT NULL,
    org_slug VARCHAR(200) UNIQUE NOT NULL COMMENT 'URL slug: /org_slug',
    org_type ENUM('school', 'university', 'company', 'community') DEFAULT 'community',
    description TEXT,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    subscription ENUM('free', 'plus', 'business') DEFAULT 'free',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_org_slug (org_slug),
    INDEX idx_user_id (user_id),
    INDEX idx_is_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 10. DISCUSSIONS TABLE
-- ================================================================
DROP TABLE IF EXISTS discussions;
CREATE TABLE discussions (
    discussion_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    content TEXT NOT NULL COMMENT 'Max 2000 chars enforced by app',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES discussions(discussion_id) ON DELETE CASCADE,
    INDEX idx_problem_id (problem_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 11. MONTHLY LIMITS TABLE
-- ================================================================
DROP TABLE IF EXISTS monthly_limits;
CREATE TABLE monthly_limits (
    limit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL COMMENT 'For user comment limits',
    organization_id INT DEFAULT NULL COMMENT 'For organization contest limits',
    limit_type ENUM('comments', 'contests') NOT NULL,
    usage_count INT DEFAULT 0,
    month_year VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_month (user_id, limit_type, month_year),
    UNIQUE KEY unique_org_month (organization_id, limit_type, month_year),
    INDEX idx_month_year (month_year),
    INDEX idx_limit_type (limit_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- 12. ADD FOREIGN KEYS for organization_id
-- ================================================================
ALTER TABLE problems
ADD CONSTRAINT fk_problem_organization
FOREIGN KEY (organization_id) REFERENCES organizations(org_id) ON DELETE SET NULL;

ALTER TABLE contests
ADD CONSTRAINT fk_contest_organization
FOREIGN KEY (organization_id) REFERENCES organizations(org_id) ON DELETE SET NULL;

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
    p.is_global,
    COUNT(DISTINCT pl.lang_id) as language_count,
    COUNT(DISTINCT s.user_id) as attempt_count,
    COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count
FROM problems p
LEFT JOIN problem_languages pl ON p.problem_id = pl.problem_id
LEFT JOIN submissions s ON p.problem_id = s.problem_id
WHERE p.is_active = TRUE
GROUP BY p.problem_id, p.title, p.slug, p.difficulty, p.is_global;

-- Global problems view (for main problem list)
DROP VIEW IF EXISTS vw_global_problems;
CREATE VIEW vw_global_problems AS
SELECT
    p.problem_id,
    p.title,
    p.slug,
    p.difficulty,
    p.is_global,
    COUNT(DISTINCT pl.lang_id) as language_count,
    COUNT(DISTINCT s.user_id) as attempt_count,
    COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count
FROM problems p
LEFT JOIN problem_languages pl ON p.problem_id = pl.problem_id
LEFT JOIN submissions s ON p.problem_id = s.problem_id
WHERE p.is_active = TRUE AND p.is_global = TRUE
GROUP BY p.problem_id, p.title, p.slug, p.difficulty, p.is_global;

-- Global contests view (for main contest list)
DROP VIEW IF EXISTS vw_global_contests;
CREATE VIEW vw_global_contests AS
SELECT
    c.contest_id,
    c.title,
    c.description,
    c.is_global,
    c.start_time,
    c.end_time,
    u.username as creator_name,
    COUNT(DISTINCT cp.problem_id) as problem_count,
    CASE
        WHEN NOW() < c.start_time THEN 'upcoming'
        WHEN NOW() BETWEEN c.start_time AND c.end_time THEN 'active'
        ELSE 'ended'
    END as status
FROM contests c
JOIN users u ON c.creator_id = u.user_id
LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
WHERE c.is_global = TRUE
GROUP BY c.contest_id, c.title, c.description, c.is_global, c.start_time, c.end_time, u.username;

-- Organization statistics view
DROP VIEW IF EXISTS vw_organization_stats;
CREATE VIEW vw_organization_stats AS
SELECT
    o.org_id,
    o.org_name,
    o.org_slug,
    o.org_type,
    u.username as owner_username,
    o.subscription,
    o.is_verified,
    COUNT(DISTINCT p.problem_id) as problem_count,
    COUNT(DISTINCT c.contest_id) as contest_count,
    o.created_at
FROM organizations o
JOIN users u ON o.user_id = u.user_id
LEFT JOIN problems p ON o.org_id = p.organization_id
LEFT JOIN contests c ON o.org_id = c.organization_id
GROUP BY o.org_id, o.org_name, o.org_slug, o.org_type, u.username, o.subscription, o.is_verified, o.created_at;

SELECT 'Database schema created successfully!' as status;
