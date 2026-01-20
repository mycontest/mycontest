const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");

router.get("/login", controller.getLogin);
router.post("/login", controller.postLogin);
router.get("/register", controller.getRegister);
router.post("/register", controller.postRegister);
router.get("/logout", controller.logout);

module.exports = router;
