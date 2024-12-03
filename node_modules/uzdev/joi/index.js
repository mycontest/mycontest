const convertError = (errors) => {
    const res = {};
    errors?.details?.forEach((detail) => {
        const key = detail?.context?.key;
        const message = detail?.message?.replace(/^"(.*)" is required$/, "$1 is required");
        if (key) res[key] = message;
    });
    return res;
};

const createValidator = (schema, type) => async (req, res, next) => {
    try {
        await schema.validateAsync(req[type], { abortEarly: false });
        next();
    } catch (err) {
        res.status(422).json({ message: "Validation error: Invalid format.", details: convertError(err) });
    }
};

const validator = (data, schema) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
        const errors = error.details.map((err) => ({
            message: err.message,
            path: err.path.join('.')
        }));
        return { error: errors };
    }
    return { value };
};

const body = (schema) => createValidator(schema, "body");
const params = (schema) => createValidator(schema, "params");
const query = (schema) => createValidator(schema, "query");

module.exports = { body, params, query, validator };
