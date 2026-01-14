# MyContest - Quick Start Guide

Complete setup guide for the MyContest platform with optimized checker system.

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- 4GB+ RAM
- 10GB+ disk space

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd d:\dss\mycontest
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file:

```env
PORT=3000
MYSQL_HOST=mysql
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=my_contest
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123
SECRET=your-secret-key-here
LIMIT=50mb
DOMAIN=localhost:3000
```

### 3. Build Checker Docker Images

```bash
cd checker/docker
docker-compose build
cd ../..
```

This builds images for:

- C/C++ (gcc/g++)
- Python 3
- Java (OpenJDK)
- Node.js
- C# (Mono)
- Go

### 4. Start All Services

```bash
docker-compose up -d --build
```

This starts:

- ✅ Web Application (port 3000)
- ✅ MySQL Database (port 3306)
- ✅ Redis Queue (port 6379)
- ✅ Adminer (port 8080)
- ✅ Checker Worker (background)

### 5. Verify Services

```bash
# Check running containers
docker ps

# View logs
docker-compose logs -f app
docker-compose logs -f checker-worker

# Check queue status
docker exec -it mycontest_redis redis-cli -a redis123 LLEN checker_queue
```

## 🌐 Access Points

- **Application**: http://localhost:3000
- **Adminer**: http://localhost:8080
  - System: MySQL
  - Server: mysql
  - Username: root
  - Password: root
  - Database: my_contest

## 📁 Project Structure

```
mycontest/
├── app.js                    # Main application entry
├── package.json              # Dependencies
├── Dockerfile                # App container
├── docker-compose.yml        # All services
├── .env                      # Configuration
│
├── modules/                  # Application modules
│   ├── admin/               # Admin panel
│   │   ├── admin.controller.js
│   │   └── admin.router.js
│   ├── auth/                # Authentication
│   │   ├── auth.controller.js
│   │   ├── auth.router.js
│   │   ├── auth.middleware.js
│   │   └── auth.schema.js
│   ├── contest/             # Contest management
│   │   ├── contest.controller.js
│   │   └── contest.router.js
│   └── error/               # Error handling
│       └── error.controller.js
│
├── shared/                   # Shared utilities
│   ├── mysql.js             # Database wrapper
│   ├── redis.js             # Queue management
│   └── helpers.js           # Helper functions
│
├── checker/                  # Code checker
│   ├── worker.js            # Queue worker
│   ├── package.json         # Worker dependencies
│   ├── README.md            # Checker documentation
│   └── docker/              # Checker images
│       ├── Dockerfile       # Optimized image
│       ├── docker-compose.yml
│       └── run_test_1.sh    # Test runner
│
├── data/                     # Application data
│   ├── setup/               # Database init
│   │   ├── init.sql         # Tables
│   │   ├── seed.sql         # Sample data
│   │   └── view.sql         # Views
│   ├── checker/
│   │   ├── testcase/        # Test cases
│   │   └── temp/            # Execution temp
│   └── mysql/               # MySQL data (gitignored)
│
├── public/                   # Static assets
│   ├── javascript/          # Client JS
│   ├── css/                 # Stylesheets
│   └── images/              # Images
│
└── views/                    # EJS templates
    ├── admin/               # Admin views
    ├── pages/               # Public pages
    └── partials/            # Reusable components
```

## 🔧 Development Workflow

### Start Development Server

```bash
# Application
npm run dev

# Checker Worker (separate terminal)
cd checker
npm run dev
```

### Build Production

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Database Management

```bash
# Access MySQL CLI
docker exec -it mycontest_mysql mysql -uroot -proot my_contest

# Backup database
docker exec mycontest_mysql mysqldump -uroot -proot my_contest > backup.sql

# Restore database
docker exec -i mycontest_mysql mysql -uroot -proot my_contest < backup.sql

# Reset database
docker exec -i mycontest_mysql mysql -uroot -proot my_contest < data/setup/init.sql
docker exec -i mycontest_mysql mysql -uroot -proot my_contest < data/setup/view.sql
docker exec -i mycontest_mysql mysql -uroot -proot my_contest < data/setup/seed.sql
```

### Redis Queue Management

```bash
# Connect to Redis
docker exec -it mycontest_redis redis-cli -a redis123

# Check queue
LLEN checker_queue

# View queue items
LRANGE checker_queue 0 -1

# Clear queue
DEL checker_queue

# Monitor in real-time
MONITOR
```

## 🧪 Testing

### Test Code Submission

1. Sign up at http://localhost:3000/sign-up
2. Navigate to a contest
3. Submit code for a problem
4. Watch checker worker logs:
   ```bash
   docker-compose logs -f checker-worker
   ```

### Manual Checker Test

```bash
cd checker
node test.js
```

## 🔍 Monitoring

### Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f checker-worker
docker-compose logs -f mysql
docker-compose logs -f redis
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Network
docker network inspect mycontest_contest_net
```

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <pid> /F
```

### Database Connection Failed

1. Check MySQL is running: `docker ps | grep mysql`
2. Verify credentials in `.env`
3. Test connection: `docker exec -it mycontest_mysql mysql -uroot -proot`

### Redis Connection Failed

1. Check Redis is running: `docker ps | grep redis`
2. Test connection: `docker exec -it mycontest_redis redis-cli -a redis123 PING`

### Checker Not Processing

1. Check worker logs: `docker-compose logs checker-worker`
2. Verify queue: `redis-cli -a redis123 LLEN checker_queue`
3. Check Docker socket: `docker ps`
4. Rebuild worker: `docker-compose up -d --build checker-worker`

### Out of Disk Space

```bash
# Clean Docker
docker system prune -a --volumes

# Clean temp files
rm -rf data/checker/temp/*
```

## 🚨 Common Issues

### Issue: "Cannot find module"

**Solution**: Run `npm install` in root and checker directories

### Issue: "Permission denied" (Docker)

**Solution**:

- Windows: Run Docker Desktop as Administrator
- Linux: Add user to docker group: `sudo usermod -aG docker $USER`

### Issue: Slow Checker Performance

**Solution**:

1. Increase Docker resources (Settings → Resources)
2. Build checker images locally
3. Use SSD for data volumes

### Issue: Session Lost After Restart

**Solution**: Redis data is ephemeral, sessions will reset on container restart

## 📊 Performance Tuning

### Database Optimization

```sql
-- Add indexes (if not exists)
CREATE INDEX idx_attempts_contest ON attempts(contest_id);
CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_attempts_task ON attempts(task_id);
```

### Redis Optimization

Edit `docker-compose.yml`:

```yaml
redis:
  command: redis-server --requirepass redis123 --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### Application Scaling

```bash
# Run multiple app instances
docker-compose up -d --scale app=3

# Use nginx for load balancing
```

## 📚 Additional Resources

- [Checker README](./checker/README.md) - Detailed checker documentation
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Code improvements
- [Docker Docs](https://docs.docker.com/)
- [Express.js](https://expressjs.com/)
- [Redis](https://redis.io/)

## 🔐 Security Notes

- Change default passwords in production
- Use HTTPS with proper SSL certificates
- Enable firewall rules
- Regular security updates
- Backup database regularly
- Monitor logs for suspicious activity

## 📝 Next Steps

1. ✅ Setup complete - application running
2. ✅ Checker worker processing submissions
3. 📋 Add test cases to `data/checker/testcase/`
4. 👥 Create admin user and contests
5. 🧪 Test code submissions
6. 🚀 Deploy to production server

## 💬 Support

For issues or questions:

1. Check logs: `docker-compose logs`
2. Review troubleshooting section
3. Check Redis queue status
4. Verify Docker images built correctly

---

**Status Indicators:**

- 🟢 Running correctly
- 🟡 Warning/degraded
- 🔴 Error/not running

Check status: `docker-compose ps`
