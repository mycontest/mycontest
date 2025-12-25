const { fnWrap } = require('../../utils');
const { fnCreateProblem, fnAddProblemLanguage, fnAddLanguage, fnGetAllLanguages, fnToggleLanguage, fnGetAllUsers, fnGetDashboardStats } = require('./admin.service');
const { fnGetAllProblems } = require('../problems/problems.service');

const adminDashboard = fnWrap(async (req, res) => {
    const stats = await fnGetDashboardStats();
    res.render('admin/dashboard', { title: 'Admin Dashboard', stats });
});

const adminProblems = fnWrap(async (req, res) => {
    const problems = await fnGetAllProblems();
    res.render('admin/problems', { title: 'Manage Problems', problems });
});

const adminProblemCreateForm = fnWrap(async (req, res) => {
    const languages = await fnGetAllLanguages();
    res.render('admin/problem-create', { title: 'Create Problem', languages, error: null });
});

const adminProblemCreate = fnWrap(async (req, res) => {
    if (!req.files || !req.files.test_zip) throw new Error('No test ZIP uploaded');
    const { title, difficulty, description, input_format, output_format, constraints, time_limit, memory_limit, lang_ids, templates } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const result = await fnCreateProblem({ title, slug, difficulty, description: description || '', input_format: input_format || '', output_format: output_format || '', constraints: constraints || '', time_limit: parseInt(time_limit) || 1000, memory_limit: parseInt(memory_limit) || 256, created_by: req.session.user.user_id }, req.files.test_zip.data);
    const lang_id_array = Array.isArray(lang_ids) ? lang_ids : [lang_ids];
    const templates_array = Array.isArray(templates) ? templates : [templates];
    for (let i = 0; i < lang_id_array.length; i++) {
        if (lang_id_array[i] && templates_array[i]) {
            await fnAddProblemLanguage(result.problem_id, lang_id_array[i], templates_array[i]);
        }
    }
    res.redirect('/admin/problems');
});

const adminLanguages = fnWrap(async (req, res) => {
    const languages = await fnGetAllLanguages();
    res.render('admin/languages', { title: 'Manage Languages', languages });
});

const adminLanguageAdd = fnWrap(async (req, res) => {
    await fnAddLanguage(req.body);
    res.redirect('/admin/languages');
});

const adminLanguageToggle = fnWrap(async (req, res) => {
    await fnToggleLanguage(req.params.id);
    res.redirect('/admin/languages');
});

const adminUsers = fnWrap(async (req, res) => {
    const users = await fnGetAllUsers();
    res.render('admin/users', { title: 'Manage Users', users });
});

module.exports = {
    adminDashboard,
    adminProblems,
    adminProblemCreateForm,
    adminProblemCreate,
    adminLanguages,
    adminLanguageAdd,
    adminLanguageToggle,
    adminUsers
};
