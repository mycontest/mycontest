/**
 * Auth Service
 * Database operations for authentication
 */

const { dbQueryOne, dbQueryMany } = require('../../utils/db');
const md5 = require('md5');

const fnRegister = async (username, email, password, full_name) => {
    const existing = await dbQueryOne(
        'SELECT user_id FROM users WHERE username = ? OR email = ?',
        [username, email]
    );

    if (existing) {
        throw new Error('Username or email already exists');
    }

    const hashed_password = md5(password);

    await dbQueryMany(
        'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
        [username, email, hashed_password, full_name]
    );

    const user = await dbQueryOne(
        'SELECT user_id, username, email, full_name, role FROM users WHERE username = ?',
        [username]
    );

    return user;
};

const fnLogin = async (username, password) => {
    const hashed_password = md5(password);

    const user = await dbQueryOne(
        `SELECT user_id, username, email, full_name, role, subscription, total_score
         FROM users WHERE username = ? AND password = ?`,
        [username, hashed_password]
    );

    if (!user) {
        throw new Error('Invalid username or password');
    }

    return user;
};

const fnGetUserById = async (user_id) => {
    const user = await dbQueryOne(
        `SELECT user_id, username, email, full_name, role, subscription, total_score, avatar_url
         FROM users WHERE user_id = ?`,
        [user_id]
    );

    return user;
};

const fnGetUserStats = async (user_id) => {
    const stats = await dbQueryOne(
        'SELECT * FROM vw_user_stats WHERE user_id = ?',
        [user_id]
    );

    return stats;
};

const authCheck = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.title = '';
    next();
};

const authRequired = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const authAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
            title: 'Access Denied',
            message: 'Access denied',
            error: { status: 403 }
        });
    }
    next();
};

module.exports = {
    fnRegister,
    fnLogin,
    fnGetUserById,
    fnGetUserStats,
    authCheck,
    authRequired,
    authAdmin
};
