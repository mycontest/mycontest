const response = require("../utils/response");
const { HTTP_STATUS, MESSAGES } = require("../utils/constants");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return response.badRequest(res, MESSAGES.VALIDATION_ERROR, errors);
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
};
