const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contest.controller');
const { authCheck, authRequired } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { contestSchemas } = require('../../models/schemas');

// Public routes (with optional auth)
router.get('/', authCheck, contestController.getContests);
router.get('/:id', authCheck, contestController.getContestById);
router.get('/:id/leaderboard', authCheck, contestController.getLeaderboard);
router.get('/:id/problems', authCheck, contestController.getContestProblems);

// Protected routes
router.post('/', authRequired, validate(contestSchemas.create), contestController.createContest);
router.put('/:id', authRequired, validate(contestSchemas.update), contestController.updateContest);
router.post('/:id/join', authRequired, contestController.joinContest);

module.exports = router;
