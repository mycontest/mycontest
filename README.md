# 🏆 MyContest - Online Programming Contest Platform

A modern, scalable online judge system for hosting programming contests with multi-language support, real-time judging, and comprehensive contest management.

![Status](https://img.shields.io/badge/status-production--ready-success)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-ISC-blue)

## ✨ Features

### 🎯 Core Features

- **Multi-Language Support** - C++, Python, Java, JavaScript, C#, Go
- **Real-Time Judging** - Queue-based code execution with Docker isolation
- **Contest Management** - Create, schedule, and manage programming contests
- **Auto-Grading** - Automated test case evaluation with detailed feedback
- **User Management** - Authentication, roles (Admin/User), and profiles
- **Leaderboards** - Real-time rankings and scoring

### 🔧 Technical Features

- **Docker Isolation** - Secure code execution in isolated containers
- **Redis Queue** - Asynchronous job processing for scalability
- **Session Management** - Redis-backed sessions for high performance
- **MySQL Database** - Well-structured schema with optimized queries
- **Responsive UI** - EJS templates with modern design
- **Flash Messages** - User-friendly notifications

### 🆕 V2 Features (Latest Update)

- **Email Verification** - Secure user registration with email confirmation
- **Contest Types** - Public (open to all) and Private (invitation-only) contests
- **Participant Management** - Add/remove users from private contests
- **Email Notifications** - Bulk email announcements for contests
- **Multi-Admin Support** - Track content ownership by admin
- **Admin Checker** - Test problems before publishing
- **User Management** - Comprehensive user list and management
- **Enhanced Security** - File upload limits, email validation

> 📚 **V2 Documentation**: See `data/docs/CHANGELOG_V2.md`, `data/docs/SETUP_V2.md`, and `data/docs/ADMIN_GUIDE.md` for complete details.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- 4GB+ RAM
- 10GB+ disk space

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mycontest.git
cd mycontest
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Build checker images**

```bash
npm run checker:build
```

4. **Start all services**

```bash
npm run docker:up
```

5. **Access the application**

- Web App: http://localhost:3000
- Adminer: http://localhost:8080
- Default admin: `admin` / `admin:SecretKey123!`

## 📦 Project Structure

```
mycontest/
├── modules/              # Application modules
│   ├── admin/           # Admin panel (contests, tasks, news)
│   ├── auth/            # Authentication & authorization
│   ├── contest/         # Contest operations
│   └── error/           # Error handling
├── checker/             # Code execution system
│   ├── worker.js        # Queue worker
│   ├── docker/          # Docker images for languages
│   └── README.md        # Checker documentation
├── shared/              # Shared utilities
│   ├── mysql.js         # Database wrapper
│   ├── redis.js         # Queue management
│   └── helpers.js       # Helper functions
├── data/                # Application data
│   ├── setup/           # Database initialization
│   ├── checker/         # Test cases and temp files
│   └── docs/            # Documentation
├── public/              # Static assets
├── views/               # EJS templates
├── app.js               # Application entry point
└── docker-compose.yml   # Service orchestration
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start app with nodemon
npm run worker:dev       # Start worker with nodemon

# Production
npm start                # Start application
npm run worker           # Start checker worker

# Docker
npm run docker:build     # Build all containers
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View all logs
npm run docker:restart   # Restart services

# Checker
npm run checker:build    # Build checker images

# Logs
npm run logs:app         # Application logs
npm run logs:worker      # Checker worker logs
npm run logs:redis       # Redis logs

# Database
npm run db:backup        # Backup database
npm run db:restore       # Restore from backup
```

## 🗄️ Database Schema

### Main Tables

#### **tasks** - Programming Problems

- `task_id`, `name`, `question_content`, `input_content`, `output_content`
- `time_ms`, `memory_kb`, `test_public`, `test_all`
- Clear, self-documenting column names

#### **languages** - Supported Programming Languages

- `language_id`, `language_name`, `editor_mode`
- `compile_script`, `run_script`, `file_extension`, `docker_image`
- Multi-language support configuration

#### **attempts** - Code Submissions

- `attempt_id`, `task_id`, `user_id`, `contest_id`
- `status_message`, `status_code`, `error_details`
- `time_ms`, `memory_kb`, `language_used`
- Complete submission tracking

#### **contests** - Programming Contests

- `contest_id`, `name`, `content`, `start_date`, `end_date`
- Schedule and manage competitions

#### **users** - User Accounts

- `user_id`, `username`, `full_name`, `email`
- `role` (admin/user), authentication

See [`data/docs/DATABASE_FINAL.md`](data/docs/DATABASE_FINAL.md) for complete schema documentation.

## 🐳 Docker Services

The application runs in Docker containers for easy deployment:

| Service | Container         | Port | Purpose                         |
| ------- | ----------------- | ---- | ------------------------------- |
| App     | mycontest_app     | 3000 | Main web application            |
| Checker | mycontest_checker | -    | Queue worker for code execution |
| MySQL   | mycontest_mysql   | 3306 | Database                        |
| Redis   | mycontest_redis   | 6379 | Session store & queue           |
| Adminer | mycontest_adminer | 8080 | Database admin UI               |

### Checker Images

- `checker-cpp` - C/C++ execution
- `checker-java` - Java execution
- `checker-python` - Python execution
- `checker-nodejs` - Node.js execution
- `checker-csharp` - C# execution
- `checker-go` - Go execution

## 📊 Status Codes

Code execution results are tracked with numeric codes:

| Code | Status                | Description                  |
| ---- | --------------------- | ---------------------------- |
| 0    | Running               | Currently being processed ⏳ |
| 1    | Accepted              | All tests passed ✅          |
| 2    | Wrong Answer          | Test case failed ❌          |
| 3    | Time Limit Exceeded   | Execution too slow ⏱️        |
| 4    | Presentation Error    | Output format issue 📝       |
| 5    | Compilation Error     | Code didn't compile 🔧       |
| 6    | Memory Limit Exceeded | Used too much memory 💾      |
| 7    | Runtime Error         | Crashed during execution 💥  |
| 10   | Server Error          | Internal server issue ⚠️     |

## 🔐 Environment Variables

Configure in `.env` file:

```env
# Server
PORT=3000
DOMAIN=localhost:3000

# Database
MYSQL_HOST=mysql
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=my_contest

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Security
SECRET=your-secret-key-here

# File Upload
LIMIT=50mb
```

## 📖 Documentation

Comprehensive documentation available:

### Core Documentation (`data/docs/`)

- **[STARTUP_GUIDE.md](data/docs/STARTUP_GUIDE.md)** - Complete setup instructions
- **[DATABASE_FINAL.md](data/docs/DATABASE_FINAL.md)** - Database schema documentation
- **[LANGUAGES_MIGRATION.md](data/docs/LANGUAGES_MIGRATION.md)** - Language table details
- **[OPTIMIZATION_COMPLETE.md](data/docs/OPTIMIZATION_COMPLETE.md)** - All improvements made
- **[checker/README.md](checker/README.md)** - Checker system documentation

### V2 Documentation (`data/docs/`)

- **[CHANGELOG_V2.md](data/docs/CHANGELOG_V2.md)** - Complete V2 feature documentation
- **[SETUP_V2.md](data/docs/SETUP_V2.md)** - V2 setup and migration guide
- **[ADMIN_GUIDE.md](data/docs/ADMIN_GUIDE.md)** - Admin panel quick reference
- **[ARCHITECTURE.md](data/docs/ARCHITECTURE.md)** - System architecture diagrams
- **[TODO.md](data/docs/TODO.md)** - Future enhancements roadmap
- **[SUMMARY.md](data/docs/SUMMARY.md)** - V2 implementation summary
- **[DEPLOYMENT_CHECKLIST.md](data/docs/DEPLOYMENT_CHECKLIST.md)** - Deployment guide
- **[FINAL_UPDATE.md](data/docs/FINAL_UPDATE.md)** - Final implementation notes

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards:
   - Variables: `snake_case`
   - Functions: `fnCamelCase`
   - Files: `kebab-case.js`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Find process
netstat -ano | findstr :3000
# Kill process (Windows)
taskkill /PID <pid> /F
```

**Database Connection Failed**

```bash
# Check MySQL is running
docker ps | grep mysql
# Test connection
docker exec -it mycontest_mysql mysql -uroot -proot
```

**Checker Not Processing**

```bash
# Check worker logs
docker-compose logs checker-worker
# Verify queue
docker exec -it mycontest_redis redis-cli -a redis123 LLEN checker_queue
```

See [STARTUP_GUIDE.md](data/docs/STARTUP_GUIDE.md) for detailed troubleshooting.

## 📈 Performance

- **Queue-based processing** - Non-blocking submission handling
- **Docker isolation** - Secure, parallel code execution
- **Redis caching** - Fast session and queue management
- **Optimized queries** - Indexed database tables
- **Multi-stage builds** - Small, efficient Docker images

## 🔒 Security

- ✅ Non-root Docker user for code execution
- ✅ Resource limits (CPU, memory, time)
- ✅ Network isolation for untrusted code
- ✅ Input validation and sanitization
- ✅ Secure password hashing
- ✅ Session security with Redis
- ✅ No shell injection vulnerabilities

## 🌟 Roadmap

- [ ] Add more programming languages (Rust, Kotlin, Swift)
- [ ] Implement WebSocket for real-time updates
- [ ] Add code editor with syntax highlighting
- [ ] Implement rating system (Elo/Codeforces-style)
- [ ] Add practice mode
- [ ] Implement team contests
- [ ] Add editorial/tutorial support
- [ ] Mobile app support

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- **Utkir Khujaev** - Initial work

## 🙏 Acknowledgments

- Express.js for the web framework
- Docker for containerization
- Redis for queue management
- MySQL for database
- All contributors and testers

## 📧 Support

For support, email balkibumen@gmail.com or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for competitive programming community**

⭐ Star this repo if you find it helpful!

</div>
