/**
 * Auth Router
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const { fnWrap } = require('../../utils');
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

router.post('/login', fnWrap(authLogin, {
    errorView: 'pages/login',
    getErrorData: () => ({ title: 'Login' })
}));

router.get('/register', authRegisterPage);

router.post('/register', fnWrap(authRegister, {
    errorView: 'pages/register',
    getErrorData: () => ({ title: 'Register' })
}));

router.get('/logout', authLogout);
router.get('/profile', authRequired, fnWrap(authProfile));

module.exports = router;
