/**
 * Validation Middleware
 * Validates request data using Joi schemas
 */

const createError = require("http-errors");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const error_messages = error.details.map((detail) => detail.message).join(", ");
      return next(createError(400, error_messages));
    }

    req.body = value;
    next();
  };
};

module.exports = validate;
