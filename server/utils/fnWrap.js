/**
 * Function Wrapper for Controllers
 * Handles async errors and renders error pages or passes to Express error handler
 */

const createError = require('http-errors');

/**
 * Wrap async controller functions with error handling
 * @param {Function} fn - Async controller function
 * @param {Object} options - Error handling options
 * @param {string} options.errorView - View to render on error (optional)
 * @param {Function} options.getErrorData - Function to get additional data for error view (optional)
 * @returns {Function} Express middleware
 */
const fnWrap = (fn, options = {}) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            // If errorView is specified, render error on that page
            if (options.errorView && !res.headersSent) {
                try {
                    const errorData = options.getErrorData
                        ? await options.getErrorData(req, res)
                        : {};

                    res.render(options.errorView, {
                        ...errorData,
                        error: error.message || 'An error occurred'
                    });
                } catch (renderError) {
                    // If error rendering fails, pass to Express error handler
                    next(createError(error.status || 500, error.message));
                }
            } else {
                // Pass to Express error handler
                next(createError(error.status || 500, error.message));
            }
        }
    };
};

module.exports = fnWrap;
