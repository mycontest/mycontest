# MyContest Platform V2 - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MyContest Platform V2                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │◄────►│   Backend    │◄────►│   Database   │
│  (EJS Views) │      │  (Node.js)   │      │   (MySQL)    │
└──────────────┘      └──────────────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Email Service│
                      │ (Nodemailer) │
                      └──────────────┘
```

## Module Structure

```
mycontest/
│
├── modules/
│   ├── auth/                    # Authentication & Registration
│   │   ├── auth.controller.js   # ✅ Email verification added
│   │   ├── auth.router.js       # ✅ Verify route added
│   │   └── auth.schema.js
│   │
│   ├── admin/                   # Admin Panel
│   │   ├── admin.controller.js  # ✅ 8 new functions added
│   │   └── admin.router.js      # ✅ 7 new routes added
│   │
│   ├── contest/                 # Contest Management
│   └── error/                   # Error Handling
│
├── shared/
│   ├── mysql.js                 # Database connection
│   ├── redis.js                 # Cache management
│   ├── helpers.js               # ✅ Admin filter removed
│   └── email.js                 # ✅ NEW - Email utilities
│
├── views/
│   ├── admin/                   # Admin Views
│   │   ├── sidebar.ejs          # ✅ Reorganized
│   │   ├── contestadd.ejs       # ✅ Contest types added
│   │   ├── tasksadd.ejs         # ✅ Group ID added
│   │   ├── tasks.ejs            # ✅ Checker button added
│   │   ├── users.ejs            # ✅ NEW - User management
│   │   ├── participants.ejs     # ✅ NEW - Participant mgmt
│   │   └── checker.ejs          # ✅ NEW - Admin checker
│   │
│   ├── pages/                   # Public Views
│   │   ├── signup.ejs           # ✅ Email field added
│   │   └── problems.ejs         # ✅ Target blank added
│   │
│   └── components/              # Reusable Components
│
└── data/
    └── setup/
        ├── init.sql
        ├── seed.sql
        ├── view.sql
        └── migration_v2.sql     # ✅ NEW - V2 migration
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         Database Tables                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      users       │
├──────────────────┤
│ user_id (PK)     │
│ username         │
│ password         │
│ full_name        │
│ email            │ ✅ NEW
│ email_verified   │ ✅ NEW
│ verification_token│ ✅ NEW
│ role             │
│ created_dt       │
│ updated_dt       │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│contest_participants│ ✅ NEW TABLE
├──────────────────┤
│ participant_id(PK)│
│ contest_id (FK)  │
│ user_id (FK)     │
│ created_dt       │
│ updated_dt       │
└──────────────────┘
        │
        │ N:1
        ▼
┌──────────────────┐
│     contest      │
├──────────────────┤
│ contest_id (PK)  │
│ name             │
│ content          │
│ start_date       │
│ end_date         │
│ contest_type     │ ✅ NEW (public/private)
│ group_id         │ ✅ NEW (1=Programming, 2=SQL)
│ admin_id         │ ✅ NEW (creator tracking)
│ created_dt       │
│ updated_dt       │
└──────────────────┘
        │
        │ N:M
        ▼
┌──────────────────┐
│  contest_tasks   │
├──────────────────┤
│ key_id (PK)      │
│ contest_id (FK)  │
│ task_id (FK)     │
│ created_dt       │
│ updated_dt       │
└──────────────────┘
        │
        │ N:1
        ▼
┌──────────────────┐
│      tasks       │
├──────────────────┤
│ task_id (PK)     │
│ group_id         │ ✅ UPDATED (1=Programming, 2=SQL)
│ admin_id         │ ✅ NEW (creator tracking)
│ name             │
│ question_content │
│ input_content    │
│ output_content   │
│ time_ms          │
│ memory_kb        │
│ test_public      │
│ test_all         │
│ comment_content  │
│ created_dt       │
│ updated_dt       │
└──────────────────┘

┌──────────────────┐
│ email_templates  │ ✅ NEW TABLE
├──────────────────┤
│ template_id (PK) │
│ template_name    │
│ subject          │
│ html_content     │
│ created_dt       │
│ updated_dt       │
└──────────────────┘

┌──────────────────┐
│   email_logs     │ ✅ NEW TABLE
├──────────────────┤
│ log_id (PK)      │
│ recipient_email  │
│ subject          │
│ template_name    │
│ status           │
│ error_message    │
│ sent_dt          │
└──────────────────┘
```

## Request Flow

### User Registration with Email Verification

```
User                Frontend            Backend             Database            Email
 │                     │                   │                   │                  │
 │  Fill signup form   │                   │                   │                  │
 ├────────────────────►│                   │                   │                  │
 │                     │  POST /sign-up    │                   │                  │
 │                     ├──────────────────►│                   │                  │
 │                     │                   │  Check username   │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │                   │  Check email      │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │                   │  Generate token   │                  │
 │                     │                   │  Insert user      │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │                   │  Send email       │                  │
 │                     │                   ├──────────────────────────────────────►│
 │                     │  Redirect         │                   │                  │
 │                     │◄──────────────────┤                   │                  │
 │  Success message    │                   │                   │                  │
 │◄────────────────────┤                   │                   │                  │
 │                     │                   │                   │                  │
 │  Check email        │                   │                   │                  │
 │◄────────────────────────────────────────────────────────────────────────────────┤
 │                     │                   │                   │                  │
 │  Click verify link  │                   │                   │                  │
 ├────────────────────►│  GET /verify      │                   │                  │
 │                     ├──────────────────►│                   │                  │
 │                     │                   │  Verify token     │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │                   │  Update verified  │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │  Redirect         │                   │                  │
 │                     │◄──────────────────┤                   │                  │
 │  Email verified!    │                   │                   │                  │
 │◄────────────────────┤                   │                   │                  │
```

### Private Contest Participant Management

```
Admin               Frontend            Backend             Database
 │                     │                   │                   │
 │  Create contest     │                   │                   │
 │  (type=private)     │                   │                   │
 ├────────────────────►│  POST /admin/     │                   │
 │                     │  contestadd       │                   │
 │                     ├──────────────────►│  Insert contest   │
 │                     │                   ├──────────────────►│
 │                     │                   │  (contest_type=   │
 │                     │                   │   'private')      │
 │                     │                   │                   │
 │  Manage participants│                   │                   │
 ├────────────────────►│  GET /admin/      │                   │
 │                     │  participants     │                   │
 │                     ├──────────────────►│  Get contest      │
 │                     │                   ├──────────────────►│
 │                     │                   │  Get participants │
 │                     │                   ├──────────────────►│
 │                     │                   │  Get all users    │
 │                     │                   ├──────────────────►│
 │                     │  Render page      │                   │
 │                     │◄──────────────────┤                   │
 │  View participants  │                   │                   │
 │◄────────────────────┤                   │                   │
 │                     │                   │                   │
 │  Add participant    │                   │                   │
 ├────────────────────►│  POST /admin/     │                   │
 │                     │  participants/add │                   │
 │                     ├──────────────────►│  Insert           │
 │                     │                   │  participant      │
 │                     │                   ├──────────────────►│
 │                     │  Redirect         │                   │
 │                     │◄──────────────────┤                   │
 │  Participant added  │                   │                   │
 │◄────────────────────┤                   │                   │
```

### Email Notification Flow

```
Admin               Frontend            Backend             Database            Email
 │                     │                   │                   │                  │
 │  Click "Send Email" │                   │                   │                  │
 ├────────────────────►│  POST /admin/     │                   │                  │
 │                     │  notify           │                   │                  │
 │                     ├──────────────────►│  Get contest      │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │                   │  Get active users │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │                   │  (verified emails)│                  │
 │                     │                   │                   │                  │
 │                     │                   │  For each user:   │                  │
 │                     │                   │  - Render template│                  │
 │                     │                   │  - Send email     │                  │
 │                     │                   ├──────────────────────────────────────►│
 │                     │                   │  - Log result     │                  │
 │                     │                   ├──────────────────►│                  │
 │                     │                   │  (100ms delay)    │                  │
 │                     │                   │                   │                  │
 │                     │  Success message  │                   │                  │
 │                     │◄──────────────────┤                   │                  │
 │  Emails sent!       │                   │                   │                  │
 │◄────────────────────┤                   │                   │                  │
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Security Layers                           │
└─────────────────────────────────────────────────────────────────┘

1. Authentication
   ├── Password hashing (MD5 + SECRET)
   ├── Session management
   └── Email verification

2. Authorization
   ├── Role-based access (admin/user)
   ├── Admin-only routes
   └── Contest access control (public/private)

3. Input Validation
   ├── File size limits (10MB)
   ├── Email format validation
   └── SQL injection prevention (parameterized queries)

4. Data Protection
   ├── Admin ID tracking
   ├── Email verification tokens
   └── Secure password storage

5. Email Security
   ├── SMTP authentication
   ├── Rate limiting (100ms delay)
   └── Verified recipients only
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Strategies                        │
└─────────────────────────────────────────────────────────────────┘

1. Database
   ├── Indexed foreign keys
   ├── Efficient queries
   └── Connection pooling

2. Email
   ├── Bulk sending with delays
   ├── Limited recipients (1000)
   └── Async processing

3. File Uploads
   ├── Size validation before processing
   ├── Efficient extraction
   └── Error handling

4. Caching
   ├── Redis for sessions
   └── Static file caching

5. Future Optimizations
   ├── Stored procedures (TODO)
   ├── Query optimization
   └── CDN for static assets
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Production Setup                            │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Load Balancer│
                    │   (Optional)  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼──────┐ ┌──▼──────┐
       │  Node.js    │ │ Node.js │ │ Node.js │
       │  Instance 1 │ │Instance2│ │Instance3│
       └──────┬──────┘ └──┬──────┘ └──┬──────┘
              │            │            │
              └────────────┼────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼──────┐ ┌──▼──────┐
       │   MySQL     │ │  Redis  │ │  SMTP   │
       │  Database   │ │  Cache  │ │ Server  │
       └─────────────┘ └─────────┘ └─────────┘
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-14
**Architecture**: Monolithic with modular structure
**Scalability**: Horizontal scaling ready
