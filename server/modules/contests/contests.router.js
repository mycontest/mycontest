const express = require('express');
const router = express.Router();
const { fnWrap } = require('../../utils');
const { contestsList, contestsView } = require('./contests.controller');
router.get('/contests', fnWrap(contestsList));
router.get('/contests/:id', fnWrap(contestsView));
module.exports = router;
