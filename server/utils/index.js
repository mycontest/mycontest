/**
 * Utils Index
 * Universal exports for database and common utilities
 */

const { dbQueryOne, dbQueryMany, dbTransaction } = require('./db');

module.exports = {
    dbQueryOne,
    dbQueryMany,
    dbTransaction
};
