const ApiResponse = require('../utils/response');
const { HTTP_STATUS, MESSAGES, USER_ROLES } = require('../constants');

/**
 * Check if user is authenticated (optional)
 */
const authCheck = (req, res, next) => {
  req.isAuthenticated = !!req.session?.user;
  req.user = req.session?.user || null;
  next();
};

/**
 * Require authentication
 */
const authRequired = (req, res, next) => {
  if (!req.session?.user) {
    return ApiResponse.unauthorized(res, MESSAGES.UNAUTHORIZED);
  }
  req.user = req.session.user;
  next();
};

/**
 * Require admin role
 */
const authAdmin = (req, res, next) => {
  if (!req.session?.user) {
    return ApiResponse.unauthorized(res, MESSAGES.UNAUTHORIZED);
  }

  if (req.session.user.role !== USER_ROLES.ADMIN) {
    return ApiResponse.forbidden(res, MESSAGES.FORBIDDEN);
  }

  req.user = req.session.user;
  next();
};

/**
 * Require moderator or admin role
 */
const authModerator = (req, res, next) => {
  if (!req.session?.user) {
    return ApiResponse.unauthorized(res, MESSAGES.UNAUTHORIZED);
  }

  const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.MODERATOR];
  if (!allowedRoles.includes(req.session.user.role)) {
    return ApiResponse.forbidden(res, MESSAGES.FORBIDDEN);
  }

  req.user = req.session.user;
  next();
};

module.exports = {
  authCheck,
  authRequired,
  authAdmin,
  authModerator
};
