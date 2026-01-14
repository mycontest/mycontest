# Quick Setup Guide for V2 Updates

## Step 1: Install Dependencies

```bash
npm install nodemailer
```

## Step 2: Update Environment Variables

Add these lines to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="MyContest" <noreply@mycontest.uz>
```

### Gmail Setup (if using Gmail)

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password
4. Use the App Password in `SMTP_PASS`

## Step 3: Run Database Migration

### Option 1: Using MySQL Command Line

```bash
mysql -h127.0.0.1 -uroot -proot mycontest < data/setup/migration_v2.sql
```

### Option 2: Using Docker (if MySQL is in Docker)

```bash
# Windows PowerShell
Get-Content data/setup/migration_v2.sql | docker exec -i mycontest-mysql-1 mysql -uroot -proot mycontest

# Linux/Mac
docker exec -i mycontest-mysql-1 mysql -uroot -proot mycontest < data/setup/migration_v2.sql
```

### Option 3: Using MySQL Workbench or phpMyAdmin

1. Open the tool
2. Connect to your database
3. Open `data/setup/migration_v2.sql`
4. Execute the script

## Step 4: Verify Migration

Run this query to check if tables were created:

```sql
SHOW TABLES LIKE '%email%';
SHOW TABLES LIKE 'contest_participants';
DESCRIBE users;
DESCRIBE contest;
DESCRIBE tasks;
```

You should see:

- `email_templates` table
- `email_logs` table
- `contest_participants` table
- New columns in `users`: `email_verified`, `verification_token`
- New columns in `contest`: `contest_type`, `group_id`, `admin_id`
- New columns in `tasks`: `group_id`, `admin_id`

## Step 5: Test Email Functionality

1. Register a new user with email
2. Check email for verification link
3. Click verification link
4. Login with verified account

## Step 6: Test New Features

### Test Private Contest

1. Login as admin
2. Create a new contest
3. Set type to "Private"
4. Save contest
5. Click "Ishtirokchilarni boshqarish"
6. Add users to contest

### Test Email Notification

1. Edit a contest
2. Click "Email yuborish" button
3. Check email logs in database

### Test Admin Checker

1. Go to Tasks list
2. Click play icon on any task
3. Write code and submit

## Troubleshooting

### Email not sending

- Check SMTP credentials in `.env`
- Verify Gmail App Password (if using Gmail)
- Check `email_logs` table for error messages

### Migration errors

- Ensure MySQL is running
- Check database connection
- Verify user has CREATE/ALTER permissions

### Missing columns

- Re-run migration script
- Check for SQL errors in console

## Optional: Create SQL Contest User

For SQL contests (group_id=2), create a MySQL user:

```sql
CREATE USER IF NOT EXISTS 'contest_sql_user'@'%' IDENTIFIED BY 'sql_contest_pass_2026';
GRANT SELECT ON mycontest_sql_practice.* TO 'contest_sql_user'@'%';
FLUSH PRIVILEGES;
```

Note: You'll need to create the `mycontest_sql_practice` database separately.

## Rollback (if needed)

If you need to rollback the changes:

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

## Next Steps

1. Configure email templates (optional - defaults are provided)
2. Test all new features
3. Update existing contests with appropriate types
4. Categorize existing tasks with group_id
5. Train admins on new features

---

**Need Help?** Check `CHANGELOG_V2.md` for detailed feature documentation.
