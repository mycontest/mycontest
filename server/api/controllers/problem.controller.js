const problemService = require('../../services/problem.service');
const ApiResponse = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const { USER_ROLES } = require('../../constants');

class ProblemController {
  /**
   * Get all problems
   */
  getProblems = asyncHandler(async (req, res) => {
    const result = await problemService.getProblems(req.query);
    return ApiResponse.paginated(res, result.problems, result.pagination);
  });

  /**
   * Get problem by ID
   */
  getProblemById = asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const problem = await problemService.getProblemById(req.params.id, userId);
    return ApiResponse.success(res, problem);
  });

  /**
   * Create new problem
   */
  createProblem = asyncHandler(async (req, res) => {
    const problem = await problemService.createProblem(req.body, req.user.id);
    return ApiResponse.created(res, problem, 'Problem created successfully');
  });

  /**
   * Update problem
   */
  updateProblem = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const problem = await problemService.updateProblem(
      req.params.id,
      req.body,
      req.user.id,
      isAdmin
    );
    return ApiResponse.success(res, problem, 'Problem updated successfully');
  });

  /**
   * Delete problem
   */
  deleteProblem = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const result = await problemService.deleteProblem(req.params.id, req.user.id, isAdmin);
    return ApiResponse.success(res, null, result.message);
  });

  /**
   * Get problem submissions
   */
  getProblemSubmissions = asyncHandler(async (req, res) => {
    const result = await problemService.getProblemSubmissions(req.params.id, req.query);
    return ApiResponse.paginated(res, result.submissions, result.pagination);
  });
}

module.exports = new ProblemController();
