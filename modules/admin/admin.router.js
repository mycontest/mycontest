const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    req.session.error = "Access denied. Admins only.";
    res.redirect("/");
  }
};

router.use(isAdmin);

// Dashboard & Users
router.get("/", adminController.getDashboard);
router.get("/users", adminController.getUserList);

// Problems
router.get("/problems", adminController.getProblemList);
router.get("/problems/add", adminController.getAddProblem);
router.post("/problems/add", adminController.postAddProblem);
router.get("/problems/edit/:id", adminController.getEditProblem);
router.post("/problems/edit/:id", adminController.postEditProblem);
router.get("/problems/:id/languages", adminController.getProblemLanguages);
router.post("/problems/:id/languages", adminController.postProblemLanguages);

// Contests
router.get("/contests", adminController.getContestList);
router.get("/contests/add", adminController.getAddContest);
router.post("/contests/add", adminController.postAddContest);
router.get("/contests/edit/:id", adminController.getEditContest);
router.post("/contests/edit/:id", adminController.postEditContest);
router.get("/contests/:id/problems", adminController.getContestProblems);
router.post("/contests/:id/problems", adminController.postContestProblems);
router.get("/contests/:id/participants", adminController.getContestParticipants);
router.post("/contests/:id/participants", adminController.postContestParticipants);

// Upload Test Cases (Placeholder for now, logic needed later)
// router.post('/problems/:id/upload', ...);

module.exports = router;
