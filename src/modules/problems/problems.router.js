/**
 * Problems Router
 */

const express = require("express");
const router = express.Router();
const middlewareAuth = require("../../middleware/auth");
const middlewareValidate = require("../../middleware/validate");
const { schemaSubmit } = require("./problems.schema");

const { problemsHome, problemsList, problemsView, problemsSubmit, problemsSubmissionView } = require("./problems.controller");

router.get("/", problemsHome);
router.get("/problems", problemsList);
router.get("/problems/:id", problemsView);
router.post("/problems/:id/submit", middlewareAuth.authRequired, middlewareValidate(schemaSubmit), problemsSubmit);
router.get("/submissions/:id", problemsSubmissionView);

module.exports = router;
