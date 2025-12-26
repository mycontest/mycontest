const Joi = require("joi");

const schemaProblemCreate = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  difficulty: Joi.string().valid("easy", "medium", "hard").required(),
  time_limit: Joi.number().integer().min(100).max(10000).default(2000),
  memory_limit: Joi.number().integer().min(32).max(512).default(256),
  tags: Joi.array().items(Joi.string()).default([]),
  is_global: Joi.boolean().default(true),
});

const schemaProblemUpdate = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().min(10),
  difficulty: Joi.string().valid("easy", "medium", "hard"),
  time_limit: Joi.number().integer().min(100).max(10000),
  memory_limit: Joi.number().integer().min(32).max(512),
  tags: Joi.array().items(Joi.string()),
  is_global: Joi.boolean(),
});

const schemaProblemFilter = Joi.object({
  difficulty: Joi.string().valid("easy", "medium", "hard"),
  search: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const schemaSubmissionCreat = Joi.object({
  problem_id: Joi.number().integer().required(),
  language_id: Joi.number().integer().required(),
  code_body: Joi.string().min(1).required(),
});

module.exports = {
  schemaProblemCreate,
  schemaProblemUpdate,
  schemaProblemFilter,
  schemaSubmissionCreat,
};
