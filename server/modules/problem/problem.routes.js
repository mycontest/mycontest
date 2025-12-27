const express = require("express");
const router = express.Router();
const { authCheck, authRequired, authAdmin } = require("../../middleware/auth");
const { problemCreate, problemUpdate, problemDelete, problemSubmissions, problemGet, problemGetAll } = require("./problem.controller");
const { proschemaProblemCreate, schemaProblemUpdate, schemaProblemFilter, schemaSubmissionCreat, blemSchemas } = require("./problem.schema");

const validate = require("../../middleware/validate");

// Public routes (with optional auth)
router.get("/", authCheck, problemGetAll);
router.get("/:id", authCheck, problemGet);
router.get("/:id/submissions", authCheck, problemSubmissions);

// Protected routes
router.post("/", authRequired, authAdmin, validate(proschemaProblemCreate), problemCreate);
router.put("/:id", authRequired, authAdmin, validate(schemaProblemUpdate), problemUpdate);
router.delete("/:id", authRequired, authAdmin, problemDelete);

module.exports = router;
