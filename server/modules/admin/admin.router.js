const express = require("express");
const router = express.Router();
const middlewareAuth = require("../../middleware/auth");
const middlewareValidate = require("../../middleware/validate");
const { schemaCreateProblem, schemaAddLanguage } = require("./admin.schema");
const { adminDashboard, adminProblems, adminProblemCreateForm, adminProblemCreate, adminLanguages, adminLanguageAdd, adminLanguageToggle, adminUsers } = require("./admin.controller");

router.get("/", middlewareAuth.authAdmin, adminDashboard);
router.get("/problems", middlewareAuth.authAdmin, adminProblems);
router.get("/problems/create", middlewareAuth.authAdmin, adminProblemCreateForm);
router.post("/problems/create", middlewareAuth.authAdmin, middlewareValidate(schemaCreateProblem), adminProblemCreate);
router.get("/languages", middlewareAuth.authAdmin, adminLanguages);
router.post("/languages/add", middlewareAuth.authAdmin, middlewareValidate(schemaAddLanguage), adminLanguageAdd);
router.post("/languages/:id/toggle", middlewareAuth.authAdmin, adminLanguageToggle);
router.get("/users", middlewareAuth.authAdmin, adminUsers);

module.exports = router;
