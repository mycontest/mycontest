const express = require('express');
const router = express.Router();
const { fnWrap } = require('../../utils');
const { authAdmin } = require('../auth/auth.service');
const { adminDashboard, adminProblems, adminProblemCreateForm, adminProblemCreate, adminLanguages, adminLanguageAdd, adminLanguageToggle, adminUsers } = require('./admin.controller');
const { fnGetAllLanguages } = require('./admin.service');

router.get('/', authAdmin, fnWrap(adminDashboard));
router.get('/problems', authAdmin, fnWrap(adminProblems));
router.get('/problems/create', authAdmin, fnWrap(adminProblemCreateForm));
router.post('/problems/create', authAdmin, fnWrap(adminProblemCreate, {
    errorView: 'admin/problem-create',
    getErrorData: async () => {
        const languages = await fnGetAllLanguages();
        return { title: 'Create Problem', languages };
    }
}));
router.get('/languages', authAdmin, fnWrap(adminLanguages));
router.post('/languages/add', authAdmin, fnWrap(adminLanguageAdd));
router.post('/languages/:id/toggle', authAdmin, fnWrap(adminLanguageToggle));
router.get('/users', authAdmin, fnWrap(adminUsers));

module.exports = router;
