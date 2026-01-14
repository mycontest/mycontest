const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");

router.get("/", controller.fnGetHome);
router.get("/sign-in", controller.fnGetSignIn);
router.post("/sign-in", controller.fnPostSignIn);
router.get("/sign-up", controller.fnGetSignUp);
router.post("/sign-up", controller.fnPostSignUp);
router.get("/verify", controller.fnVerifyEmail);
router.get("/logout", controller.fnLogout);

module.exports = router;
