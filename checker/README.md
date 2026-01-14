# Code Checker Worker

Queue-based code execution checker with Docker isolation and multi-language support.

## Features

- ✅ Queue-based processing (Redis)
- ✅ Multi-language support (C++, Python, Java, Node.js, C#, Go)
- ✅ Docker isolation for security
- ✅ Resource limits (CPU, memory, time)
- ✅ Automatic cleanup
- ✅ Error handling and logging

## Architecture

```
Contest Submission → Redis Queue → Checker Worker → Docker Container → Results → Database
```

## Supported Languages

| Language | Compiler/Interpreter | Image Name     |
| -------- | -------------------- | -------------- |
| C++      | g++ 11.x             | checker-cpp    |
| Python   | Python 3.10+         | checker-python |
| Java     | OpenJDK 11+          | checker-java   |
| Node.js  | Node 20.x            | checker-nodejs |
| C#       | Mono 6.x             | checker-csharp |
| Go       | Go 1.21+             | checker-go     |

## Setup

### 1. Build Docker Images

```bash
cd docker
docker-compose build
```

Or build individually:

```bash
docker build -t checker-cpp --build-arg SCRIPT_NAME=run_test_1.sh .
```

### 2. Start Checker Worker

```bash
# From checker directory
npm start

# Or with nodemon for development
npm run dev
```

### 3. Verify Queue Connection

The worker will connect to Redis using environment variables:

- `REDIS_HOST` (default: 127.0.0.1)
- `REDIS_PORT` (default: 6379)
- `REDIS_PASSWORD` (required)

## Environment Variables

```env
# Database
MYSQL_HOST=localhost
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=my_contest

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
```

## Queue Processing

### Add to Queue (from application)

```javascript
const { fnAddToQueue } = require("./checker/worker");

await fnAddToQueue(attempt_id, contest_id, task_id, lang_id, code);
```

### Status Updates

The worker updates attempt status in real-time:

| Status | Description              |
| ------ | ------------------------ |
| 0      | Processing test #N       |
| 1      | Accepted ✅              |
| 2      | Wrong Answer ❌          |
| 3      | Time Limit Exceeded ⏱️   |
| 4      | Presentation Error 📝    |
| 5      | Compilation Error 🔧     |
| 6      | Memory Limit Exceeded 💾 |
| 7      | Runtime Error 💥         |
| 10     | Server Error ⚠️          |

## File Structure

```
checker/
├── worker.js              # Main queue worker
├── package.json           # Dependencies and scripts
├── test.js               # Manual testing
├── docker/
│   ├── Dockerfile        # Multi-stage optimized image
│   ├── docker-compose.yml # Build all language images
│   └── run_test_1.sh     # Test execution script
└── README.md             # This file
```

## Resource Limits

Each Docker container runs with:

- **CPU**: 2 cores
- **Memory**: 2GB
- **Swap**: 2GB
- **Network**: None (isolated)

Additional per-task limits from database:

- **Time**: task.time (seconds)
- **Memory**: task.memory (MB)

## Testing

```bash
# Run test script
npm test

# Or manually
node test.js
```

## Monitoring

Watch queue status:

```bash
# From Redis CLI
redis-cli -a redis123
LLEN checker_queue
```

Worker logs show:

- Queue length
- Processing status
- Docker output
- Error messages

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start worker
pm2 start worker.js --name checker-worker

# Monitor
pm2 monit

# View logs
pm2 logs checker-worker

# Restart
pm2 restart checker-worker
```

### Using Docker

```bash
# Run worker in Docker
docker run -d \
  --name checker-worker \
  --env-file ../.env \
  --network mycontest_default \
  -v $(pwd)/../data:/app/data \
  node:20-alpine \
  node /app/checker/worker.js
```

### Using systemd

Create `/etc/systemd/system/checker-worker.service`:

```ini
[Unit]
Description=MyContest Checker Worker
After=network.target redis.service mysql.service

[Service]
Type=simple
User=mycontest
WorkingDirectory=/path/to/mycontest/checker
ExecStart=/usr/bin/node worker.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable checker-worker
sudo systemctl start checker-worker
sudo systemctl status checker-worker
```

## Troubleshooting

### Worker not starting

1. Check Redis connection
2. Verify environment variables
3. Check database connectivity

### Jobs stuck in queue

1. Check worker logs
2. Verify Docker daemon is running
3. Check disk space for temp files

### Docker errors

1. Rebuild images: `cd docker && docker-compose build`
2. Check Docker permissions
3. Verify image exists: `docker images | grep checker`

### Memory issues

1. Reduce number of parallel workers
2. Increase Docker memory limit
3. Clear old temp files

## Development

### Adding New Language

1. Update `Dockerfile` to install compiler/interpreter
2. Update `run_test_1.sh` with compilation/execution logic
3. Add language to database `lang` table
4. Rebuild Docker image
5. Test with sample code

### Debugging

Enable verbose logging:

```javascript
// In worker.js
const DEBUG = true;
```

Run single test:

```javascript
const { fnProcessAttempt } = require("./worker");
await fnProcessAttempt(attempt_id, contest_id, task_id, lang_id, code);
```

## Performance

- Average processing time: 1-5 seconds per test
- Queue throughput: 10-50 submissions/minute
- Memory usage: ~100MB per worker
- Disk usage: ~50MB per temp directory

## Security

- ✅ Non-root user in Docker
- ✅ Resource limits enforced
- ✅ Network isolation
- ✅ Temporary file cleanup
- ✅ Input validation
- ✅ No shell injection vulnerabilities

## License

Part of MyContest platform.
