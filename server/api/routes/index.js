const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const problemRoutes = require('./problem.routes');
const contestRoutes = require('./contest.routes');
const discussionRoutes = require('./discussion.routes');
const notificationRoutes = require('./notification.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/contests', contestRoutes);
router.use('/discussions', discussionRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

module.exports = router;
