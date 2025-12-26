const Joi = require("joi");

const notificationSchemas = {
  markAsRead: Joi.object({
    notification_ids: Joi.array().items(Joi.number().integer()).min(1).required(),
  }),
};

module.exports = notificationSchemas;
