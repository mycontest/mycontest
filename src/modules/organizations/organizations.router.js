/**
 * Organizations Router
 * Routes for organization operations
 */

const express = require("express");
const router = express.Router();
const middlewareAuth = require("../../middleware/auth");
const middlewareValidate = require("../../middleware/validate");
const { schemaCreateOrganization, schemaUpdateOrganization } = require("./organizations.schema");

const {
  organizationCreateForm,
  organizationCreate,
  organizationProfile,
  organizationEditForm,
  organizationUpdate,
  organizationsList,
} = require("./organizations.controller");

// List all organizations
router.get("/organizations", organizationsList);

// Create organization (requires login)
router.get("/organizations/create", middlewareAuth.authRequired, organizationCreateForm);
router.post("/organizations/create", middlewareAuth.authRequired, middlewareValidate(schemaCreateOrganization), organizationCreate);

// Organization profile pages (/:org_slug must be last)
router.get("/:org_slug/edit", middlewareAuth.authRequired, organizationEditForm);
router.post("/:org_slug/edit", middlewareAuth.authRequired, middlewareValidate(schemaUpdateOrganization), organizationUpdate);
router.get("/:org_slug", organizationProfile);

module.exports = router;
