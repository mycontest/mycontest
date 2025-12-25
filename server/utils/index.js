/**
 * Utils Index
 * Universal exports for database and common utilities
 */

const createError = require('http-errors');
const { dbQueryOne, dbQueryMany, dbTransaction } = require('./mysql');

/**
 * Wrap async controller functions with error handling
 * Passes errors to Express error handler via next()
 */
const fnWrap = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    fnWrap,
    dbQueryOne,
    dbQueryMany,
    dbTransaction
};
