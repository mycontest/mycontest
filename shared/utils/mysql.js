const mysql = require("mysql2/promise");

let pool = null;

const initDatabase = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      dateStrings: true,
    });
  }
  return pool;
};

const dbQueryOne = async (query, params = []) => {
  try {
    const connection = initDatabase();
    const [rows] = await connection.query(query, params);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Database query error (dbQueryOne):", error.message);
    throw error;
  }
};

const dbQueryMany = async (query, params = []) => {
  try {
    const connection = initDatabase();
    const [rows] = await connection.query(query, params);
    return rows;
  } catch (error) {
    console.error("Database query error (dbQueryMany):", error.message);
    throw error;
  }
};

module.exports = {
  initDatabase,
  dbQueryOne,
  dbQueryMany,
};
