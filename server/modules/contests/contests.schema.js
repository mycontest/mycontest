/**
 * Contests Schema
 * Validation schemas for contest operations (future implementation)
 */

const Joi = require('joi');

const schemaCreateContest = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().allow('').optional(),
    is_public: Joi.boolean().default(true),
    unique_code: Joi.string().max(50).optional(),
    start_time: Joi.date().required(),
    end_time: Joi.date().greater(Joi.ref('start_time')).required()
});

const schemaJoinContest = Joi.object({
    contest_id: Joi.number().integer().required(),
    unique_code: Joi.string().max(50).optional()
});

module.exports = {
    schemaCreateContest,
    schemaJoinContest
};
