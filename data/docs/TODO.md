# TODO - Future Enhancements

## Items Mentioned But Not Yet Implemented

### 1. SQL Contest Full Implementation

**Status**: Partially implemented (database structure ready)

**What's Done**:

- ✅ Database schema supports group_id=2 for SQL contests
- ✅ Contest and task forms have SQL option
- ✅ Migration script includes SQL user creation template

**What's Needed**:

- [ ] Create actual MySQL database for SQL practice (`mycontest_sql_practice`)
- [ ] Create restricted MySQL user (`contest_sql_user`)
- [ ] Implement SQL query execution interface
- [ ] Add SQL query preview functionality
- [ ] Create SQL-specific problem template
- [ ] Add result set comparison for SQL problems

**Implementation Notes**:

```sql
-- Create practice database
CREATE DATABASE mycontest_sql_practice;

-- Create sample tables for practice
USE mycontest_sql_practice;
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    grade VARCHAR(10)
);

-- Create restricted user
CREATE USER 'contest_sql_user'@'%' IDENTIFIED BY 'sql_contest_pass_2026';
GRANT SELECT ON mycontest_sql_practice.* TO 'contest_sql_user'@'%';
FLUSH PRIVILEGES;
```

### 2. SQL Query Optimization with Stored Procedures

**Status**: Not implemented

**What's Needed**:

- [ ] Convert `fnGetRatingBoard` to MySQL stored procedure
- [ ] Convert `fnGetTasksQuery` to MySQL stored procedure
- [ ] Benchmark performance improvements
- [ ] Update Node.js code to call procedures

**Current Implementation**:

- Functions are in `shared/helpers.js`
- SQL is generated dynamically in JavaScript
- Works correctly but could be faster

**Proposed Approach**:

```sql
-- Example stored procedure for rating board
DELIMITER //
CREATE PROCEDURE sp_GetRatingBoard(
    IN p_contest_id INT,
    IN p_contest_time DATETIME
)
BEGIN
    -- Dynamic SQL generation moved to MySQL
    -- Better performance with compiled execution plan
END //
DELIMITER ;
```

**Benefits**:

- Faster execution (compiled once)
- Reduced network overhead
- Better query optimization by MySQL
- Centralized business logic

### 3. Admin Checker - Full Integration

**Status**: UI implemented, backend integration needed

**What's Done**:

- ✅ Checker page with CodeMirror editor
- ✅ Language selection
- ✅ Task information display

**What's Needed**:

- [ ] Dedicated checker endpoint (separate from user submissions)
- [ ] Admin-only submission queue
- [ ] Instant feedback without affecting user stats
- [ ] Test case preview for admins
- [ ] Detailed execution logs

**Implementation Suggestion**:

- Create `/admin/check` endpoint
- Mark submissions with `is_admin_test=true` flag
- Don't count in statistics
- Show detailed error messages

### 4. Enhanced Textarea/Editor

**Status**: Using Quill, could be improved

**Current Issues**:

- Basic Quill integration
- May have initialization issues (mentioned in requirements)

**Improvements Needed**:

- [ ] Better initialization handling
- [ ] Ensure all textareas use consistent editor
- [ ] Add markdown support option
- [ ] LaTeX formula preview
- [ ] Image upload handling
- [ ] Better mobile support

### 5. Unused Pages Cleanup

**Status**: Partially done

**What's Done**:

- ✅ News section removed from admin panel

**What's Needed**:

- [ ] Audit all pages in `views/pages/`
- [ ] Remove truly unused pages
- [ ] Update routing accordingly
- [ ] Clean up dead code

**Pages to Review**:

```
views/pages/
├── home.ejs
├── signin.ejs
├── signup.ejs
├── contest.ejs
├── problems.ejs
├── problem.ejs
├── attempts.ejs
├── leaderboard.ejs
└── ... (check for others)
```

### 6. File Upload Improvements

**Status**: Basic validation added

**What's Done**:

- ✅ 10MB size limit for test cases

**Additional Improvements Needed**:

- [ ] File type validation (only .zip)
- [ ] Virus scanning (if needed)
- [ ] Progress bar for large uploads
- [ ] Automatic extraction validation
- [ ] Test case file naming validation
- [ ] Duplicate file detection

### 7. Email Template Management UI

**Status**: Templates in database, no UI

**What's Needed**:

- [ ] Admin page to edit email templates
- [ ] Template preview functionality
- [ ] Variable documentation
- [ ] Test email sending
- [ ] Template versioning

### 8. Advanced User Management

**Status**: Basic list view implemented

**Enhancements Needed**:

- [ ] User search/filter
- [ ] Bulk user operations
- [ ] User statistics
- [ ] Ban/suspend functionality
- [ ] Role management UI
- [ ] Password reset by admin

### 9. Contest Analytics

**Status**: Not implemented

**Features Needed**:

- [ ] Submission statistics per contest
- [ ] Problem difficulty analysis
- [ ] User participation metrics
- [ ] Time-based submission graphs
- [ ] Success rate per problem
- [ ] Average solve time

### 10. Notification System

**Status**: Email only

**Enhancements Needed**:

- [ ] In-app notifications
- [ ] Notification preferences
- [ ] Contest reminders
- [ ] Submission status updates
- [ ] Achievement notifications

## Priority Ranking

### High Priority

1. **SQL Contest Full Implementation** - Core feature mentioned
2. **Admin Checker Integration** - Usability improvement
3. **Textarea/Editor Fixes** - Bug fixes

### Medium Priority

4. **SQL Query Optimization** - Performance improvement
5. **File Upload Improvements** - Security & UX
6. **Unused Pages Cleanup** - Code maintenance

### Low Priority

7. **Email Template UI** - Nice to have
8. **Advanced User Management** - Future scaling
9. **Contest Analytics** - Insights
10. **Notification System** - Enhanced UX

## Implementation Timeline Suggestion

### Phase 1 (Week 1-2)

- Fix textarea/editor issues
- Complete admin checker integration
- Clean up unused pages

### Phase 2 (Week 3-4)

- Implement SQL contest functionality
- Add file upload improvements
- Create email template UI

### Phase 3 (Month 2)

- SQL query optimization with procedures
- Advanced user management
- Contest analytics

### Phase 4 (Month 3+)

- In-app notification system
- Additional features based on user feedback

## Notes

- All database structures are ready for these features
- Most backend logic can reuse existing patterns
- Focus on user-facing features first
- Performance optimizations can come later

## Testing Requirements

For each feature:

- [ ] Unit tests
- [ ] Integration tests
- [ ] User acceptance testing
- [ ] Performance benchmarks
- [ ] Security audit

---

**Document Version**: 1.0
**Last Updated**: 2026-01-14
**Status**: Planning Phase
