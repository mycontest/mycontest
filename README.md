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
├─ src/                  # Main application (Express + EJS)
│  ├─ app.js
│  ├─ server.js
│  ├─ modules/           # Routers/Controllers/Services/Schemas
│  ├─ middleware/
│  ├─ utils/
│  ├─ views/
│  └─ public/
├─ database/
│  ├─ migrations/        # init.sql + seed.sql
│  └─ scripts/           # docker-aware helpers (backup, run-sql)
├─ data/                 # Runtime data
│  ├─ mysql/             # MySQL data directory
│  ├─ storage/           # Uploaded files & test cases
│  └─ backups/           # Automated backups
├─ docs/
├─ docker-compose.yml    # Docker configuration
└─ Dockerfile            # Application container
```

## Quick Start (Docker-first)

### Prerequisites

- Node.js 18+
- Docker + Docker Compose v2 (no local MySQL needed)

### Installation

1. **Clone repository**

   ```bash
   git clone https://github.com/mycontest/mycontest.git
   cd mycontest
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your settings (defaults point at docker services)
   ```

4. **Start containers (web + MySQL)**

   ```bash
   docker compose up -d
   ```

5. **Initialize and seed the database (runs inside the mysql container)**

   ```bash
   npm run db:init    # Create database schema
   npm run db:seed    # Insert sample data
   ```

6. **Access application**
   - URL: http://localhost:7001
   - Admin: `admin` / `admin123`
   - User: `demo_user` / `user123`

## Docker Deployment

```bash
docker compose up -d              # start containers
docker compose up -d --build web  # rebuild web after git pull
```

## Database Scripts

```bash
npm run db:init      # Initialize database schema (inside mysql container)
npm run db:seed      # Seed sample data (inside mysql container)
npm run db:reset     # Reset database (init + seed)
```

## Backup & Restore

```bash
npm run backup       # Full backup (database + storage + code) -> data/backups/*.zip
npm run backup:db    # Database only (zip with .sql)
npm run backup:full  # Alias for npm run backup
```

Backups are stored in `data/backups/` and automatically cleaned (keeps last 10). All backup commands run via Docker, so no local MySQL install is required.

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
MYSQL_DATABASE=mycontest

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
