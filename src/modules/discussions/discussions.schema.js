/**
 * Discussions Schema
 * Validation schemas for discussion/comment operations
 */

const Joi = require("joi");

const schemaCreateDiscussion = Joi.object({
  content: Joi.string().min(1).max(2000).required().messages({
    "string.min": "Comment must be at least 1 character",
    "string.max": "Comment must not exceed 2000 characters",
    "any.required": "Comment content is required",
  }),
  parent_id: Joi.number().integer().optional().allow(null),
});

module.exports = {
  schemaCreateDiscussion,
};
