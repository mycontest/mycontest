/**
 * Problems Validation Schemas
 * Master Spec: Professional Code Judge & Contest Platform
 *
 * All schemas use 'schema' prefix as per naming conventions
 */

const Joi = require('joi');

/**
 * Schema for validating ZIP upload
 */
const schemaValidateZipUpload = Joi.object({
    zip_file: Joi.object({
        name: Joi.string().pattern(/\.zip$/).required(),
        data: Joi.binary().required(),
        size: Joi.number().max(50 * 1024 * 1024).required(), // 50MB max
        mimetype: Joi.string().valid('application/zip', 'application/x-zip-compressed').required()
    }).required()
});

/**
 * Schema for validating problem submission
 */
const schemaValidateSubmission = Joi.object({
    problem_id: Joi.number().integer().positive().required(),
    code_body: Joi.string().min(1).max(100000).required(),
    language: Joi.string().valid('python', 'sql', 'pandas', 'cpp', 'java', 'javascript').required(),
    contest_id: Joi.number().integer().positive().optional()
});

/**
 * Schema for validating problem query parameters
 */
const schemaValidateProblemQuery = Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional().default(50),
    offset: Joi.number().integer().min(0).optional().default(0)
});

/**
 * Schema for validating search query
 */
const schemaValidateSearchQuery = Joi.object({
    q: Joi.string().min(2).max(100).required()
});

/**
 * Schema for validating difficulty parameter
 */
const schemaValidateDifficulty = Joi.object({
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required()
});

/**
 * Schema for validating problem type parameter
 */
const schemaValidateProblemType = Joi.object({
    type: Joi.string().valid('python', 'sql', 'pandas', 'cpp', 'java', 'javascript').required()
});

/**
 * Schema for validating problem ID parameter
 */
const schemaValidateProblemId = Joi.object({
    id: Joi.number().integer().positive().required()
});

/**
 * Schema for validating config.json from ZIP
 */
const schemaValidateConfig = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
    problem_type: Joi.string().valid('python', 'sql', 'pandas', 'cpp', 'java', 'javascript').required(),
    description: Joi.string().max(10000).optional().default(''),
    template_code: Joi.string().max(10000).optional().default(''),
    time_limit: Joi.number().integer().min(100).max(30000).required(),
    memory_limit: Joi.number().integer().min(32).max(2048).required(),
    points_per_case: Joi.number().integer().min(1).max(100).optional().default(10)
});

/**
 * Middleware to validate request body against schema
 * @param {Object} schema - Joi schema object
 * @returns {Function} Express middleware function
 */
const middlewareValidateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const error_messages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error_messages
            });
        }

        req.validated_body = value;
        next();
    };
};

/**
 * Middleware to validate query parameters against schema
 * @param {Object} schema - Joi schema object
 * @returns {Function} Express middleware function
 */
const middlewareValidateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const error_messages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error_messages
            });
        }

        req.validated_query = value;
        next();
    };
};

/**
 * Middleware to validate route parameters against schema
 * @param {Object} schema - Joi schema object
 * @returns {Function} Express middleware function
 */
const middlewareValidateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const error_messages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error_messages
            });
        }

        req.validated_params = value;
        next();
    };
};

module.exports = {
    // Schemas
    schemaValidateZipUpload,
    schemaValidateSubmission,
    schemaValidateProblemQuery,
    schemaValidateSearchQuery,
    schemaValidateDifficulty,
    schemaValidateProblemType,
    schemaValidateProblemId,
    schemaValidateConfig,

    // Middleware
    middlewareValidateRequest,
    middlewareValidateQuery,
    middlewareValidateParams
};
