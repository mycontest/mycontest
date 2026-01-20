const { dbQueryMany, dbQueryOne } = require("../../shared/utils/mysql");
const { asyncHandler } = require("../../shared/utils/handler");

exports.getProblemList = asyncHandler(async (req, res) => {
  const problems = await dbQueryMany("SELECT * FROM problem_details");
  res.render("layout", { page: "user/problems", navbar: "home", title: "Problems", problems });
});

exports.getProblemDetail = asyncHandler(async (req, res) => {
  const problem = await dbQueryOne("SELECT * FROM problem_details WHERE id = ?", [req.params.id]);
  if (!problem) return res.redirect("/problems");

  const languages = await dbQueryMany(
    `
    SELECT l.*, pl.default_code 
    FROM languages l
    JOIN problem_languages pl ON pl.language_id = l.id
    WHERE pl.problem_id = ?
  `,
    [problem.id],
  );

  res.render("layout", { page: "user/problem", navbar: "problem", title: problem.name, problem, languages });
});
