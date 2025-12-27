/**
 * Run a SQL file against the configured MySQL instance.
 * Usage: node database/scripts/run-sql.js database/migrations/init.sql
 */

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const projectRoot = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(projectRoot, ".env") });

const sqlFileArg = process.argv[2];
if (!sqlFileArg) {
  console.error("Usage: node database/scripts/run-sql.js <path-to-sql>");
  process.exit(1);
}

const sqlPath = path.resolve(projectRoot, sqlFileArg);
if (!fs.existsSync(sqlPath)) {
  console.error(`SQL file not found: ${sqlPath}`);
  process.exit(1);
}

const host = process.env.DB_HOST || "127.0.0.1";
const port = process.env.DB_PORT || "3306";
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "mycontest";

const mysqlArgs = ["-h", host, "-P", String(port), "-u", user, database];
const env = { ...process.env };
if (password) {
  env.MYSQL_PWD = password;
}

console.log(`Running ${path.relative(projectRoot, sqlPath)} against ${host}:${port}/${database} ...`);

const mysqlAvailable = () => {
  const probe = spawnSync("mysql", ["--version"], { env });
  return probe.status === 0;
};

if (mysqlAvailable()) {
  const child = spawn("mysql", mysqlArgs, {
    stdio: ["pipe", "inherit", "inherit"],
    env,
  });
  fs.createReadStream(sqlPath).pipe(child.stdin);
  child.on("close", (code) => process.exit(code));
} else {
  console.log("Local mysql client not found, trying docker compose exec mysql ...");
  const dockerArgs = ["compose", "exec", "-T", "mysql", "mysql", ...mysqlArgs];
  const dockerChild = spawn("docker", dockerArgs, {
    stdio: ["pipe", "inherit", "inherit"],
    env,
    cwd: projectRoot,
  });
  fs.createReadStream(sqlPath).pipe(dockerChild.stdin);
  dockerChild.on("close", (code) => process.exit(code));
}
