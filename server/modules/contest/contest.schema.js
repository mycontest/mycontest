const Joi = require("joi");

const contestSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().greater(Joi.ref("start_time")).required(),
    is_public: Joi.boolean().default(true),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().min(10),
    start_time: Joi.date().iso(),
    end_time: Joi.date().iso(),
    is_public: Joi.boolean(),
  }),
};

module.exports = contestSchemas;
