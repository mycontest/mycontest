# MyContest Platform

Professional Code Judge & Contest Platform with EJS-based MVC architecture and multi-language support.

## Features

- 🏆 **Multi-Language Support**: Python, JavaScript, C++, Java, SQL
- 📝 **Problem Management**: Create problems with multiple test cases
- 🎯 **Contest System**: Organize coding competitions with leaderboards
- 👥 **User Management**: Admin panel, roles, subscriptions
- ⚡ **Real-time Judging**: Docker-based code execution
- 📊 **Statistics & Analytics**: Track user progress and submissions
- 🔒 **Secure**: Flash messages, validation, error handling

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0
- **View Engine**: EJS
- **Validation**: Joi
- **Session**: express-session + file-store
- **Execution**: Docker containers

## Project Structure

```
mycontest/
├── server/                  # Main application
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── modules/            # MVC modules (Router/Controller/Service/Schema)
│   │   ├── auth/           # Authentication
│   │   ├── problems/       # Problem management
│   │   ├── admin/          # Admin panel
│   │   ├── contests/       # Contest system
│   │   ├── compiler/       # Code execution
│   │   └── discussions/    # Discussions (future)
│   ├── middleware/         # Auth & validation middleware
│   ├── utils/              # Database & helpers
│   ├── views/              # EJS templates
│   ├── public/             # Static assets
│   └── scripts/            # Utility scripts
├── database/               # Database schema & seeds
│   ├── init.sql           # Database initialization
│   └── seed.sql           # Sample data
├── data/                   # Runtime data
│   ├── mysql/             # MySQL data directory
│   ├── storage/           # Uploaded files & test cases
│   ├── backups/           # Automated backups
│   └── docs/              # Documentation & nginx config
├── docker-compose.yml     # Docker configuration
└── Dockerfile            # Application container
```

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Docker (optional, for code execution)

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/mycontest/mycontest.git
   cd mycontest
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Initialize database**
   ```bash
   npm run db:init    # Create database schema
   npm run db:seed    # Insert sample data
   ```

5. **Start application**
   ```bash
   npm start
   ```

6. **Access application**
   - URL: http://localhost:7001
   - Admin: `admin` / `admin123`
   - User: `demo_user` / `user123`

## Docker Deployment

```bash
docker-compose up -d
```

## Database Scripts

```bash
npm run db:init      # Initialize database schema
npm run db:seed      # Seed sample data
npm run db:reset     # Reset database (init + seed)
```

## Backup & Restore

```bash
npm run backup       # Full backup (database + files)
npm run backup:db    # Database only
npm run backup:full  # Complete project archive
```

Backups are stored in `data/backups/` and automatically cleaned (keeps last 10).

## Architecture

### MVC Pattern

- **Router**: Route definitions + validation middleware
- **Controller**: Request handling + error wrapping (fnWrap)
- **Service**: Business logic + database operations
- **Schema**: Joi validation schemas

### Error Handling

- Global error handler with flash messages
- Automatic error propagation via `fnWrap`
- Smart routing: validation errors → flash + redirect, API → JSON, others → error page

### Performance

- Promise.all for parallel queries (2-4x faster)
- Pagination for all list endpoints (20-30 items/page)
- Connection pooling for MySQL
- Session management with file store

## API Endpoints

### Public Routes
- `GET /` - Home page (problem list)
- `GET /login` - Login page
- `POST /login` - Login handler
- `GET /register` - Register page
- `POST /register` - Register handler
- `GET /problems` - Problems list
- `GET /problems/:id` - Problem details

### Protected Routes
- `POST /problems/:id/submit` - Submit solution
- `GET /submissions/:id` - Submission details
- `GET /profile` - User profile
- `GET /contests` - Contests list
- `GET /contests/:id` - Contest details

### Admin Routes
- `GET /admin` - Admin dashboard
- `GET /admin/problems` - Manage problems
- `POST /admin/problems/create` - Create problem
- `GET /admin/languages` - Manage languages
- `POST /admin/languages/add` - Add language
- `GET /admin/users` - Manage users

## Environment Variables

```env
# Server
PORT=7001
DOMAIN=http://localhost:7001
NODE_ENV=development

# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=my_contest

# Security
SECRET=your-secret-key-here

# Limits
LIMIT=52428800
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions: https://github.com/mycontest/mycontest/issues
