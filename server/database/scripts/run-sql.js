/**
 * Run a SQL file inside the MySQL docker service.
 * Usage: node database/scripts/run-sql.js <path-to-sql>
 */

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const project_root = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(project_root, ".env") });

const sql_file_arg = process.argv[2];

if (!sql_file_arg) {
  console.error("Usage: node database/scripts/run-sql.js <path-to-sql>");
  process.exit(1);
}

const sql_path = path.resolve(project_root, sql_file_arg);

if (!fs.existsSync(sql_path)) {
  console.error(`SQL file not found: ${sql_path}`);
  process.exit(1);
}

const docker_ps = spawnSync("docker", ["compose", "ps", "-q", "mysql"], { encoding: "utf-8" });

if (docker_ps.status !== 0 || !docker_ps.stdout.trim()) {
  console.error("MySQL container is not running. Start it with: docker compose up -d mysql");
  process.exit(1);
}

const mysql_user = process.env.MYSQL_USERNAME || "root";
const mysql_password = process.env.MYSQL_PASSWORD || "";

// Connect from inside the mysql container, so host is always localhost
const mysql_command = `MYSQL_PWD="${mysql_password}" mysql -u"${mysql_user}" -h"127.0.0.1"`;

console.log(`Running ${path.relative(project_root, sql_path)} inside the mysql container...`);

const child = spawn("docker", ["compose", "exec", "-T", "mysql", "sh", "-c", mysql_command], {
  stdio: ["pipe", "inherit", "inherit"],
});

child.on("error", (error) => {
  console.error("Failed to run docker compose exec:", error.message);
  process.exit(1);
});

fs.createReadStream(sql_path).pipe(child.stdin);

child.on("exit", (code) => {
  if (code === 0) {
    console.log("SQL executed successfully.");
  }
  process.exit(code);
});
