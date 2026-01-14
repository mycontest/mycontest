# Admin Panel Quick Reference Guide

## Navigation

### Main Menu

1. **Dashboard** - Overview and statistics
2. **Public Files** - Google Drive link for shared resources
3. **Musobaqalar** - Contest management
4. **Masalalar** - Task/Problem management
5. **Foydalanuvchilar** - User management

## Contest Management

### Creating a Contest

1. Click "Musobaqalar" in sidebar
2. Click "Yangi qo'shish" button
3. Fill in:
   - Contest name
   - Description (rich text editor)
   - Contest type (Public/Private)
   - Group (Programming/SQL)
   - Start date & time
   - End date & time
4. Click "Saqlash"

### Contest Types

- **Public**: Anyone can join and participate
- **Private**: Only invited users can participate

### Managing Private Contest Participants

1. Edit a private contest
2. Click "Ishtirokchilarni boshqarish"
3. Select user from dropdown
4. Click "Qo'shish"
5. To remove: Click trash icon next to user

### Sending Email Notifications

1. Edit a contest
2. Click "Email yuborish" button
3. Email sent to top 1000 active users with verified emails
4. Check success message for delivery status

### Adding Tasks to Contest

1. Edit contest
2. Scroll to "Bog'langan masalalar"
3. Enter task ID
4. Click "Qo'shish"
5. To remove: Click trash icon

## Task Management

### Creating a Task

1. Click "Masalalar" in sidebar
2. Click "Yangi qo'shish" button
3. Fill in:
   - Task name
   - Task type (Programming/SQL)
   - Time limit (ms)
   - Memory limit (KB)
   - Public test count
   - Total test count
   - Problem description (rich text)
   - Input format (rich text)
   - Output format (rich text)
   - Solution analysis (optional)
4. Click "Saqlash"

### Uploading Test Cases

1. Create/edit a task
2. Scroll to "Test Case yuklash"
3. Click "Choose File"
4. Select ZIP file (max 10MB)
5. ZIP structure: `input1.txt`, `output1.txt`, `input2.txt`, `output2.txt`, etc.
6. Click "Yuklash"

### Testing a Task (Checker)

1. Go to Tasks list
2. Click play icon (▶) next to task
3. Select programming language
4. Write code in editor
5. Click "Tekshirish"
6. Results open in new tab

## User Management

### Viewing Users

1. Click "Foydalanuvchilar" in sidebar
2. View all registered users
3. Check email verification status (✓ or ✗)
4. See user roles (Admin/User)

### User Information Displayed

- User ID
- Username
- Full name
- Email address
- Email verification status
- Role (Admin/User)
- Registration date

## Rich Text Editor

### Available Formatting

- **Bold**, _Italic_, Underline, Strike
- Headings (H1-H6)
- Lists (ordered, bullet, checklist)
- Code blocks
- Links, Images, Videos
- Mathematical formulas
- Text alignment
- Colors and backgrounds

### Tips

- Use code blocks for sample inputs/outputs
- Use formulas for mathematical problems
- Add images for visual problems
- Use headings to organize content

## Email System

### Email Templates

Two default templates:

1. **verification** - Email verification for new users
2. **contest_notification** - Contest announcements

### Email Logs

- All sent emails logged in database
- Check status (sent/failed)
- View error messages if failed

## File Upload Limits

### Test Cases

- Maximum size: 10MB per ZIP file
- Recommended: Keep test files small
- Large files may slow down checker

## Best Practices

### Contest Creation

1. Set clear start/end times
2. Write detailed descriptions
3. Choose appropriate type (public/private)
4. Test all tasks before contest starts

### Task Creation

1. Write clear problem statements
2. Provide sample inputs/outputs
3. Upload all test cases before adding to contest
4. Test with checker before publishing

### Private Contests

1. Add participants before contest starts
2. Send email notification to inform users
3. Double-check participant list

### Email Notifications

1. Only send when contest is ready
2. Verify contest details before sending
3. Check email logs for delivery status

## Keyboard Shortcuts

### Code Editor (Checker)

- `Ctrl + Space` - Auto-complete
- `Ctrl + /` - Comment/uncomment
- `Tab` - Indent
- `Shift + Tab` - Unindent

## Troubleshooting

### Test Cases Not Showing

- Check ZIP file structure
- Ensure file names match pattern: `input1.txt`, `output1.txt`
- Verify file upload was successful

### Email Not Sending

- Check SMTP configuration in `.env`
- Verify email credentials
- Check email logs for errors

### Checker Not Working

- Ensure task has test cases uploaded
- Check language is selected
- Verify code compiles without errors

## Quick Actions

| Action              | Location               | Icon |
| ------------------- | ---------------------- | ---- |
| Edit Contest        | Contest List           | ✏️   |
| Add Task to Contest | Contest Edit           | ➕   |
| Test Task           | Task List              | ▶️   |
| Edit Task           | Task List              | ✏️   |
| Manage Participants | Contest Edit (Private) | 👥   |
| Send Email          | Contest Edit           | ✉️   |

## Status Indicators

### Email Verification

- ✓ (Green) - Verified
- ✗ (Gray) - Not verified

### Task Status (in Contest)

- ✅ - Accepted
- ❌ - Wrong Answer
- - - Not attempted

### Contest Type

- Public - Open to all
- Private - Invitation only

## Data Management

### Viewing Your Content

- All contests show admin who created them
- All tasks show admin who created them
- Filter by your admin_id (automatic)

### Multi-Admin Environment

- Each admin manages their own content
- Admin ID tracked automatically
- No interference between admins

---

**Version**: 2.0
**Last Updated**: 2026-01-14

For technical details, see `CHANGELOG_V2.md`
For setup instructions, see `SETUP_V2.md`
