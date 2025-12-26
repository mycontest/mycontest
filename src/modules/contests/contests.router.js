const express = require("express");
const router = express.Router();
const { contestsList, contestsView } = require("./contests.controller");

router.get("/contests", contestsList);
router.get("/contests/:id", contestsView);

module.exports = router;
