const express = require("express");
const router = express.Router();
const controller = require("./problem.controller");

router.get("/", controller.getProblemList);
router.get("/:id", controller.getProblemDetail);

module.exports = router;
