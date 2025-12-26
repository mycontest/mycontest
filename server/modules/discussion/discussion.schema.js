const Joi = require("joi");

const discussionSchemas = {
  create: Joi.object({
    problem_id: Joi.number().integer(),
    parent_id: Joi.number().integer().allow(null),
    content: Joi.string().min(1).max(2000).required(),
  }),

  update: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
  }),
};

module.exports = discussionSchemas;
