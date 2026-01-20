const express = require("express");
const router = express.Router();
const controller = require("./contest.controller");

router.get("/", controller.getContestList);
router.get("/:id", controller.getContestDetail);

module.exports = router;
