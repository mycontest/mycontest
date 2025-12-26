const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussion.controller');
const { authCheck, authRequired } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { discussionSchemas } = require('../../models/schemas');

// Public routes (with optional auth)
router.get('/', authCheck, discussionController.getDiscussions);
router.get('/:id', authCheck, discussionController.getDiscussionById);

// Protected routes
router.post('/', authRequired, validate(discussionSchemas.create), discussionController.createDiscussion);
router.put('/:id', authRequired, validate(discussionSchemas.update), discussionController.updateDiscussion);
router.delete('/:id', authRequired, discussionController.deleteDiscussion);

// Problem-specific discussions
router.get('/problems/:problemId', authCheck, discussionController.getProblemDiscussions);

module.exports = router;
