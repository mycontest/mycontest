/**
 * Problems Schema
 */

const Joi = require('joi');

const schemaSubmit = Joi.object({
    lang_id: Joi.number().integer().required(),
    code_body: Joi.string().min(1).required()
});

module.exports = {
    schemaSubmit
};
