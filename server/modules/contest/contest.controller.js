const { fnGetContests, fnGetContestById, fnCreateContest, fnUpdateContest, fnJoinContest, fnGetContestLeaderboard, fnGetContestProblems } = require("./contest.service");
const response = require("../auth/response");
const { fnWrap } = require("../auth/utils");
const { USER_ROLES } = require("../../utils/constants");

const contestGetAll = fnWrap(async (req, res) => {
  const result = await fnGetContests(req.query);
  return response.paginated(res, result.contests, result.pagination);
});

const contestGet = fnWrap(async (req, res) => {
  const contest = await fnGetContestById(req.params.id);
  return response.success(res, contest);
});

const contestCreate = fnWrap(async (req, res) => {
  const contest = await fnCreateContest(req.body, req.user.id);
  return response.created(res, contest, "Contest created successfully");
});

const contestUpdate = fnWrap(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const contest = await fnUpdateContest(req.params.id, req.body, req.user.id, isAdmin);
  return response.success(res, contest, "Contest updated successfully");
});

const contestJoin = fnWrap(async (req, res) => {
  const result = await fnJoinContest(req.params.id, req.user.id);
  return response.success(res, null, result.message);
});

const contestLeaderboard = fnWrap(async (req, res) => {
  const result = await fnGetContestLeaderboard(req.params.id, req.query);
  return response.paginated(res, result.leaderboard, result.pagination);
});

const contestProblems = fnWrap(async (req, res) => {
  const problems = await fnGetContestProblems(req.params.id);
  return response.success(res, problems);
});

module.exports = {
  contestGetAll,
  contestGet,
  contestCreate,
  contestUpdate,
  contestJoin,
  contestLeaderboard,
  contestProblems,
};
