require("dotenv").config();
const { dbQueryMany } = require("../shared/mysql");

async function createEmailLogsTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS email_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        created_dt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await dbQueryMany(query);
    console.log("email_logs table created successfully.");
  } catch (err) {
    console.error("Error creating email_logs table:", err);
  } finally {
    process.exit();
  }
}

createEmailLogsTable();
