/**
 * Admin Schema
 * Validation schemas for admin operations
 */

const Joi = require("joi");

const schemaCreateProblem = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  difficulty: Joi.string().valid("easy", "medium", "hard").required(),
  description: Joi.string().allow("").optional(),
  input_format: Joi.string().allow("").optional(),
  output_format: Joi.string().allow("").optional(),
  constraints: Joi.string().allow("").optional(),
  time_limit: Joi.number().integer().min(100).max(10000).default(1000),
  memory_limit: Joi.number().integer().min(16).max(1024).default(256),
  lang_ids: Joi.alternatives().try(Joi.number().integer(), Joi.array().items(Joi.number().integer())).required(),
  templates: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
});

const schemaAddLanguage = Joi.object({
  lang_name: Joi.string().min(2).max(100).required(),
  lang_code: Joi.string().min(2).max(50).required(),
  file_extension: Joi.string().min(1).max(20).required(),
  compile_command: Joi.string().allow("", null).optional(),
  run_command: Joi.string().min(1).max(500).required(),
  docker_image: Joi.string().max(200).default("run_test_1"),
});

module.exports = {
  schemaCreateProblem,
  schemaAddLanguage,
};
