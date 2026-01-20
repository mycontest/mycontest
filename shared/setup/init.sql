CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    type ENUM('google', 'local') DEFAULT 'local',
    points INT DEFAULT 0,
    rating INT DEFAULT 0,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    file_extension VARCHAR(10) NOT NULL,
    compile_script TEXT,
    run_script TEXT,
    docker_image VARCHAR(255),
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problem_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT,
    points INT DEFAULT 0,
    input_format TEXT,
    output_format TEXT,
    time_ms INT DEFAULT 1000,
    memory_kb INT DEFAULT 256000,
    test_public TEXT,
    test_all TEXT,
    comment TEXT,
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problem_languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_id INT,
    problem_id INT,
    default_code TEXT,
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (problem_id) REFERENCES problem_details(id)
);

CREATE TABLE IF NOT EXISTS contest_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT,
    type ENUM('public', 'private') DEFAULT 'public',
    start_date DATETIME,
    duration_min INT,
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problem_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT,
    contest_id INT DEFAULT NULL,
    user_id INT,
    user_code TEXT,
    time_ms INT,
    memory_kb INT,
    status_message VARCHAR(200) DEFAULT 'Running' COMMENT 'Human-readable status',
    status_code INT DEFAULT 0 COMMENT '0=Running, 1=Accepted, 2=Wrong Answer, 3=Time Limit, 4=Presentation Error, 5=Compilation Error, 6=Memory Limit, 7=Runtime Error, 10=Server Error',
    error_details TEXT,
    language_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problem_details(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

CREATE TABLE IF NOT EXISTS contest_problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT,
    problem_id INT,
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contest_details(id),
    FOREIGN KEY (problem_id) REFERENCES problem_details(id)
);

CREATE TABLE IF NOT EXISTS contest_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contest_details(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
