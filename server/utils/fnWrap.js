/**
 * Function Wrapper for Controllers
 * Handles async errors - renders universal error page
 */

const createError = require('http-errors');

/**
 * Wrap async controller functions with error handling
 * Automatically renders error page on failures
 * @param {Function} fn - Async controller function
 * @returns {Promise} Controller result or error
 */
const fnWrap = (fn) => {
    return async (req, res) => {
        try {
            return await fn(req, res);
        } catch (error) {
            console.error('Controller Error:', error);

            if (!res.headersSent) {
                res.status(error.status || 500).render('error', {
                    title: 'Error',
                    message: error.message || 'An error occurred',
                    error: error
                });
            }
        }
    };
};

module.exports = fnWrap;
