/**
 * Auth Controller
 * Handles authentication requests
 */

const { fnWrap } = require('../../utils');
const {
    fnRegister,
    fnLogin,
    fnGetUserStats
} = require('./auth.service');

const authLogin = fnWrap(async (req, res) => {
    const { username, password } = req.body;
    const user = await fnLogin(username, password);
    req.session.user = user;
    res.redirect('/');
});

const authRegister = fnWrap(async (req, res) => {
    const { username, email, password, full_name } = req.body;
    const user = await fnRegister(username, email, password, full_name);
    req.session.user = user;
    res.redirect('/');
});

const authLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

const authProfile = fnWrap(async (req, res) => {
    const stats = await fnGetUserStats(req.session.user.user_id);
    res.render('pages/profile', {
        title: 'Profile',
        stats
    });
});

const authLoginPage = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('pages/login', { title: 'Login', error: null });
};

const authRegisterPage = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('pages/register', { title: 'Register', error: null });
};

module.exports = {
    authLogin,
    authRegister,
    authLogout,
    authProfile,
    authLoginPage,
    authRegisterPage
};
