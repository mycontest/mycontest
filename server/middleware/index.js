/**
 * Middleware Index
 * Universal exports for all middlewares
 */

const validate = require("./validate");
const { authCheck, authRequired, authAdmin } = require("./auth");

module.exports = {
  validate,
  authCheck,
  authRequired,
  authAdmin,
};
