const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const dotenv = require("dotenv");

const project_root = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(project_root, ".env") });

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backups_root = path.join(project_root, "data", "backups");
const backup_dir = path.join(backups_root, timestamp);
const database = process.env.DB_NAME || "mycontest";
const dump_path = path.join(backup_dir, `mysql-${database}-${timestamp}.sql`);
const storage_source = path.join(project_root, "storage");
const storage_target = path.join(backup_dir, "storage");

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const commandAvailable = (command, args = []) => {
  const result = spawnSync(command, args, { env: process.env });
  return result.status === 0;
};

const runDump = (command, args) =>
  new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (process.env.DB_PASSWORD) {
      env.MYSQL_PWD = process.env.DB_PASSWORD;
    }

    const child = spawn(command, args, {
      env,
      cwd: project_root,
      stdio: ["ignore", "pipe", "inherit"],
    });

    const writeStream = fs.createWriteStream(dump_path);
    child.stdout.pipe(writeStream);

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      writeStream.close();
      if (code === 0) {
        return resolve();
      }
      return reject(new Error(`${command} exited with code ${code}`));
    });
  });

const dumpDatabase = async () => {
  ensureDir(backup_dir);

  const commonArgs = [
    "-h",
    process.env.DB_HOST || "127.0.0.1",
    "-P",
    String(toInt(process.env.DB_PORT, 3306)),
    "-u",
    process.env.DB_USER || "root",
    "--skip-lock-tables",
    database,
  ];

  if (commandAvailable("mysqldump", ["--version"])) {
    console.log("Using local mysqldump to create backup...");
    await runDump("mysqldump", commonArgs);
  } else {
    console.log("Local mysqldump not found, using docker compose exec mysql ...");
    const dockerArgs = ["compose", "exec", "-T", "mysql", "mysqldump", ...commonArgs];
    await runDump("docker", dockerArgs);
  }
};

const copyStorage = () => {
  if (fs.existsSync(storage_source)) {
    fs.cpSync(storage_source, storage_target, { recursive: true });
    console.log(`Storage copied to ${storage_target}`);
  } else {
    console.log("Storage directory not found, skipping file copy.");
  }
};

const main = async () => {
  try {
    await dumpDatabase();
    copyStorage();
    console.log(`Backup written to ${backup_dir}`);
  } catch (err) {
    console.error(`Backup failed: ${err.message}`);
    process.exit(1);
  }
};

main();
