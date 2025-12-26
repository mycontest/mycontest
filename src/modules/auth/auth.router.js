/**
 * Auth Router
 * Authentication routes
 */

const express = require("express");
const router = express.Router();
const middlewareAuth = require("../../middleware/auth");
const middlewareValidate = require("../../middleware/validate");
const { schemaLogin, schemaRegister } = require("./auth.schema");

const { authLogin, authRegister, authLogout, authProfile, authLoginPage, authRegisterPage } = require("./auth.controller");

router.get("/login", authLoginPage);
router.post("/login", middlewareValidate(schemaLogin), authLogin);

router.get("/register", authRegisterPage);
router.post("/register", middlewareValidate(schemaRegister), authRegister);

router.get("/logout", authLogout);
router.get("/profile", middlewareAuth.authRequired, authProfile);

module.exports = router;
