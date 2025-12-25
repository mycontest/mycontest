// ================================================================
// MYCONTEST PLATFORM
// Clean Modular MVC with Router/Controller/Service/Schema
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
// GLOBAL MIDDLEWARE
// ================================================================

const { authCheck } = require('./modules/auth/auth.service');
app.use(authCheck);

// ================================================================
// ROUTES
// ================================================================

app.use('/', require('./modules/auth/auth.router'));
app.use('/', require('./modules/problems/problems.router'));
app.use('/admin', require('./modules/admin/admin.router'));

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
    console.log(`✓ Server running on ${process.env.DOMAIN || 'http://localhost:' + PORT}`);
});
