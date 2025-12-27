const response = require("../utils/response");
const { HTTP_STATUS, MESSAGES } = require("../utils/constants");

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Joi validation errors
  if (err.isJoi) {
    const errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return response.badRequest(res, MESSAGES.VALIDATION_ERROR, errors);
  }

  // Database errors
  if (err.code === "ER_DUP_ENTRY") {
    return response.error(res, "Duplicate entry", HTTP_STATUS.CONFLICT);
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return response.badRequest(res, "Invalid reference");
  }

  // Custom API errors
  if (err.statusCode) {
    return response.error(res, err.message, err.statusCode);
  }

  // Default error response
  const nodeEnv = process.env.NODE_ENV || "development";
  const message = nodeEnv === "development" ? err.message : MESSAGES.INTERNAL_ERROR;
  const stack = nodeEnv === "development" ? err.stack : undefined;

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
    stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return response.notFound(res, `Route ${req.originalUrl} not found`);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
