const { dbQueryMany, dbQueryOne } = require("../../shared/utils/mysql");
const { asyncHandler } = require("../../shared/utils/handler");

exports.getProblemList = asyncHandler(async (req, res) => {
  const problems = await dbQueryMany("SELECT * FROM problem_details WHERE is_public = 1");
  res.render("layout", { page: "user/problems", navbar: "home", title: "Problems", problems });
});

exports.getProblemDetail = asyncHandler(async (req, res) => {
  const problem = await dbQueryOne("SELECT * FROM problem_details WHERE id = ? AND is_public = 1", [req.params.id]);
  if (!problem) return res.redirect("/problems");

  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/problems");
  }

  const languages = await dbQueryMany("SELECT * FROM vw_problem_languages WHERE problem_id = ?", [problem.id]);
  res.render("layout", { page: "user/problem", navbar: "problem", title: problem.name, problem, languages });
});
