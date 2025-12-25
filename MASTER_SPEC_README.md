# 📑 MASTER TECHNICAL SPECIFICATION

## Professional Code Judge & Contest Platform

This document outlines the complete technical specification for the MyContest platform, following strict coding conventions and professional architecture patterns.

---

## 🎯 Core Identity & Architecture

### Technology Stack

- **Backend**: Node.js with Express.js (Modular Monolith)
- **Frontend**: EJS Templates (Dark-themed, Tailwind CSS)
- **Database**: MySQL with `mysql2` (No ORM - Pure SQL)
- **Authentication**: Google & GitHub OAuth via Passport.js
- **Security**: Docker-based code execution with sandboxing
- **File Handling**: Multer for uploads, AdmZip for extraction

---

## 📋 Strict Naming Conventions

### File Naming
```
module.type.js
```
Examples:
- `problems.controller.js`
- `auth.service.js`
- `contest.router.js`

### Variables & Constants
```javascript
snake_case
```
Examples:
```javascript
const user_subscription = 'premium';
const total_score = 100;
const test_case_count = 5;
```

### Database Columns & Tables
```sql
snake_case
```
Examples:
```sql
user_id, problem_id, points_per_case, created_at
```

### Function Prefixes

| Type | Prefix | Example |
|------|--------|---------|
| **Controllers** | `controller` | `controllerSubmitSolution` |
| **Services** | `fn` | `fnCalculateUserRating` |
| **Schemas** | `schema` | `schemaValidateZip` |
| **Middleware** | `middleware` | `middlewareValidateRequest` |

---

## 🗄️ Database Schema

### Core Tables

#### 1. **users**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(200) UNIQUE,
    email VARCHAR(200) UNIQUE NOT NULL,
    github_id VARCHAR(100),
    google_id VARCHAR(100),
    full_name VARCHAR(200),
    total_score INT DEFAULT 0,
    subscription ENUM('basic', 'pro', 'premium') DEFAULT 'basic',
    role ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **problems**
```sql
CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    problem_type ENUM('python', 'sql', 'pandas', 'cpp', 'java', 'javascript'),
    description TEXT,
    template_code TEXT,
    time_limit INT DEFAULT 1000,
    memory_limit INT DEFAULT 256,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **test_cases**
```sql
CREATE TABLE test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    points_per_case INT DEFAULT 10,
    test_order INT DEFAULT 0,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);
```

#### 4. **submissions**
```sql
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    contest_id INT DEFAULT NULL,
    status ENUM('pending', 'accepted', 'wrong_answer', 'runtime_error',
                'time_limit_exceeded', 'compilation_error'),
    code_body TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    execution_time INT DEFAULT 0,
    memory_used INT DEFAULT 0,
    score_earned INT DEFAULT 0,
    test_passed INT DEFAULT 0,
    test_total INT DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. **contests**
```sql
CREATE TABLE contests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_global BOOLEAN DEFAULT FALSE,
    unique_link VARCHAR(100) UNIQUE,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📦 Task Upload System (ZIP Flow)

### ZIP Structure

Admins upload tasks via a ZIP file with the following structure:

```
task.zip
├── config.json          # Problem metadata
├── input/
│   ├── 1.txt           # Test case 1 input
│   ├── 2.txt           # Test case 2 input
│   └── ...
└── output/
    ├── 1.txt           # Test case 1 expected output
    ├── 2.txt           # Test case 2 expected output
    └── ...
```

### config.json Format

```json
{
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "easy",
  "problem_type": "python",
  "description": "Given an array of integers...",
  "template_code": "def twoSum(nums, target):\n    pass",
  "time_limit": 1000,
  "memory_limit": 128,
  "points_per_case": 10
}
```

### Processing Logic

The `fnProcessZipAndSave` service:

1. **Extracts** the ZIP file to a temporary directory
2. **Validates** the structure (config.json, input/, output/)
3. **Parses** config.json with schema validation
4. **Reads** all test case input/output pairs
5. **Executes** atomic database transaction:
   - INSERT into `problems` table
   - INSERT multiple rows into `test_cases` table
6. **Cleans up** temporary files

```javascript
const result = await fnProcessZipAndSave(file_buffer, user_id);
// Returns: { success: true, problem_id: 42, test_cases_count: 5 }
```

---

## ⚖️ Code Execution Engine (The Judge)

### Execution Flow

1. **Receive submission** via `controllerSubmitSolution`
2. **Create submission record** with status = 'pending'
3. **Fetch all test cases** (including hidden ones)
4. **Execute in Docker container**:
   - For each test case:
     - Run user code with input
     - Compare output with expected
     - Calculate score
     - Track execution time & memory
5. **Update submission** with final result:
   - Status: `accepted`, `wrong_answer`, `runtime_error`, etc.
   - Score earned based on passed test cases
6. **Update user's total score**

### Supported Languages

| Language | File Extension | Execution |
|----------|---------------|-----------|
| Python 3 | `.py` | `python3 source.py` |
| C++ | `.cpp` | `g++ source.cpp && ./a.out` |
| Java | `.java` | `javac Main.java && java Main` |
| JavaScript | `.js` | `node source.js` |
| SQL | `.sql` | MySQL query execution |
| Pandas | `.py` | Python with pandas |

---

## 🏆 Competitive & Social Logic

### Rating System

```
User Rating = Sum(problem_scores) + Contest_Bonus
```

- Points awarded per test case passed
- Bonus points for contest participation
- Penalty for multiple wrong submissions

### Contest Types

#### Global Contests
- Created by **Super Admin**
- Visible on homepage
- Open to all users

#### Private Contests
- Created by **Admin**
- Accessible only via unique shareable link
- Custom duration and problem set

### Subscription Logic

| Feature | Basic | Pro | Premium |
|---------|-------|-----|---------|
| Solve Problems | ✅ | ✅ | ✅ |
| View Solutions | ❌ | ✅ | ✅ |
| Discussion/Comments | ❌ | ✅ | ✅ |
| Create Private Contests | ❌ | ❌ | ✅ |
| Advanced Statistics | ❌ | ✅ | ✅ |

---

## 📁 Project Folder Structure

```
/server
  /src
    /modules
      /auth
        auth.controller.js
        auth.service.js
        auth.router.js
        auth.schema.js
      /problems
        problems.controller.js
        problems.service.js
        problems.router.js
        problems.schema.js
      /contest
        contest.controller.js
        contest.service.js
        contest.router.js
        contest.schema.js
      /discussion
        discussion.controller.js
        discussion.service.js
        discussion.router.js
    /utils
      mysql.db.js          # MySQL connection pool
      zip.handler.js       # ZIP extraction utilities
      docker.runner.js     # Code execution in Docker
    /views
      /layouts
      /partials
      /pages
        dashboard.ejs
        editor.ejs
        profile.ejs
  app.js
  server.js
  package.json
```

---

## 🚀 API Endpoints

### Problems Module

```
POST   /api/problems/upload              # Upload problem (Admin)
GET    /api/problems                     # Get all problems
GET    /api/problems/:id                 # Get problem by ID
GET    /api/problems/difficulty/:level   # Filter by difficulty
GET    /api/problems/type/:type          # Filter by type
GET    /api/problems/search?q=term       # Search problems
POST   /api/problems/submit              # Submit solution
GET    /api/problems/submissions/:id     # Get submission status
GET    /api/problems/:id/submissions     # User's submissions
```

### Request/Response Examples

#### Upload Problem (ZIP)

**Request:**
```http
POST /api/problems/upload
Content-Type: multipart/form-data

zip_file: <binary data>
```

**Response:**
```json
{
  "success": true,
  "problem_id": 42,
  "test_cases_count": 5,
  "message": "Problem 'Two Sum' uploaded successfully"
}
```

#### Submit Solution

**Request:**
```http
POST /api/problems/submit
Content-Type: application/json

{
  "problem_id": 42,
  "code_body": "def twoSum(nums, target):\n    ...",
  "language": "python",
  "contest_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "submission_id": 123,
  "message": "Submission received. Execution in progress...",
  "test_total": 5
}
```

---

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
cd server
npm install mysql2 multer adm-zip
```

### 2. Initialize Database

```bash
mysql -u root -p < ../data/db_master_spec.sql
```

### 3. Configure Environment

Create `.env` file:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_DATABASE=my_contest
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password

# Server Configuration
PORT=7001
DOMAIN=http://localhost:7001
SECRET=your_secret_key

# File Upload Limits
LIMIT=52428800  # 50MB

# OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 4. Start Server

```bash
npm start
```

---

## 🧪 Testing the ZIP Upload

### Create a Sample ZIP

1. Create directory structure:
```bash
mkdir -p test_problem/input test_problem/output
```

2. Create `config.json`:
```json
{
  "title": "Add Two Numbers",
  "difficulty": "easy",
  "problem_type": "python",
  "template_code": "def add(a, b):\n    pass",
  "time_limit": 1000,
  "memory_limit": 128,
  "points_per_case": 10
}
```

3. Create test cases:
```bash
echo "2 3" > test_problem/input/1.txt
echo "5" > test_problem/output/1.txt
echo "10 20" > test_problem/input/2.txt
echo "30" > test_problem/output/2.txt
```

4. Create ZIP:
```bash
cd test_problem && zip -r ../problem.zip .
```

5. Upload via API or admin panel

---

## 📊 Code Quality Standards

### SQL Queries
- Always use parameterized queries to prevent SQL injection
- Use transactions for multi-step operations
- Index frequently queried columns

### Error Handling
```javascript
try {
    const result = await fnProcessZipAndSave(file_buffer, user_id);
    return res.status(200).json(result);
} catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
        success: false,
        message: error.message
    });
}
```

### Validation
- Always validate user input using Joi schemas
- Validate file types and sizes
- Sanitize all database inputs

---

## 🔒 Security Considerations

1. **Docker Isolation**: All code execution in isolated containers
2. **Time Limits**: Prevent infinite loops
3. **Memory Limits**: Prevent memory exhaustion
4. **File Size Limits**: Max 50MB for ZIP uploads
5. **SQL Injection**: Parameterized queries only
6. **XSS Protection**: Sanitize all user inputs
7. **CSRF Protection**: Session-based authentication

---

## 📝 Next Steps

### Immediate Tasks
1. ✅ Database schema created
2. ✅ MySQL connection pool configured
3. ✅ Problems module implemented
4. ✅ ZIP upload system ready
5. ⏳ Implement Docker runner for code execution
6. ⏳ Create auth module (OAuth)
7. ⏳ Implement contest module
8. ⏳ Build EJS frontend views

### Future Enhancements
- WebSocket for real-time submission updates
- Code editor with syntax highlighting (Monaco Editor)
- Leaderboard with real-time rankings
- Discussion forums per problem
- Analytics dashboard for admins

---

## 🤝 Contributing

Follow these conventions when contributing:

1. Use strict naming conventions
2. Write pure SQL (no ORM)
3. Follow modular architecture
4. Add JSDoc comments to all functions
5. Validate all inputs
6. Handle errors properly
7. Write tests for critical functions

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ following the Master Technical Specification**
