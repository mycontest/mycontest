/**
 * Discussions Router
 * Routes for discussion/comment operations
 */

const express = require("express");
const router = express.Router();
const middlewareAuth = require("../../middleware/auth");
const middlewareValidate = require("../../middleware/validate");
const { schemaCreateDiscussion } = require("./discussions.schema");

const {
  discussionCreate,
  discussionsList,
  discussionReplies,
  discussionDelete,
  discussionLimitInfo,
} = require("./discussions.controller");

// Create discussion (requires login)
router.post("/problems/:problem_id/discussions", middlewareAuth.authRequired, middlewareValidate(schemaCreateDiscussion), discussionCreate);

// Get discussions for a problem (AJAX)
router.get("/problems/:problem_id/discussions", discussionsList);

// Get replies for a discussion (AJAX)
router.get("/discussions/:discussion_id/replies", discussionReplies);

// Delete discussion (requires login)
router.post("/discussions/:discussion_id/delete", middlewareAuth.authRequired, discussionDelete);

// Get comment limit info (AJAX, requires login)
router.get("/api/comment-limit", middlewareAuth.authRequired, discussionLimitInfo);

module.exports = router;
