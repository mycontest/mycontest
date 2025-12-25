# ⚡ Quick Start Guide

Get your Master Spec compliant contest platform running in 5 minutes!

## 📋 Prerequisites

- **Node.js**: v18+ installed
- **MySQL**: v8.0+ installed and running
- **Docker**: For code execution (optional for now)
- **Git**: For version control

## 🚀 Installation Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/mycontest/mycontest
cd mycontest

# Install server dependencies
cd server
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp ../.env.example ../.env

# Edit .env file with your settings
nano ../.env
```

**Required environment variables:**

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_DATABASE=my_contest
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password

# Server Configuration
PORT=7001
DOMAIN=http://localhost:7001
SECRET=change_this_to_random_string_12345

# File Upload
LIMIT=52428800

# OAuth (Optional - can configure later)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 3. Initialize Database

```bash
# Login to MySQL
mysql -u root -p

# Run the Master Spec schema
mysql> source ../data/db_master_spec.sql;

# Verify tables created
mysql> USE my_contest;
mysql> SHOW TABLES;
mysql> exit;
```

**Expected output:**
```
+---------------------+
| Tables_in_my_contest|
+---------------------+
| users               |
| problems            |
| test_cases          |
| submissions         |
| contests            |
| contest_problems    |
| discussions         |
| user_ratings        |
+---------------------+
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm start

# Or production mode
node app.js
```

**Expected output:**
```
✓ MySQL Database Connected Successfully
Server running on port http://localhost:7001
```

### 5. Test the Setup

Open your browser and visit:
```
http://localhost:7001
```

## 🧪 Testing the Problems Module

### Test 1: Upload a Problem

Using the provided example:

```bash
# Create ZIP from example
cd ../examples/sample_problem
zip -r ../../problem_two_sum.zip .
cd ../../server

# Test the upload endpoint
curl -X POST http://localhost:7001/api/problems/upload \
  -F "zip_file=@../problem_two_sum.zip"
```

**Expected response:**
```json
{
  "success": true,
  "problem_id": 1,
  "test_cases_count": 3,
  "message": "Problem 'Two Sum' uploaded successfully"
}
```

### Test 2: Get All Problems

```bash
curl http://localhost:7001/api/problems
```

**Expected response:**
```json
{
  "success": true,
  "count": 1,
  "problems": [
    {
      "id": 1,
      "title": "Two Sum",
      "slug": "two-sum",
      "difficulty": "easy",
      "problem_type": "python",
      "test_case_count": 3
    }
  ]
}
```

### Test 3: Get Single Problem

```bash
curl http://localhost:7001/api/problems/1
```

### Test 4: Submit a Solution

```bash
curl -X POST http://localhost:7001/api/problems/submit \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "code_body": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i",
    "language": "python"
  }'
```

## 📁 Project Structure Overview

```
mycontest/
├── server/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── problems/       ✅ Implemented
│   │   │   │   ├── problems.controller.js
│   │   │   │   ├── problems.service.js
│   │   │   │   ├── problems.router.js
│   │   │   │   └── problems.schema.js
│   │   │   ├── auth/           ⏳ TODO
│   │   │   ├── contest/        ⏳ TODO
│   │   │   └── discussion/     ⏳ TODO
│   │   └── utils/
│   │       ├── mysql.db.js     ✅ MySQL pool configured
│   │       └── zip.handler.js  ✅ ZIP processing ready
│   ├── app.js
│   └── package.json
├── data/
│   └── db_master_spec.sql      ✅ Master Spec schema
├── examples/
│   └── sample_problem/         ✅ Example problem
├── MASTER_SPEC_README.md       ✅ Full documentation
└── QUICKSTART.md              ✅ This file
```

## 🎯 What's Working Now

### ✅ Implemented Features

1. **Database Schema**
   - Users, problems, test_cases, submissions, contests
   - Proper indexes and foreign keys
   - Views for statistics

2. **Problems Module**
   - ZIP upload with validation
   - Problem CRUD operations
   - Search and filtering
   - Submission handling

3. **Utilities**
   - MySQL2 connection pool
   - ZIP extraction and validation
   - Config parsing with Joi validation

4. **API Endpoints**
   - `POST /api/problems/upload`
   - `GET /api/problems`
   - `GET /api/problems/:id`
   - `GET /api/problems/difficulty/:level`
   - `GET /api/problems/type/:type`
   - `POST /api/problems/submit`

### ⏳ TODO (Next Steps)

1. **Authentication Module**
   - Google OAuth
   - GitHub OAuth
   - Session management

2. **Contest Module**
   - Create/manage contests
   - Global vs private contests
   - Leaderboard system

3. **Code Execution Engine**
   - Docker container setup
   - Judge system for running code
   - Result comparison

4. **Frontend Views**
   - EJS templates
   - Monaco code editor
   - Dashboard and profile pages

## 🐛 Troubleshooting

### Problem: MySQL Connection Failed

**Error:**
```
✗ MySQL Connection Failed: Access denied for user
```

**Solution:**
1. Check `.env` file credentials
2. Verify MySQL is running: `mysql -u root -p`
3. Grant proper permissions:
   ```sql
   GRANT ALL PRIVILEGES ON my_contest.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Problem: Cannot upload ZIP

**Error:**
```
No ZIP file uploaded
```

**Solution:**
1. Ensure you're using `multipart/form-data`
2. Field name must be `zip_file`
3. Check file size (max 50MB)

### Problem: Config validation failed

**Error:**
```
Missing required fields: title, problem_type
```

**Solution:**
1. Review `config.json` format in [examples/README.md](examples/README.md)
2. Ensure all required fields are present
3. Check spelling: `problem_type` not `problemType`

## 📚 Next Steps

1. **Read the full documentation**: [MASTER_SPEC_README.md](MASTER_SPEC_README.md)
2. **Study the example problem**: [examples/sample_problem/](examples/sample_problem/)
3. **Create your first problem**: Follow [examples/README.md](examples/README.md)
4. **Implement authentication**: Start with OAuth setup
5. **Build the frontend**: Create EJS views

## 🔗 Useful Links

- **GitHub Repository**: https://github.com/mycontest/mycontest
- **Telegram Channel**: https://t.me/mensenvau
- **Demo Site**: https://mycontest.dev

## 💡 Tips

1. **Use the examples**: Start by uploading the sample problem
2. **Test incrementally**: Test each module as you build
3. **Follow naming conventions**: Strictly follow Master Spec conventions
4. **Read error messages**: They're detailed and helpful
5. **Check logs**: Server logs show detailed execution flow

## 🎉 Success!

If you can upload a problem and see it in the database, you're ready to continue building the platform according to the Master Spec!

**Happy coding! 🚀**

---

For detailed technical specifications, see [MASTER_SPEC_README.md](MASTER_SPEC_README.md)
