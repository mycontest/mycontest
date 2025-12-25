/**
 * Auth Router
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const fnWrap = require('../../utils/fnWrap');
const { authRequired } = require('./auth.service');

const {
    authLogin,
    authRegister,
    authLogout,
    authProfile,
    authLoginPage,
    authRegisterPage
} = require('./auth.controller');

router.get('/login', authLoginPage);

router.post('/login', fnWrap(async (req, res) => {
    try {
        await authLogin(req, res);
    } catch (error) {
        res.render('pages/login', { title: 'Login', error: error.message });
    }
}));

router.get('/register', authRegisterPage);

router.post('/register', fnWrap(async (req, res) => {
    try {
        await authRegister(req, res);
    } catch (error) {
        res.render('pages/register', { title: 'Register', error: error.message });
    }
}));

router.get('/logout', authLogout);
router.get('/profile', authRequired, fnWrap(authProfile));

module.exports = router;
