const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");

router.get("/", controller.fnHome);
router.get("/contest", controller.fnContestList);
router.get("/contestadd", controller.fnContestForm);
router.post("/contestadd", controller.fnContestSave);
router.get("/delcontest", controller.fnContestDelete);
router.get("/delproblems", controller.fnContestRemoveProblem);
router.post("/addproblems", controller.fnContestAddProblem);
router.get("/problems", controller.fnProblemList);
router.get("/problemsadd", controller.fnProblemForm);
router.post("/problemsadd", controller.fnProblemSave);
router.get("/delproblem", controller.fnProblemDelete);
router.post("/problemszip", controller.fnProblemUpload);
router.get("/emaillogs", controller.fnEmailLogs);

// User management
router.get("/users", controller.fnUserList);

// Contest participants
router.get("/participants", controller.fnContestParticipants);
router.post("/participants/add", controller.fnAddParticipant);
router.get("/participants/remove", controller.fnRemoveParticipant);

// Email notifications
router.post("/notify", controller.fnSendContestNotification);

// Admin checker
router.get("/checker", controller.fnCheckerPage);

module.exports = router;
