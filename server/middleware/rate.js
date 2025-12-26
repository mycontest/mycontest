const rateLimit = require("express-rate-limit");
const response = require("../utils/response");
const { MESSAGES } = require("../utils/constants");

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10);
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);

// General rate limiter
const generalLimiter = rateLimit({
  windowMs,
  max,
  message: MESSAGES.RATE_LIMIT_EXCEEDED,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => response.error(res, MESSAGES.RATE_LIMIT_EXCEEDED, 429),
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => response.error(res, "Too many login attempts, please try again later", 429),
});

// Submission rate limiter
const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 submissions per minute
  message: "Too many submissions, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => response.error(res, "Too many submissions, please slow down", 429),
});

module.exports = {
  generalLimiter,
  authLimiter,
  submissionLimiter,
};
