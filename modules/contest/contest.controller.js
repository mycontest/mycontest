const { dbQueryMany, dbQueryOne } = require("../../shared/utils/mysql");
const { asyncHandler } = require("../../shared/utils/handler");

exports.getContestList = asyncHandler(async (req, res) => {
  const contests = await dbQueryMany("SELECT * FROM contest_details ORDER BY start_date DESC");
  res.render("layout", { page: "user/contests", navbar: "home", title: "Contests", contests });
});

exports.getContestDetail = async (req, res) => {
  res.redirect("/contests");
};
