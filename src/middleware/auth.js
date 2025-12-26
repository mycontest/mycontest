/**
 * Authentication Middlewares
 */

const createError = require("http-errors");

const authCheck = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.title = "";
  next();
};

const authRequired = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

const authAdmin = (req, res, next) => {
  const role = req.session.user && req.session.user.role;
  if (role !== "admin" && role !== "organization") {
    return next(createError(403, "Access denied - Admin only"));
  }
  next();
};

module.exports = {
  authCheck,
  authRequired,
  authAdmin,
};
