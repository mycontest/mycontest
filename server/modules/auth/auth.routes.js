const express = require("express");
const router = express.Router();

const { authRegister, authLogin, authLogout, authMe, authGetUser, authUpdateProfile, authChangePassword } = require("./auth.controller");
const { schemaRegister, schemaLogin, schemaUpdateProfile } = require("./auth.schema");
const { authLimiter } = require("../../middleware/rate");
const { authRequired } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");

// Public routes
router.post("/register", authLimiter, validate(schemaRegister), authRegister);
router.post("/login", authLimiter, validate(schemaLogin), authLogin);

// Protected routes
router.post("/logout", authRequired, authLogout);
router.get("/me", authRequired, authMe);
router.put("/profile", authRequired, validate(schemaUpdateProfile), authUpdateProfile);
router.post("/change-password", authRequired, authChangePassword);

// Public user profile
router.get("/users/:id", authGetUser);

module.exports = router;
