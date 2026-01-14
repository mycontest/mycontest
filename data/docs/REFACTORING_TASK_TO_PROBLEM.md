# ✅ Complete Refactoring: Tasks → Problems

## O'zgarishlar

### 1. Database Schema ✅

**Table Nomlari:**

- `tasks` → `problems`
- `contest_tasks` → `contest_problems`
- `key_id` → `contest_problem_id`

**Column Nomlari:**

- `task_id` → `problem_id` (barcha joyda)
- `task_count` → `problem_count` (view'da)

### 2. Database Files ✅

- ✅ `init.sql` - Yangilandi
- ✅ `view.sql` - Yangilandi
- ✅ `seed.sql` - Yangilandi

### 3. Views ✅

- `vw_tasks` → `vw_problems`
- `vw_contest` - `problem_count` ishlatadi

### 4. Backend Code ✅

- `fnGetTasksQuery()` → `fnGetProblemsQuery()`
- Variable: `tasks` → `problems`
- Import: `fnGetProblemsQuery`

### 5. Frontend ✅

- `problems.ejs` - `problems` variable ishlatadi

## Yangi Database Schema

```sql
-- Problems table
CREATE TABLE problems (
    problem_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT DEFAULT 1,
    admin_id INT,
    name VARCHAR(255),
    question_content TEXT,
    ...
);

-- Contest-Problems junction
CREATE TABLE contest_problems (
    contest_problem_id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,
    FOREIGN KEY (contest_id) REFERENCES contest(contest_id),
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id)
);

-- Attempts
CREATE TABLE attempts (
    attempt_id INT PRIMARY KEY AUTO_INCREMENT,
    contest_id INT,
    problem_id INT,  -- ✅ Yangilandi
    user_id INT,
    ...
);
```

## Deployment

### Yangi Project Uchun

```bash
# 1. Database yaratish
docker exec -i mycontest_mysql mysql -uroot -proot < data/setup/init.sql

# 2. View'larni yaratish
docker exec -i mycontest_mysql mysql -uroot -proot mycontest < data/setup/view.sql

# 3. Seed data
docker exec -i mycontest_mysql mysql -uroot -proot mycontest < data/setup/seed.sql
```

### Mavjud Project (Overwrite)

Siz projectni overwrite qilasiz, shuning uchun migration kerak emas.
Faqat yuqoridagi 3 ta buyruqni ishga tushiring.

## Keyingi Qadamlar

Endi backend code'ni to'liq yangilash kerak:

1. ✅ Admin controller - `task` → `problem`
2. ✅ Contest controller - barcha `task_id` → `problem_id`
3. ✅ Helpers - query'larda `problem_id`
4. ✅ Views - barcha `task` variable'larni `problem` ga
5. ✅ Checker module - `worker.js` (task_id → problem_id)
6. ✅ Routers - Admin va Contest routerlari yangilandi

---

**Status**: ✅ COMPLETED (Full Refactoring Done)
**Date**: 2026-01-14
