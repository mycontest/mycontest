const Joi = require('joi');

// Auth Schemas
const authSchemas = {
  register: Joi.object({
    full_name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    username: Joi.string().alphanum().min(3).max(30).required()
  }),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100),
    bio: Joi.string().max(500).allow(''),
    avatar_url: Joi.string().uri().allow('')
  })
};

// Problem Schemas
const problemSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
    time_limit: Joi.number().integer().min(100).max(10000).default(2000),
    memory_limit: Joi.number().integer().min(32).max(512).default(256),
    tags: Joi.array().items(Joi.string()).default([]),
    is_global: Joi.boolean().default(true)
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().min(10),
    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
    time_limit: Joi.number().integer().min(100).max(10000),
    memory_limit: Joi.number().integer().min(32).max(512),
    tags: Joi.array().items(Joi.string()),
    is_global: Joi.boolean()
  }),

  filter: Joi.object({
    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
    search: Joi.string().max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

// Submission Schemas
const submissionSchemas = {
  create: Joi.object({
    problem_id: Joi.number().integer().required(),
    language_id: Joi.number().integer().required(),
    code_body: Joi.string().min(1).required()
  })
};

// Contest Schemas
const contestSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
    is_public: Joi.boolean().default(true)
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().min(10),
    start_time: Joi.date().iso(),
    end_time: Joi.date().iso(),
    is_public: Joi.boolean()
  })
};

// Discussion Schemas
const discussionSchemas = {
  create: Joi.object({
    problem_id: Joi.number().integer(),
    parent_id: Joi.number().integer().allow(null),
    content: Joi.string().min(1).max(2000).required()
  }),

  update: Joi.object({
    content: Joi.string().min(1).max(2000).required()
  })
};

// Notification Schemas
const notificationSchemas = {
  markAsRead: Joi.object({
    notification_ids: Joi.array().items(Joi.number().integer()).min(1).required()
  })
};

module.exports = {
  authSchemas,
  problemSchemas,
  submissionSchemas,
  contestSchemas,
  discussionSchemas,
  notificationSchemas
};
