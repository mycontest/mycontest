const express = require("express");
const router = express.Router();
const discussionController = require("./discussion.controller");
const { authCheck, authRequired } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const discussionSchemas = require("./discussion.schema");

// Public routes (with optional auth)
router.get("/", authCheck, discussionController.discussionGetAll);
router.get("/:id", authCheck, discussionController.discussionGet);

// Protected routes
router.post("/", authRequired, validate(discussionSchemas.create), discussionController.discussionCreate);
router.put("/:id", authRequired, validate(discussionSchemas.update), discussionController.discussionUpdate);
router.delete("/:id", authRequired, discussionController.discussionDelete);

// Problem-specific discussions
router.get("/problems/:problemId", authCheck, discussionController.discussionProblem);

module.exports = router;
