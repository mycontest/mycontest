const { fnGetAllContests, fnGetContestById, fnGetContestLeaderboard } = require("./contests.service");

const contestsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await fnGetAllContests(page, 20);
    res.render("pages/contests", {
      title: "Contests",
      contests: result.contests,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const contestsView = async (req, res, next) => {
  try {
    const contest = await fnGetContestById(req.params.id);
    const leaderboard = await fnGetContestLeaderboard(req.params.id);
    res.render("pages/contest", { title: contest.title, contest, leaderboard });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  contestsList,
  contestsView,
};
