/**
 * Database Utility
 * Simple MySQL2 wrapper with connection pooling
 */

const mysql = require('mysql2');
require('dotenv').config({ path: '../../.env' });

// Create connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'my_contest',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
});

// Promise-based pool
const pool_promise = pool.promise();

/**
 * Execute query and return single row
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
const dbQueryOne = async (query, params = []) => {
    try {
        const [rows] = await pool_promise.execute(query, params);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('DB Query Error:', error.message);
        throw error;
    }
};

/**
 * Execute query and return multiple rows
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
const dbQueryMany = async (query, params = []) => {
    try {
        const [rows] = await pool_promise.execute(query, params);
        return rows;
    } catch (error) {
        console.error('DB Query Error:', error.message);
        throw error;
    }
};

/**
 * Execute transaction
 * @param {Function} callback - Function with connection parameter
 * @returns {Promise<any>} Transaction result
 */
const dbTransaction = async (callback) => {
    const connection = await pool_promise.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        console.error('Transaction Error:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Test database connection
 */
const dbTestConnection = async () => {
    try {
        await pool_promise.query('SELECT 1');
        console.log('✓ Database Connected');
        return true;
    } catch (error) {
        console.error('✗ Database Connection Failed:', error.message);
        return false;
    }
};

// Test connection on load
dbTestConnection();

module.exports = {
    pool,
    pool_promise,
    dbQueryOne,
    dbQueryMany,
    dbTransaction,
    dbTestConnection
};
