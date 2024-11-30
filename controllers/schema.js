const Joi = require('joi');

const signSchema = Joi.object({
    full_name: Joi.string().required().empty(),
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9!@%^&*()_=+]{3,30}$')),
})

module.exports = {
    signSchema
}