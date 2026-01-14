# ✅ Implementation Checklist - MyContest V2

## Pre-Deployment Checklist

### 1. Database Migration ⚠️ REQUIRED

- [ ] Backup current database
  ```bash
  mysqldump -h127.0.0.1 -uroot -proot mycontest > backup_before_v2.sql
  ```
- [ ] Run migration script
  ```bash
  mysql -h127.0.0.1 -uroot -proot mycontest < data/setup/migration_v2.sql
  ```
- [ ] Verify new tables exist
  ```sql
  SHOW TABLES LIKE '%email%';
  SHOW TABLES LIKE 'contest_participants';
  ```
- [ ] Verify new columns added
  ```sql
  DESCRIBE users;
  DESCRIBE contest;
  DESCRIBE tasks;
  ```

### 2. Dependencies Installation ⚠️ REQUIRED

- [ ] Install nodemailer
  ```bash
  npm install nodemailer
  ```
- [ ] Verify package.json updated
- [ ] Check for any npm warnings

### 3. Environment Configuration ⚠️ REQUIRED

- [ ] Add SMTP settings to `.env`
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_FROM="MyContest" <noreply@mycontest.uz>
  ```
- [ ] Test SMTP connection (optional but recommended)
- [ ] Verify all env variables are set

### 4. File System Checks

- [ ] Verify all new files created:
  - [ ] `shared/email.js`
  - [ ] `views/admin/participants.ejs`
  - [ ] `views/admin/users.ejs`
  - [ ] `views/admin/checker.ejs`
  - [ ] `data/setup/migration_v2.sql`
- [ ] Check file permissions (if on Linux/Mac)

### 5. Code Verification

- [ ] Review modified files:
  - [ ] `modules/auth/auth.controller.js`
  - [ ] `modules/admin/admin.controller.js`
  - [ ] `views/admin/sidebar.ejs`
  - [ ] `views/admin/contestadd.ejs`
  - [ ] `views/admin/tasksadd.ejs`
- [ ] Check for syntax errors
- [ ] Verify imports are correct

## Testing Checklist

### Email Verification Flow

- [ ] Register new user with email
- [ ] Check email received
- [ ] Click verification link
- [ ] Verify email_verified = TRUE in database
- [ ] Try logging in with verified account

### Contest Management

- [ ] Create public contest
  - [ ] Verify contest_type = 'public'
  - [ ] Check group_id is set
  - [ ] Verify admin_id is set
- [ ] Create private contest
  - [ ] Verify contest_type = 'private'
  - [ ] Access participants management page
  - [ ] Add participants
  - [ ] Remove participants
  - [ ] Verify contest_participants table

### Email Notifications

- [ ] Edit a contest
- [ ] Click "Email yuborish" button
- [ ] Check email_logs table for entries
- [ ] Verify emails sent (check inbox)
- [ ] Check for any failed emails

### Task Management

- [ ] Create new task
  - [ ] Select group_id (Programming/SQL)
  - [ ] Verify admin_id is set
  - [ ] Save task
- [ ] Upload test cases
  - [ ] Try file > 10MB (should fail)
  - [ ] Upload valid ZIP file
  - [ ] Verify files extracted

### Admin Checker

- [ ] Go to Tasks list
- [ ] Click play icon on a task
- [ ] Select language
- [ ] Write test code
- [ ] Submit
- [ ] Verify results open in new tab

### User Management

- [ ] Access `/admin/users`
- [ ] Verify user list displays
- [ ] Check email verification status
- [ ] Check pagination works

### UI/UX Tests

- [ ] Problem links open in new tab
- [ ] Sidebar navigation works
- [ ] Public Files link works
- [ ] All forms submit correctly
- [ ] Flash messages display

### Admin Role in Results

- [ ] Create contest as admin
- [ ] Submit solution as admin
- [ ] Check leaderboard
- [ ] Verify admin appears in results

## Security Checks

- [ ] Email verification prevents unverified login
- [ ] Private contests restrict access
- [ ] File upload size limit works
- [ ] Admin-only routes protected
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)

## Performance Checks

- [ ] Email sending doesn't block requests
- [ ] Bulk emails have delays (100ms)
- [ ] File uploads validate before processing
- [ ] Database queries are efficient
- [ ] No memory leaks

## Documentation Review

- [ ] Read `CHANGELOG_V2.md`
- [ ] Review `SETUP_V2.md`
- [ ] Study `ADMIN_GUIDE.md`
- [ ] Check `ARCHITECTURE.md`
- [ ] Review `TODO.md` for future work

## Production Deployment

### Pre-Deployment

- [ ] All tests passing
- [ ] Database migration successful
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Documentation reviewed

### Deployment Steps

- [ ] Stop application
  ```bash
  npm run docker:down
  ```
- [ ] Pull latest code
  ```bash
  git pull origin main
  ```
- [ ] Run migration (if not done)
- [ ] Install dependencies
  ```bash
  npm install
  ```
- [ ] Start application
  ```bash
  npm run docker:up
  ```
- [ ] Check logs
  ```bash
  npm run logs:app
  ```

### Post-Deployment

- [ ] Verify application is running
- [ ] Test critical features
- [ ] Monitor error logs
- [ ] Check email functionality
- [ ] Verify database connections
- [ ] Test user registration
- [ ] Test contest creation

## Rollback Plan (If Needed)

### Database Rollback

```sql
-- Remove new columns
ALTER TABLE users DROP COLUMN email_verified, DROP COLUMN verification_token;
ALTER TABLE contest DROP COLUMN contest_type, DROP COLUMN group_id, DROP COLUMN admin_id;
ALTER TABLE tasks DROP COLUMN group_id, DROP COLUMN admin_id;

-- Drop new tables
DROP TABLE IF EXISTS contest_participants;
DROP TABLE IF EXISTS email_templates;
DROP TABLE IF EXISTS email_logs;
```

### Code Rollback

```bash
git checkout <previous-commit-hash>
npm install
npm run docker:restart
```

### Restore Database

```bash
mysql -h127.0.0.1 -uroot -proot mycontest < backup_before_v2.sql
```

## Monitoring

### First 24 Hours

- [ ] Monitor application logs
- [ ] Check email delivery rates
- [ ] Watch for errors
- [ ] Monitor database performance
- [ ] Check user feedback

### First Week

- [ ] Review email logs
- [ ] Check contest creation
- [ ] Monitor user registrations
- [ ] Review admin usage
- [ ] Collect feedback

## Training

### Admin Training

- [ ] Share `ADMIN_GUIDE.md`
- [ ] Demo contest creation
- [ ] Show participant management
- [ ] Explain email notifications
- [ ] Demo admin checker

### User Communication

- [ ] Announce new features
- [ ] Explain email verification
- [ ] Inform about contest types
- [ ] Provide support contact

## Success Criteria

- [ ] All features working as expected
- [ ] No critical bugs
- [ ] Email delivery > 95%
- [ ] User registration successful
- [ ] Admin panel accessible
- [ ] Performance acceptable
- [ ] Documentation complete

## Known Issues

Document any issues found during testing:

1. **Issue**: **********\_**********

   - **Severity**: Low/Medium/High
   - **Workaround**: **********\_**********
   - **Fix ETA**: **********\_**********

2. **Issue**: **********\_**********
   - **Severity**: Low/Medium/High
   - **Workaround**: **********\_**********
   - **Fix ETA**: **********\_**********

## Support Contacts

- **Technical Issues**: balkibumen@gmail.com
- **Documentation**: See `ADMIN_GUIDE.md`
- **Emergency Rollback**: Follow rollback plan above

---

## Quick Reference

### Most Important Steps

1. ✅ Backup database
2. ✅ Run migration
3. ✅ Install nodemailer
4. ✅ Configure SMTP
5. ✅ Test email verification

### Critical Files

- `data/setup/migration_v2.sql` - Database changes
- `shared/email.js` - Email functionality
- `.env` - SMTP configuration
- `modules/admin/admin.controller.js` - Admin features

### Test Accounts

Create test accounts for:

- [ ] Regular user (with email)
- [ ] Admin user (with email)
- [ ] Unverified user (for testing)

---

**Checklist Version**: 1.0
**Last Updated**: 2026-01-14
**Status**: Ready for deployment

**Completed By**: ******\_\_\_\_******
**Date**: ******\_\_\_\_******
**Notes**: ******\_\_\_\_******
