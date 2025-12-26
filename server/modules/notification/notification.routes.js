const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authRequired } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { notificationSchemas } = require('../../models/schemas');

// All routes require authentication
router.get('/', authRequired, notificationController.getNotifications);
router.get('/unread-count', authRequired, notificationController.getUnreadCount);
router.put('/:id/read', authRequired, notificationController.markAsRead);
router.put('/read-multiple', authRequired, validate(notificationSchemas.markAsRead), notificationController.markMultipleAsRead);
router.put('/read-all', authRequired, notificationController.markAllAsRead);
router.delete('/:id', authRequired, notificationController.deleteNotification);

module.exports = router;
