const express = require("express");
const router = express.Router();
const controller = require("./contest.controller");
const { fnAuthStop } = require("../auth/auth.middleware");

router.get("/", controller.fnContestHome);

// Join (Public)
router.post("/join", controller.fnJoinContest);
router.get("/participants", controller.fnParticipantsPage);

// Problem (Task)
router.get("/problems", controller.fnProblemsPage);
router.get("/problem", controller.fnProblemPage);
router.post("/problem", [fnAuthStop], controller.fnProblemSubmit);

// Attempts
router.get("/attempts", controller.fnAttemptsPage);
router.get("/attempts/all", controller.fnAttemptsAll);
router.get("/attempts/one", [fnAuthStop], controller.fnAttemptsOne);

// Ratings
router.get("/rating", controller.fnRatingPage);
router.get("/rating/all", controller.fnRatingAll);

module.exports = router;
