# 🎯 MyContest Platform - EJS MVC Edition

Professional code judge and contest platform built with **Node.js**, **Express**, **EJS**, and **MySQL**.

## ✨ Features

- 🔐 **User Authentication** - Register, login with MD5 password hashing
- 📝 **Multi-Language Problems** - One problem can support multiple programming languages
- 💻 **Monaco Code Editor** - Professional in-browser code editing
- 👨‍💼 **Admin Panel** - Manage problems, languages, and users
- 🏆 **Submissions & Judging** - Track all submissions with detailed status
- 📊 **User Profiles** - Statistics and solved problems
- 🎨 **Dark Theme UI** - Modern, responsive Tailwind CSS design

## 🏗️ Architecture

### Naming Conventions

- **Functions**:
  - Auth: `authLogin`, `authRegister`, `authCheck`
  - Problems: `problemsGetAll`, `problemsSubmit`
  - Admin: `adminCreateProblem`, `adminAddLanguage`
  - Services: `fnLoginService`, `fnGetAllProblemsService`
  - Schemas: `schemaLogin`, `schemaProblemCreate`

- **Database**: `snake_case` (user_id, problem_id, lang_id)

### Database Schema

```
users (user_id, username, email, role, subscription, total_score)
problems (problem_id, title, slug, difficulty, description)
languages (lang_id, lang_name, lang_code, file_extension, run_command)
problem_languages (problem_id, lang_id, template_code)
test_cases (test_id, problem_id, input_data, expected_output, is_sample, points)
submissions (submission_id, user_id, problem_id, lang_id, status, score)
contests (contest_id, title, is_public, start_time, end_time)
```

### Project Structure

```
server/
├── modules/
│   ├── auth/
│   │   └── auth.service.js
│   ├── problems/
│   │   └── problems.service.js
│   └── admin/
│       └── admin.service.js
├── utils/
│   └── db.js (dbQueryOne, dbQueryMany)
├── views/
│   ├── layout.ejs
│   ├── partials/
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   ├── pages/
│   │   ├── home.ejs
│   │   ├── problems.ejs
│   │   ├── problem.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── profile.ejs
│   │   └── submission.ejs
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── problem-create.ejs
│   │   └── languages.ejs
│   └── error.ejs
├── app.js (Main application with all routes)
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
mysql> source ../data/database_schema.sql;
```

### 3. Configure Environment

Create `.env` file in root directory:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_DATABASE=my_contest
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password

# Server Configuration
PORT=7001
DOMAIN=http://localhost:7001
SECRET=your_secret_key_change_this
LIMIT=52428800
```

### 4. Start Server

```bash
npm start
```

Visit: `http://localhost:7001`

## 👤 Default Admin Account

```
Username: admin
Password: admin123
```

**⚠️ Change this immediately after first login!**

## 📦 Creating Problems

### ZIP Structure

```
problem.zip
├── config.json
├── templates/
│   ├── python.py
│   ├── javascript.js
│   └── cpp.cpp
└── tests/
    ├── input/
    │   ├── 1.txt
    │   ├── 2.txt
    │   └── 3.txt
    └── output/
        ├── 1.txt
        ├── 2.txt
        └── 3.txt
```

### config.json Example

```json
{
  "title": "Two Sum",
  "difficulty": "easy",
  "description": "Find two numbers that add up to target...",
  "input_format": "First line: array, Second line: target",
  "output_format": "Indices of the two numbers",
  "constraints": "1 ≤ n ≤ 10^4",
  "time_limit": 1000,
  "memory_limit": 256,
  "points_per_case": 10
}
```

### Template Example (python.py)

```python
def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your code here
    pass
```

## 🔧 Admin Features

### Manage Languages

1. Go to **Admin → Languages**
2. Add new language:
   - Language Name: `Python 3`
   - Language Code: `python`
   - File Extension: `py`
   - Run Command: `python3 source.py`
   - Compile Command: *(leave empty for interpreted languages)*

3. Toggle language status (Active/Inactive)

### Create Problems

1. Go to **Admin → Create Problem**
2. Upload ZIP file with structure above
3. System will:
   - Parse config.json
   - Extract templates for each language
   - Import test cases
   - Create problem in database

## 🎯 User Flow

1. **Register/Login** → Get authenticated
2. **Browse Problems** → See all available problems
3. **Select Problem** → View description, samples, and constraints
4. **Choose Language** → Select from available languages
5. **Write Code** → Use Monaco editor with syntax highlighting
6. **Submit Solution** → Code gets queued for judging
7. **View Results** → See status, test cases passed, score

## 📊 Database Helpers

Simple and clean database operations:

```javascript
// Get single row
const user = await dbQueryOne('SELECT * FROM users WHERE user_id = ?', [user_id]);

// Get multiple rows
const problems = await dbQueryMany('SELECT * FROM problems WHERE is_active = TRUE');

// Transaction
const result = await dbTransaction(async (conn) => {
    await conn.execute('INSERT INTO problems ...');
    await conn.execute('INSERT INTO test_cases ...');
    return { problem_id: result.insertId };
});
```

## 🎨 UI Components

### Difficulty Colors

- 🟢 **Easy**: Green (#22c55e)
- 🟡 **Medium**: Yellow (#eab308)
- 🔴 **Hard**: Red (#ef4444)

### Status Colors

- ✅ **Accepted**: Green
- ❌ **Wrong Answer**: Red
- ⏳ **Pending**: Yellow
- 🔵 **Running**: Blue

## 📝 Routes

### Public Routes

- `GET /` - Home page
- `GET /problems` - All problems
- `GET /problems/:id` - Single problem with editor
- `GET /login` - Login page
- `GET /register` - Register page

### Authenticated Routes

- `GET /profile` - User profile and stats
- `POST /problems/:id/submit` - Submit solution
- `GET /submissions/:id` - View submission details
- `GET /logout` - Logout

### Admin Routes

- `GET /admin` - Dashboard with statistics
- `GET /admin/problems` - Manage problems
- `GET /admin/problems/create` - Create problem form
- `POST /admin/problems/create` - Upload problem ZIP
- `GET /admin/languages` - Manage languages
- `POST /admin/languages/add` - Add new language
- `POST /admin/languages/:id/toggle` - Toggle language status
- `GET /admin/users` - Manage users

## 🔒 Security

- ✅ MD5 password hashing (upgrade to bcrypt recommended)
- ✅ Session-based authentication
- ✅ File size limits (50MB)
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Role-based access control (Admin/User)

## 🚧 Next Steps

- [ ] Implement Docker-based code execution (judge system)
- [ ] Add real-time submission updates (WebSockets)
- [ ] Implement contest system
- [ ] Add discussion/comments for problems
- [ ] Upgrade to bcrypt for passwords
- [ ] Add OAuth (Google/GitHub)
- [ ] Implement rating system
- [ ] Add leaderboard
- [ ] Code plagiarism detection

## 📚 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, Tailwind CSS
- **Database**: MySQL (mysql2)
- **Editor**: Monaco Editor
- **Session**: express-session with file-store
- **Upload**: express-fileupload
- **ZIP**: adm-zip

## 🤝 Contributing

1. Follow the naming conventions
2. Test your changes
3. Update documentation
4. Submit pull request

## 📄 License

MIT License - Open Source

---

**Built with ❤️ for competitive programming enthusiasts!**
