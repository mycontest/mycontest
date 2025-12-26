const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contest.controller');
const { authCheck, authRequired } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const contestSchemas = require('./contest.schema');

// Public routes (with optional auth)
router.get('/', authCheck, contestController.contestGetAll);
router.get('/:id', authCheck, contestController.contestGet);
router.get('/:id/leaderboard', authCheck, contestController.contestLeaderboard);
router.get('/:id/problems', authCheck, contestController.contestProblems);

// Protected routes
router.post('/', authRequired, validate(contestSchemas.create), contestController.contestCreate);
router.put('/:id', authRequired, validate(contestSchemas.update), contestController.contestUpdate);
router.post('/:id/join', authRequired, contestController.contestJoin);

module.exports = router;
