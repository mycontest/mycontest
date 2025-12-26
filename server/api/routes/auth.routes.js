const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authRequired } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { authSchemas } = require('../../models/schemas');
const { authLimiter } = require('../../middleware/rateLimit');

// Public routes
router.post('/register', authLimiter, validate(authSchemas.register), authController.register);
router.post('/login', authLimiter, validate(authSchemas.login), authController.login);

// Protected routes
router.post('/logout', authRequired, authController.logout);
router.get('/me', authRequired, authController.getCurrentUser);
router.put('/profile', authRequired, validate(authSchemas.updateProfile), authController.updateProfile);
router.post('/change-password', authRequired, authController.changePassword);

// Public user profile
router.get('/users/:id', authController.getUserById);

module.exports = router;
