# mycontest.dev[uz]

### Open-Source Contest Platform

MyContest.uz is an open-source platform designed for hosting and managing programming contests. It provides essential tools for running competitions, evaluating solutions, and ranking participants.

## Features

- **Multi-Language Support**: Python, JavaScript, C++, Java, Go
- **Code Execution Engine**: Secure sandboxed execution with time/memory limits
- **Admin Panel**: Problem creation, language management, user administration
- **Real-time Judging**: Automated test case evaluation with detailed feedback
- **Contest System**: Create and manage programming competitions
- **User Submissions**: Track progress and view submission history

## Quick Start with Docker Compose

1. Clone the repository:

   ```sh
   git clone https://github.com/mycontest/mycontest
   cd mycontest
   ```

2. Set up environment variables:

   ```sh
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `SECRET` - Session secret key
   - `MYSQL_PASSWORD` - MySQL root password
   - `MYSQL_DATABASE` - Database name (default: my_contest)
   - `PORT` - Application port (default: 7001)
   - `DOMAIN` - Your domain URL

3. Start with Docker Compose:

   ```sh
   docker-compose up -d
   ```

   This will automatically:
   - Create and configure MySQL database
   - Initialize database schema with seed data
   - Start the web application

4. Access the platform:

   - Web Interface: `http://localhost:7001`
   - Default Admin: `admin` / `admin123`

5. View logs:

   ```sh
   docker-compose logs -f web
   ```

## Manual Installation (Without Docker)

### Required Applications

- **Node.js** (v18+) for the backend server
- **MySQL** (8.0+) as the database system
- **Python 3** for Python code execution

### Setup Steps

1. Install dependencies:

   ```sh
   cd server
   npm install
   ```

2. Initialize the MySQL database:

   ```sh
   mysql -u root -p < data/database_schema.sql
   ```

3. Configure environment variables (`.env`):

   ```sh
   MYSQL_HOST=localhost
   MYSQL_DATABASE=my_contest
   MYSQL_USERNAME=root
   MYSQL_PASSWORD=your_password
   PORT=7001
   SECRET=your_secret_key
   DOMAIN=http://localhost:7001
   ```

4. Start the server:

   ```sh
   cd server
   npm start
   ```

### Additional Setup

- **Architecture Diagram:** The platform architecture is outlined below:

  ![Architecture Diagram](data/architecture_diagram.jpg)

- **Nginx Configuration:** The `.nginx` directory in `data/` contains configuration files that can help set up a reverse proxy for deployment.

### Demo

Check out the live demo of mycontest.dev: [Demo Link](https://mycontest.dev)

### Installation Guide (Video)

For a step-by-step installation guide, watch our [YouTube installation video]([https://www.youtube.com/watch?v=your_video_id](http://youtube.com/mensenvau)).

### Telegram Channel

Stay updated by joining our [Telegram channel](https://t.me/mensenvau).
