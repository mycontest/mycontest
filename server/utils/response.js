const { HTTP_STATUS, MESSAGES } = require("./constants");

const response = {
  success(res, data = null, message = MESSAGES.SUCCESS, statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({ success: true, message, data, timestamp: new Date().toISOString() });
  },
  error(res, message = MESSAGES.INTERNAL_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    return res.status(statusCode).json({ success: false, message, errors, timestamp: new Date().toISOString() });
  },
  created(res, data = null, message = MESSAGES.CREATED) {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  },
  notFound(res, message = MESSAGES.NOT_FOUND) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  },
  unauthorized(res, message = MESSAGES.UNAUTHORIZED) {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  },
  forbidden(res, message = MESSAGES.FORBIDDEN) {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  },
  badRequest(res, message = MESSAGES.VALIDATION_ERROR, errors = null) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors);
  },
  paginated(res, data, pagination, message = MESSAGES.SUCCESS) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        total_pages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = response;
