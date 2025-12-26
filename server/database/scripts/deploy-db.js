const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const { toInt } = require("../../utils/utils");

const project_root = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(project_root, ".env") });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// SQL faylni o'qib, bazada bajarish funksiyasi
const runSqlFile = async (connection, file_path) => {
  const full_path = path.join(project_root, file_path);

  if (!fs.existsSync(full_path)) {
    throw new Error(`SQL fayl topilmadi: ${full_path}`);
  }

  const sql_content = fs.readFileSync(full_path, "utf8");

  // Bir nechta SQL so'rovlarni ajratib olish (agar ";" bilan ajratilgan bo'lsa)
  // Eslatma: Murakkab trigger/protseduralar bo'lsa, ehtiyot bo'lish kerak
  const queries = sql_content.split(";").filter((query) => query.trim() !== "");

  for (const query of queries) {
    await connection.query(query);
  }

  console.log(`Muvaffaqiyatli bajarildi: ${file_path}`);
};

const waitForDatabase = async () => {
  const max_retries = 10;
  const db_config = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME, // Bazani tanlash ixtiyoriy
    multipleStatements: true, // Bir nechta so'rovlarni birdan yuborish uchun
  };

  for (let attempt = 1; attempt <= max_retries; attempt += 1) {
    try {
      const connection = await mysql.createConnection(db_config);
      await connection.ping();
      console.log(`Baza bilan aloqa o'rnatildi (urinish ${attempt}/${max_retries})`);
      return connection;
    } catch (err) {
      console.log(`Baza hali tayyor emas (urinish ${attempt}/${max_retries}): ${err.message}`);
      if (attempt === max_retries) throw err;
      await wait(2000);
    }
  }
};

const main = async () => {
  let connection_obj;
  try {
    console.log("Ma'lumotlar bazasiga ulanish kutilmoqda...");
    connection_obj = await waitForDatabase();

    // Migratsiyalarni ketma-ket ishga tushirish
    await runSqlFile(connection_obj, "database/migrations/init.sql");
    await runSqlFile(connection_obj, "database/migrations/seed.sql");

    console.log("Baza muvaffaqiyatli tayyorlandi va ma'lumotlar kiritildi.");
  } catch (err) {
    console.error("Xatolik yuz berdi:", err.message);
    process.exit(1);
  } finally {
    if (connection_obj) {
      await connection_obj.end();
    }
  }
};

main();
