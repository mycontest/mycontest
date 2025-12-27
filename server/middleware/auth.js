const jwt = require("jsonwebtoken");
const response = require("../utils/response");
const { MESSAGES, USER_ROLES } = require("../utils/constants");

const authCheck = (req, res, next) => {
  const payload = decodeToken(req);
  req.isAuthenticated = !!payload;
  req.user = payload || null;
  next();
};

const authRequired = (req, res, next) => {
  const payload = decodeToken(req);
  if (!payload) {
    return response.unauthorized(res, MESSAGES.UNAUTHORIZED);
  }
  req.user = payload;
  next();
};

const authAdmin = (req, res, next) => {
  const payload = decodeToken(req);
  if (!payload) {
    return response.unauthorized(res, MESSAGES.UNAUTHORIZED);
  }
  if (payload.role !== USER_ROLES.ADMIN) {
    return response.forbidden(res, MESSAGES.FORBIDDEN);
  }
  req.user = payload;
  next();
};

const authModerator = (req, res, next) => {
  const payload = decodeToken(req);
  if (!payload) {
    return response.unauthorized(res, MESSAGES.UNAUTHORIZED);
  }
  const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.MODERATOR];
  if (!allowedRoles.includes(payload.role)) {
    return response.forbidden(res, MESSAGES.FORBIDDEN);
  }
  req.user = payload;
  next();
};

module.exports = {
  authCheck,
  authAdmin,
  authRequired,
  authModerator,
};
