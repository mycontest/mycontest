/**
 * Authentication Middlewares
 */

const createError = require('http-errors');

/**
 * Check and attach user to res.locals
 */
const authCheck = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.title = '';
    next();
};

/**
 * Require user to be authenticated
 */
const authRequired = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

/**
 * Require user to be admin
 */
const authAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return next(createError(403, 'Access denied - Admin only'));
    }
    next();
};

module.exports = {
    authCheck,
    authRequired,
    authAdmin
};
