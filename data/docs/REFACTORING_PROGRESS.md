# 🔄 Backend Refactoring Progress

## ✅ Tayyor

### 1. Database ✅

- `init.sql` - problems table
- `view.sql` - vw_problems
- `seed.sql` - problems data

### 2. Helpers ✅

- `fnReadPublicTests(problem)` - problem_id
- `fnGetProblemsQuery()` - problem_id
- `fnGetRatingBoard(problems)` - problem_id

## ⏳ Qolgan Ishlar

### 3. Contest Controller

- [ ] URL params: `task_id` → `problem_id`
- [ ] Variables: `task` → `problem`
- [ ] Queries: barcha `task_id` → `problem_id`
- [ ] Routes: `/problem?task_id=` → `/problem?problem_id=`

### 4. Admin Controller

- [ ] Table: `tasks` → `problems`
- [ ] Variables: `task` → `problem`
- [ ] Queries: barcha `task_id` → `problem_id`
- [ ] File paths: `testcase/${task_id}` → `testcase/${problem_id}`

### 5. Views

- [ ] `problems.ejs` - `task_id` → `problem_id`
- [ ] `problem.ejs` - `task` → `problem`
- [ ] Admin views - barcha `task` → `problem`

### 6. Routes

- [ ] Contest routes - URL'larda `task_id` → `problem_id`
- [ ] Admin routes - `/tasks` → `/problems`

### 7. Worker

- [ ] `checker/worker.js` - `task_id` → `problem_id`

## Keyingi Qadam

Davom ettirishni xohlaysizmi? Bu juda katta refactoring va 50+ joyni o'zgartirish kerak.

Yoki migration script yozib, eski code'ni qoldirish va faqat database'ni o'zgartirish yaxshiroqmi?

---

**Status**: 30% Complete
**Qolgan**: ~50 file/location
