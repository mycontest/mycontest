/**
 * Utils Index
 * Universal exports for database and common utilities
 */

const createError = require('http-errors');
const { dbQueryOne, dbQueryMany, dbTransaction } = require('./mysql');

/**
 * Wrap async controller functions with error handling
 * Automatically renders error page on failures
 */
const fnWrap = (fn) => {
    return async (req, res) => {
        try {
            return await fn(req, res);
        } catch (error) {
            console.error('Controller Error:', error);
            if (!res.headersSent) {
                res.status(error.status || 500).render('error', {
                    title: 'Error',
                    message: error.message || 'An error occurred',
                    error: error
                });
            }
        }
    };
};

module.exports = {
    fnWrap,
    dbQueryOne,
    dbQueryMany,
    dbTransaction
};
