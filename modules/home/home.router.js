const express = require("express");
const router = express.Router();
const controller = require("./home.controller");

router.get("/", controller.getHome);
router.get("/profile", controller.getProfile);

module.exports = router;
