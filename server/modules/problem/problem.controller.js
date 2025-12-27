const { fnGetProblems, fnGetProblemById, fnCreateProblem, fnUpdateProblem, fnDeleteProblem, fnGetProblemSubmissions } = require("./problem.service");
const { fnWrap } = require("../../utils/utils");
const { response } = require("../../utils/response");
const { USER_ROLES } = require("../../utils/constants");

const problemGetAll = fnWrap(async (req, res) => {
  const result = await fnGetProblems(req.query);
  return response.paginated(res, result.problems, result.pagination);
});

const problemGet = fnWrap(async (req, res) => {
  const userId = req.user?.id || null;
  const problem = await fnGetProblemById(req.params.id, userId);
  return response.success(res, problem);
});

const problemCreate = fnWrap(async (req, res) => {
  const problem = await fnCreateProblem(req.body, req.user.id);
  return response.created(res, problem, "Problem created successfully");
});

const problemUpdate = fnWrap(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const problem = await fnUpdateProblem(req.params.id, req.body, req.user.id, isAdmin);
  return response.success(res, problem, "Problem updated successfully");
});

const problemDelete = fnWrap(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const result = await fnDeleteProblem(req.params.id, req.user.id, isAdmin);
  return response.success(res, null, result.message);
});

const problemSubmissions = fnWrap(async (req, res) => {
  const result = await fnGetProblemSubmissions(req.params.id, req.query);
  return response.paginated(res, result.submissions, result.pagination);
});

module.exports = {
  problemGetAll,
  problemGet,
  problemCreate,
  problemUpdate,
  problemDelete,
  problemSubmissions,
};
