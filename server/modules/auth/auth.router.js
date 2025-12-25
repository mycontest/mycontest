/**
 * Auth Router
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const { validate, authRequired } = require('../../middleware');
const { schemaLogin, schemaRegister } = require('./auth.schema');

const {
    authLogin,
    authRegister,
    authLogout,
    authProfile,
    authLoginPage,
    authRegisterPage
} = require('./auth.controller');

router.get('/login', authLoginPage);
router.post('/login', validate(schemaLogin), authLogin);

router.get('/register', authRegisterPage);
router.post('/register', validate(schemaRegister), authRegister);

router.get('/logout', authLogout);
router.get('/profile', authRequired, authProfile);

module.exports = router;
