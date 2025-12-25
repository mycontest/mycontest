/**
 * Auth Service
 * Handles user authentication and authorization
 */

const { dbQueryOne, dbQueryMany } = require('../../utils/db');
const md5 = require('md5');

/**
 * Register new user
 */
const fnRegisterService = async (username, email, password, full_name) => {
    try {
        // Check if user exists
        const existing_user = await dbQueryOne(
            'SELECT user_id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing_user) {
            throw new Error('Username or email already exists');
        }

        // Hash password
        const hashed_password = md5(password);

        // Insert user
        const query = `
            INSERT INTO users (username, email, password, full_name)
            VALUES (?, ?, ?, ?)
        `;

        await dbQueryMany(query, [username, email, hashed_password, full_name]);

        // Get the created user
        const user = await dbQueryOne(
            'SELECT user_id, username, email, full_name, role FROM users WHERE username = ?',
            [username]
        );

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Login user
 */
const fnLoginService = async (username, password) => {
    try {
        const hashed_password = md5(password);

        const user = await dbQueryOne(
            `SELECT user_id, username, email, full_name, role, subscription, total_score
             FROM users
             WHERE username = ? AND password = ?`,
            [username, hashed_password]
        );

        if (!user) {
            throw new Error('Invalid username or password');
        }

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user by ID
 */
const fnGetUserByIdService = async (user_id) => {
    try {
        const user = await dbQueryOne(
            `SELECT user_id, username, email, full_name, role, subscription, total_score, avatar_url
             FROM users
             WHERE user_id = ?`,
            [user_id]
        );

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user profile
 */
const fnUpdateProfileService = async (user_id, full_name, avatar_url) => {
    try {
        const query = `
            UPDATE users
            SET full_name = ?, avatar_url = ?
            WHERE user_id = ?
        `;

        await dbQueryMany(query, [full_name, avatar_url, user_id]);

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user statistics
 */
const fnGetUserStatsService = async (user_id) => {
    try {
        const stats = await dbQueryOne(
            'SELECT * FROM vw_user_stats WHERE user_id = ?',
            [user_id]
        );

        return stats;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    fnRegisterService,
    fnLoginService,
    fnGetUserByIdService,
    fnUpdateProfileService,
    fnGetUserStatsService
};
