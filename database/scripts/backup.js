/**
 * Backup Script
 * Creates a full backup (database + files/code) using the dockerized MySQL instance.
 *
 * Options:
 *   --database-only / --db-only : only dump the database (skip files/code)
 *   --keep-sql                  : keep the raw .sql file alongside the zip
 */

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const dotenv = require("dotenv");

const project_root = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(project_root, ".env") });

const now = new Date();
const timestamp = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("") + "_" + [now.getHours(), now.getMinutes(), now.getSeconds()].map((v) => String(v).padStart(2, "0")).join("");

const backup_dir = path.join(project_root, "data", "backups");
const backup_name = `mycontest_backup_${timestamp}`;
const db_backup_path = path.join(backup_dir, `${backup_name}_db.sql`);
const db_only = process.argv.includes("--database-only") || process.argv.includes("--db-only");
const keep_sql = process.argv.includes("--keep-sql");

const mysql_user = process.env.MYSQL_USERNAME || "root";
const mysql_password = process.env.MYSQL_PASSWORD || "";
const mysql_database = process.env.MYSQL_DATABASE || "mycontest";

const ensureBackupDir = () => {
  if (!fs.existsSync(backup_dir)) {
    fs.mkdirSync(backup_dir, { recursive: true });
  }
};

const ensureMysqlContainer = () => {
  const docker_ps = spawnSync("docker", ["compose", "ps", "-q", "mysql"], { encoding: "utf-8" });
  if (docker_ps.status !== 0 || !docker_ps.stdout.trim()) {
    throw new Error("MySQL container is not running. Start it with: docker compose up -d mysql");
  }
};

const backupDatabase = () =>
  new Promise((resolve, reject) => {
    console.log("1) Dumping MySQL database from the mysql container...");
    const mysqldump_cmd = `MYSQL_PWD="${mysql_password}" mysqldump -u"${mysql_user}" -h"127.0.0.1" ${mysql_database}`;
    const dump = spawn("docker", ["compose", "exec", "-T", "mysql", "sh", "-c", mysqldump_cmd], {
      stdio: ["ignore", "pipe", "inherit"],
    });

    const out_stream = fs.createWriteStream(db_backup_path);
    dump.stdout.pipe(out_stream);

    dump.on("error", (err) => reject(new Error(`Database backup failed: ${err.message}`)));
    dump.on("exit", (code) => {
      out_stream.end();
      if (code === 0) {
        console.log(`   Database dump saved: ${db_backup_path}`);
        resolve();
      } else {
        reject(new Error(`mysqldump exited with code ${code}`));
      }
    });
  });

const buildZip = () => {
  const zip = new AdmZip();

  // Always include the database dump
  zip.addLocalFile(db_backup_path, "database");

  if (!db_only) {
    const maybeAddFolder = (folder_path, zip_path) => {
      if (fs.existsSync(folder_path)) {
        zip.addLocalFolder(folder_path, zip_path);
      }
    };

    maybeAddFolder(path.join(project_root, "data", "storage"), "data/storage");
    maybeAddFolder(path.join(project_root, "session"), "session");
    maybeAddFolder(path.join(project_root, "src"), "src");
    maybeAddFolder(path.join(project_root, "database", "migrations"), "database/migrations");
    maybeAddFolder(path.join(project_root, "docs"), "docs");

    ["docker-compose.yml", "Dockerfile", "package.json", "package-lock.json", ".env.example", "README.md"].forEach((file) => {
      const file_path = path.join(project_root, file);
      if (fs.existsSync(file_path)) {
        zip.addLocalFile(file_path, "project");
      }
    });
  }

  const zip_path = path.join(backup_dir, `${backup_name}.zip`);
  zip.writeZip(zip_path);
  console.log(`2) Files zipped to: ${zip_path}`);
  return zip_path;
};

const cleanupOldBackups = () => {
  const backup_list = fs
    .readdirSync(backup_dir)
    .filter((file) => file.endsWith(".zip"))
    .map((file) => ({
      name: file,
      path: path.join(backup_dir, file),
      time: fs.statSync(path.join(backup_dir, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (backup_list.length > 10) {
    console.log("Cleaning up old backups (keeping last 10)...");
    backup_list.slice(10).forEach((backup) => {
      fs.unlinkSync(backup.path);
      console.log(`   Deleted: ${backup.name}`);
    });
  }
};

(async () => {
  try {
    ensureBackupDir();
    ensureMysqlContainer();
    await backupDatabase();
    const zip_path = buildZip();

    if (!keep_sql && fs.existsSync(db_backup_path)) {
      fs.unlinkSync(db_backup_path);
    }

    cleanupOldBackups();

    const size_mb = (fs.statSync(zip_path).size / 1024 / 1024).toFixed(2);
    console.log("\nBackup completed successfully.");
    console.log(`Saved: ${zip_path} (${size_mb} MB)`);
    if (db_only) {
      console.log("Mode: database only");
    }
  } catch (error) {
    console.error("Backup failed:", error.message);
    process.exit(1);
  }
})();
