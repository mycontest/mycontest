/**
 * MySQL Database Connection Pool
 * Master Spec: Professional Code Judge & Contest Platform
 *
 * Uses mysql2 library with pool connections for optimal performance
 */

const mysql = require('mysql2');
require('dotenv').config({ path: '../../../.env' });

// Create connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'my_contest',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Create promise-based pool for async/await support
const pool_promise = pool.promise();

/**
 * Execute a query with parameters
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const fnExecuteQuery = async (query, params = []) => {
    try {
        const [rows] = await pool_promise.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database Query Error:', error.message);
        throw error;
    }
};

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Function containing transaction logic
 * @returns {Promise<any>} Transaction result
 */
const fnExecuteTransaction = async (callback) => {
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
 * Get a single row from database
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
const fnGetOne = async (query, params = []) => {
    try {
        const [rows] = await pool_promise.execute(query, params);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Database Query Error:', error.message);
        throw error;
    }
};

/**
 * Get all rows from database
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
const fnGetAll = async (query, params = []) => {
    try {
        const [rows] = await pool_promise.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database Query Error:', error.message);
        throw error;
    }
};

/**
 * Insert data into database
 * @param {string} query - SQL insert query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Insert result with insertId
 */
const fnInsert = async (query, params = []) => {
    try {
        const [result] = await pool_promise.execute(query, params);
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error('Database Insert Error:', error.message);
        throw error;
    }
};

/**
 * Update data in database
 * @param {string} query - SQL update query
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Number of affected rows
 */
const fnUpdate = async (query, params = []) => {
    try {
        const [result] = await pool_promise.execute(query, params);
        return result.affectedRows;
    } catch (error) {
        console.error('Database Update Error:', error.message);
        throw error;
    }
};

/**
 * Delete data from database
 * @param {string} query - SQL delete query
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Number of affected rows
 */
const fnDelete = async (query, params = []) => {
    try {
        const [result] = await pool_promise.execute(query, params);
        return result.affectedRows;
    } catch (error) {
        console.error('Database Delete Error:', error.message);
        throw error;
    }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const fnTestConnection = async () => {
    try {
        await pool_promise.query('SELECT 1');
        console.log('✓ MySQL Database Connected Successfully');
        return true;
    } catch (error) {
        console.error('✗ MySQL Connection Failed:', error.message);
        return false;
    }
};

// Test connection on module load
fnTestConnection();

module.exports = {
    pool,
    pool_promise,
    fnExecuteQuery,
    fnExecuteTransaction,
    fnGetOne,
    fnGetAll,
    fnInsert,
    fnUpdate,
    fnDelete,
    fnTestConnection
};
