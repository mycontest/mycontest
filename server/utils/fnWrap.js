/**
 * Function Wrapper for Controllers
 * Handles async errors and passes to Express error handler
 */

const fnWrap = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = fnWrap;
