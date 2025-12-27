const mysql = require("mysql2/promise");
const { toInt } = require("./utils");

const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: toInt(process.env.DB_PORT, 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mycontest",
  connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

const pool = mysql.createPool(config);

pool
  .getConnection()
  .then((connection) => {
    console.log("mysql connected");
    connection.release();
  })
  .catch((err) => {
    console.error("mysql connect failed:", err.message);
    process.exit(1);
  });

const dbQueryOne = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return Array.isArray(rows) ? rows[0] || null : rows;
};

const dbQueryMany = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const dbTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  dbQueryOne,
  dbQueryMany,
  dbTransaction,
};
