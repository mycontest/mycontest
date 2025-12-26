const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problem.controller');
const { authCheck, authRequired, authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { problemSchemas } = require('../../models/schemas');

// Public routes (with optional auth)
router.get('/', authCheck, problemController.getProblems);
router.get('/:id', authCheck, problemController.getProblemById);
router.get('/:id/submissions', authCheck, problemController.getProblemSubmissions);

// Protected routes
router.post('/', authRequired, validate(problemSchemas.create), problemController.createProblem);
router.put('/:id', authRequired, validate(problemSchemas.update), problemController.updateProblem);
router.delete('/:id', authRequired, problemController.deleteProblem);

module.exports = router;
