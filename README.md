# MyContest v2.0 - Coding Competition Platform

A modern, full-stack coding competition platform built with clean architecture and best practices.

## 🏗️ Architecture

The project is structured into three main folders:

### 📁 **server/** - API Service
Universal REST API built with Express.js, featuring:
- **Clean Architecture**: Separated layers (Routes → Controllers → Services → Database)
- **Centralized API responses**: Standardized response format across all endpoints
- **Security**: bcrypt password hashing, helmet, CORS, rate limiting
- **Validation**: Joi schemas for all inputs
- **Session-based auth**: Secure session management with httpOnly cookies
- **Error handling**: Global error handler with proper HTTP status codes

### 📁 **web/** - User Application
Modern Next.js 14 app with shadcn/ui, featuring:
- **App Router**: Latest Next.js architecture
- **TypeScript**: Full type safety
- **shadcn/ui**: Beautiful, accessible components
- **Centralized API client**: All API calls go through `/lib/api.ts`
- **Optimized Sidebar**: Only essential navigation items
  - Problems
  - Contests
  - Discuss (General + Problem-specific chat)
  - Notifications
  - Settings (Profile, Security, Appearance)

### 📁 **admin/** - Admin Dashboard
Admin panel for managing the platform (to be implemented)

## 📦 Technology Stack

### Backend
- **Express.js** - Web framework
- **MySQL2** - Database driver with connection pooling
- **bcryptjs** - Password hashing
- **Joi** - Schema validation
- **express-session** - Session management
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **compression** - Response compression

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI primitives
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 🗂️ Project Structure

```
mycontest_new/
├── server/                 # API Server
│   ├── api/
│   │   ├── controllers/   # Request handlers
│   │   └── routes/        # API routes
│   ├── config/            # Configuration
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── models/            # Joi schemas
│   ├── utils/             # Utilities
│   ├── constants/         # Constants
│   └── server.js          # Entry point
│
├── web/                   # User Web App
│   ├── app/
│   │   ├── (dashboard)/   # Dashboard routes
│   │   │   ├── problems/
│   │   │   ├── contests/
│   │   │   ├── discuss/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── sidebar.tsx    # Optimized sidebar
│   ├── lib/
│   │   ├── api.ts         # Centralized API client
│   │   └── utils.ts       # Utilities
│   └── package.json
│
├── admin/                 # Admin Dashboard (TBD)
├── database/              # Database scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE mycontest_db;"

# Run migrations
cd database/scripts
node run-sql.js ../migrations/init.sql
node run-sql.js ../migrations/seed.sql
```

### 2. Server Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Web App Setup

```bash
cd web

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local

# Start development server
npm run dev
```

Web app will run on `http://localhost:3000`

## 🔑 Key Features

### Centralized API Architecture
All API calls are centralized in `/web/lib/api.ts`:

```typescript
import { problemsApi } from '@/lib/api'

// Get all problems
const response = await problemsApi.getAll({
  page: 1,
  difficulty: 'easy'
})

// Get problem by ID
const problem = await problemsApi.getById(123)
```

### Standardized API Responses
All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Paginated responses include pagination metadata:

```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Optimized Sidebar
Clean, modern sidebar with only essential items:
- **Problems** - Browse and solve coding problems
- **Contests** - Participate in coding contests
- **Discuss** - General chat and problem discussions
- **Notifications** - Stay updated
- **Settings** - Profile, security, appearance

### Security Features
- **bcrypt** password hashing (10 rounds)
- **httpOnly** session cookies
- **helmet** security headers
- **CORS** configuration
- **Rate limiting** on all endpoints
- **Input validation** with Joi schemas
- **SQL injection** prevention with parameterized queries

## 📡 API Endpoints

```
Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
PUT    /api/v1/auth/profile
POST   /api/v1/auth/change-password

Problems
GET    /api/v1/problems
GET    /api/v1/problems/:id
POST   /api/v1/problems
PUT    /api/v1/problems/:id
DELETE /api/v1/problems/:id

Contests
GET    /api/v1/contests
GET    /api/v1/contests/:id
POST   /api/v1/contests
POST   /api/v1/contests/:id/join
GET    /api/v1/contests/:id/leaderboard

Discussions
GET    /api/v1/discussions
GET    /api/v1/discussions/:id
POST   /api/v1/discussions
PUT    /api/v1/discussions/:id
DELETE /api/v1/discussions/:id

Notifications
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/read-all
```

## 🔧 Development

### Server Development
```bash
cd server
npm run dev  # Starts with nodemon
```

### Web Development
```bash
cd web
npm run dev  # Starts Next.js dev server
```

### Database Migrations
```bash
cd database/scripts
node run-sql.js ../migrations/init.sql
```

## 📝 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=mycontest_db

SESSION_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## 🚢 Production Deployment

### Server
```bash
cd server
npm run start
```

### Web
```bash
cd web
npm run build
npm run start
```

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `problems` - Coding problems
- `submissions` - Problem submissions
- `contests` - Coding contests
- `contest_participants` - Contest registrations
- `discussions` - Forum discussions
- `notifications` - User notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC

## 🎯 Roadmap

- [x] Centralized API architecture
- [x] Optimized sidebar
- [x] Problems page
- [x] Contests page
- [x] Discussions page
- [x] Notifications page
- [x] Settings page
- [ ] Problem submission & judging
- [ ] Contest leaderboard
- [ ] Admin dashboard
- [ ] User profiles
- [ ] Code editor integration

## 💡 Notes

- All API calls are centralized in `/web/lib/api.ts`
- Use proper naming conventions and prefixes
- Follow the existing architectural patterns
- Keep business logic in services layer
- Use TypeScript for type safety
- Follow shadcn/ui component patterns

---

Built with ❤️ for competitive programming
