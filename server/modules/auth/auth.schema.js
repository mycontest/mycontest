const Joi = require("joi");

const schemaRegister = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
});

const schemaLogin = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const schemaUpdateProfile = Joi.object({
  full_name: Joi.string().min(2).max(100),
  bio: Joi.string().max(500).allow(""),
  avatar_url: Joi.string().uri().allow(""),
});

module.exports = {
  schemaRegister,
  schemaLogin,
  schemaUpdateProfile,
};
