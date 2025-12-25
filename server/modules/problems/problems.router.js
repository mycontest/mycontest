/**
 * Problems Router
 */

const express = require('express');
const router = express.Router();
const { fnWrap } = require('../../utils');
const { authRequired } = require('../auth/auth.service');

const {
    problemsHome,
    problemsList,
    problemsView,
    problemsSubmit,
    problemsSubmissionView
} = require('./problems.controller');

router.get('/', fnWrap(problemsHome));
router.get('/problems', fnWrap(problemsList));
router.get('/problems/:id', fnWrap(problemsView));
router.post('/problems/:id/submit', authRequired, fnWrap(problemsSubmit));
router.get('/submissions/:id', fnWrap(problemsSubmissionView));

module.exports = router;
