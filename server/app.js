// ================================================================
// MYCONTEST PLATFORM - Main Application
// Clean EJS MVC with fnWrap Error Handling
// ================================================================

require('dotenv').config({ path: '../.env' });

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const FileStore = require('session-file-store')(session);
const fnWrap = require('./utils/fnWrap');

const app = express();

// ================================================================
// MIDDLEWARE
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================================================================
// MODULES
// ================================================================

const {
    authLogin,
    authRegister,
    authLogout,
    authProfile,
    authCheck,
    authRequired,
    authAdmin
} = require('./modules/auth/auth');

const {
    problemsHome,
    problemsList,
    problemsView,
    problemsSubmit,
    problemsSubmissionView
} = require('./modules/problems/problems');

const {
    adminDashboard,
    adminProblems,
    adminProblemCreateForm,
    adminProblemCreate,
    adminLanguages,
    adminLanguageAdd,
    adminLanguageToggle,
    adminUsers
} = require('./modules/admin/admin');

const {
    contestsList,
    contestsView,
    contestsCreate
} = require('./modules/contests/contests');

const {
    discussionsGet,
    discussionsCreate,
    discussionsDelete
} = require('./modules/discussions/discussions');

// ================================================================
// GLOBAL MIDDLEWARE
// ================================================================

app.use(authCheck);

// ================================================================
// PUBLIC ROUTES
// ================================================================

app.get('/', fnWrap(problemsHome));
app.get('/problems', fnWrap(problemsList));
app.get('/problems/:id', fnWrap(problemsView));

// Auth routes
app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('pages/login', { title: 'Login', error: null });
});

app.post('/login', fnWrap(async (req, res) => {
    try {
        await authLogin(req, res);
    } catch (error) {
        res.render('pages/login', { title: 'Login', error: error.message });
    }
}));

app.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('pages/register', { title: 'Register', error: null });
});

app.post('/register', fnWrap(async (req, res) => {
    try {
        await authRegister(req, res);
    } catch (error) {
        res.render('pages/register', { title: 'Register', error: error.message });
    }
}));

app.get('/logout', authLogout);

// ================================================================
// AUTHENTICATED ROUTES
// ================================================================

app.get('/profile', authRequired, fnWrap(authProfile));
app.post('/problems/:id/submit', authRequired, fnWrap(problemsSubmit));
app.get('/submissions/:id', fnWrap(problemsSubmissionView));

// ================================================================
// CONTESTS ROUTES
// ================================================================

app.get('/contests', fnWrap(contestsList));
app.get('/contests/:id', fnWrap(contestsView));
app.post('/contests/create', authRequired, fnWrap(contestsCreate));

// ================================================================
// DISCUSSIONS ROUTES
// ================================================================

app.get('/problems/:problem_id/discussions', authRequired, fnWrap(discussionsGet));
app.post('/discussions/create', authRequired, fnWrap(discussionsCreate));
app.post('/discussions/:id/delete', authRequired, fnWrap(discussionsDelete));

// ================================================================
// ADMIN ROUTES
// ================================================================

app.get('/admin', authAdmin, fnWrap(adminDashboard));
app.get('/admin/problems', authAdmin, fnWrap(adminProblems));
app.get('/admin/problems/create', authAdmin, fnWrap(adminProblemCreateForm));

app.post('/admin/problems/create', authAdmin, fnWrap(async (req, res) => {
    try {
        await adminProblemCreate(req, res);
    } catch (error) {
        const { fnGetAllLanguages } = require('./modules/admin/admin');
        const languages = await fnGetAllLanguages();
        res.render('admin/problem-create', {
            title: 'Create Problem',
            languages,
            error: error.message
        });
    }
}));

app.get('/admin/languages', authAdmin, fnWrap(adminLanguages));
app.post('/admin/languages/add', authAdmin, fnWrap(adminLanguageAdd));
app.post('/admin/languages/:id/toggle', authAdmin, fnWrap(adminLanguageToggle));
app.get('/admin/users', authAdmin, fnWrap(adminUsers));

// ================================================================
// ERROR HANDLING
// ================================================================

app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Not Found',
        message: 'Page not found',
        error: { status: 404 }
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).render('error', {
        title: 'Error',
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
