const ApiResponse = require('../utils/response');
const { HTTP_STATUS, MESSAGES } = require('../constants');

/**
 * Joi validation middleware
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return ApiResponse.badRequest(res, MESSAGES.VALIDATION_ERROR, errors);
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

module.exports = validate;
