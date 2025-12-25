/**
 * Auth Schema
 * Validation schemas for authentication
 */

const Joi = require("joi");

const schemaLogin = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
});

const schemaRegister = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).max(200).required(),
});

module.exports = {
  schemaLogin,
  schemaRegister,
};
