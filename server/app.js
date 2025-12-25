// ================================================================
// MYCONTEST PLATFORM - Main Application
// EJS-based MVC Platform
// ================================================================

require('dotenv').config({ path: '../.env' });

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const FileStore = require('session-file-store')(session);

const app = express();

// ================================================================
// MIDDLEWARE SETUP
// ================================================================

app.use(cookieParser(process.env.SECRET));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
        path: path.join(__dirname, 'session'),
        logFn: function () {}
    }),
    cookie: { maxAge: 12 * 3600000, secure: false, httpOnly: false }
}));

app.use(fileUpload({ limits: { fileSize: process.env.LIMIT || 52428800 } }));
app.use(express.urlencoded({ extended: false, limit: process.env.LIMIT }));
app.use(express.json({ limit: process.env.LIMIT }));
app.use(express.static('public'));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================================================================
// SERVICES
// ================================================================

const {
    fnRegisterService,
    fnLoginService,
    fnGetUserByIdService,
    fnUpdateProfileService,
    fnGetUserStatsService
} = require('./modules/auth/auth.service');

const {
    fnGetAllProblemsService,
    fnGetProblemByIdService,
    fnGetTestCasesService,
    fnSubmitSolutionService,
    fnGetSubmissionService,
    fnGetUserSubmissionsService,
    fnUpdateSubmissionService,
    fnGetProblemsByDifficultyService
} = require('./modules/problems/problems.service');

const {
    fnCreateProblemService,
    fnAddLanguageService,
    fnGetAllLanguagesService,
    fnToggleLanguageService,
    fnGetAllUsersService,
    fnUpdateUserRoleService,
    fnDeleteProblemService,
    fnGetDashboardStatsService
} = require('./modules/admin/admin.service');

// ================================================================
// MIDDLEWARE - Auth Check
// ================================================================

const authCheck = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

const authRequired = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const authAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
            message: 'Access denied',
            error: { status: 403 }
        });
    }
    next();
};

app.use(authCheck);

// ================================================================
// PUBLIC ROUTES
// ================================================================

// Home page
app.get('/', async (req, res) => {
    try {
        const problems = await fnGetAllProblemsService();
        res.render('pages/home', { problems });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Problems list
app.get('/problems', async (req, res) => {
    try {
        const problems = await fnGetAllProblemsService();
        res.render('pages/problems', { problems });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Single problem view
app.get('/problems/:id', async (req, res) => {
    try {
        const problem = await fnGetProblemByIdService(req.params.id);
        res.render('pages/problem', { problem });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// ================================================================
// AUTH ROUTES
// ================================================================

// Login page
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('pages/login', { error: null });
});

// Login POST
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await fnLoginService(username, password);
        req.session.user = user;
        res.redirect('/');
    } catch (error) {
        res.render('pages/login', { error: error.message });
    }
});

// Register page
app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('pages/register', { error: null });
});

// Register POST
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;
        const user = await fnRegisterService(username, email, password, full_name);
        req.session.user = user;
        res.redirect('/');
    } catch (error) {
        res.render('pages/register', { error: error.message });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ================================================================
// USER ROUTES (Authenticated)
// ================================================================

// Profile
app.get('/profile', authRequired, async (req, res) => {
    try {
        const stats = await fnGetUserStatsService(req.session.user.user_id);
        res.render('pages/profile', { stats });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Submit solution
app.post('/problems/:id/submit', authRequired, async (req, res) => {
    try {
        const { lang_id, code_body } = req.body;
        const result = await fnSubmitSolutionService(
            req.session.user.user_id,
            req.params.id,
            lang_id,
            code_body
        );
        res.redirect(`/submissions/${result.submission_id}`);
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// View submission
app.get('/submissions/:id', async (req, res) => {
    try {
        const submission = await fnGetSubmissionService(req.params.id);
        res.render('pages/submission', { submission });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// ================================================================
// ADMIN ROUTES
// ================================================================

app.get('/admin', authAdmin, async (req, res) => {
    try {
        const stats = await fnGetDashboardStatsService();
        res.render('admin/dashboard', { stats });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Problems management
app.get('/admin/problems', authAdmin, async (req, res) => {
    try {
        const problems = await fnGetAllProblemsService();
        res.render('admin/problems', { problems });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Create problem page
app.get('/admin/problems/create', authAdmin, (req, res) => {
    res.render('admin/problem-create', { error: null });
});

// Create problem POST
app.post('/admin/problems/create', authAdmin, async (req, res) => {
    try {
        if (!req.files || !req.files.zip_file) {
            throw new Error('No ZIP file uploaded');
        }

        const result = await fnCreateProblemService(
            req.files.zip_file.data,
            req.session.user.user_id
        );

        res.redirect('/admin/problems');
    } catch (error) {
        res.render('admin/problem-create', { error: error.message });
    }
});

// Languages management
app.get('/admin/languages', authAdmin, async (req, res) => {
    try {
        const languages = await fnGetAllLanguagesService();
        res.render('admin/languages', { languages });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Add language POST
app.post('/admin/languages/add', authAdmin, async (req, res) => {
    try {
        await fnAddLanguageService(req.body);
        res.redirect('/admin/languages');
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Toggle language status
app.post('/admin/languages/:id/toggle', authAdmin, async (req, res) => {
    try {
        await fnToggleLanguageService(req.params.id);
        res.redirect('/admin/languages');
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// Users management
app.get('/admin/users', authAdmin, async (req, res) => {
    try {
        const users = await fnGetAllUsersService();
        res.render('admin/users', { users });
    } catch (error) {
        res.status(500).render('error', { message: error.message, error });
    }
});

// ================================================================
// ERROR HANDLING
// ================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).render('error', {
        message: err.message || 'Internal server error',
        error: err
    });
});

// ================================================================
// START SERVER
// ================================================================

const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
    console.log(`✓ Server running on ${process.env.DOMAIN || `http://localhost:${PORT}`}`);
});
