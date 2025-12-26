/**
 * Organizations Schema
 * Validation schemas for organization operations
 */

const Joi = require("joi");

const schemaCreateOrganization = Joi.object({
  org_name: Joi.string().min(3).max(200).required().messages({
    "string.min": "Organization name must be at least 3 characters",
    "string.max": "Organization name must not exceed 200 characters",
    "any.required": "Organization name is required",
  }),
  org_slug: Joi.string()
    .min(3)
    .max(200)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      "string.min": "Organization slug must be at least 3 characters",
      "string.max": "Organization slug must not exceed 200 characters",
      "string.pattern.base": "Organization slug must contain only lowercase letters, numbers, and hyphens",
      "any.required": "Organization slug is required",
    }),
  org_type: Joi.string().valid("school", "university", "company", "community").default("community"),
  description: Joi.string().max(2000).allow("").optional(),
  website_url: Joi.string().uri().max(500).allow("").optional(),
});

const schemaUpdateOrganization = Joi.object({
  org_name: Joi.string().min(3).max(200).optional(),
  org_type: Joi.string().valid("school", "university", "company", "community").optional(),
  description: Joi.string().max(2000).allow("").optional(),
  website_url: Joi.string().uri().max(500).allow("").optional(),
});

module.exports = {
  schemaCreateOrganization,
  schemaUpdateOrganization,
};
