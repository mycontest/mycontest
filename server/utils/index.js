/**
 * Utils Index
 * Universal exports for all utility functions
 */

const fnWrap = require('./fnWrap');
const { dbQueryOne, dbQueryMany, dbTransaction } = require('./db');

module.exports = {
    fnWrap,
    dbQueryOne,
    dbQueryMany,
    dbTransaction
};
