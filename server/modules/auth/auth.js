/**
 * Auth Module
 * Services and Controllers
 */

const { dbQueryOne, dbQueryMany } = require('../../utils/db');
const md5 = require('md5');

// ================================================================
// SERVICES
// ================================================================

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

// ================================================================
// CONTROLLERS
// ================================================================

const authLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await fnLogin(username, password);
    req.session.user = user;
    res.redirect('/');
};

const authRegister = async (req, res) => {
    const { username, email, password, full_name } = req.body;
    const user = await fnRegister(username, email, password, full_name);
    req.session.user = user;
    res.redirect('/');
};

const authLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

const authProfile = async (req, res) => {
    const stats = await fnGetUserStats(req.session.user.user_id);
    res.render('pages/profile', {
        title: 'Profile',
        stats
    });
};

// ================================================================
// MIDDLEWARE
// ================================================================

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
    // Services
    fnRegister,
    fnLogin,
    fnGetUserById,
    fnGetUserStats,

    // Controllers
    authLogin,
    authRegister,
    authLogout,
    authProfile,

    // Middleware
    authCheck,
    authRequired,
    authAdmin
};
