const express = require('express');
const router = express.Router();
const { validate, authAdmin } = require('../../middleware');
const { schemaCreateProblem, schemaAddLanguage } = require('./admin.schema');
const { adminDashboard, adminProblems, adminProblemCreateForm, adminProblemCreate, adminLanguages, adminLanguageAdd, adminLanguageToggle, adminUsers } = require('./admin.controller');

router.get('/', authAdmin, adminDashboard);
router.get('/problems', authAdmin, adminProblems);
router.get('/problems/create', authAdmin, adminProblemCreateForm);
router.post('/problems/create', authAdmin, validate(schemaCreateProblem), adminProblemCreate);
router.get('/languages', authAdmin, adminLanguages);
router.post('/languages/add', authAdmin, validate(schemaAddLanguage), adminLanguageAdd);
router.post('/languages/:id/toggle', authAdmin, adminLanguageToggle);
router.get('/users', authAdmin, adminUsers);

module.exports = router;
