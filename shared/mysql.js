const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

async function dbQueryMany(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function dbQueryOne(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

module.exports = { dbQueryMany, dbQueryOne };
