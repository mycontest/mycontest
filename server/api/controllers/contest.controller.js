const contestService = require('../../services/contest.service');
const ApiResponse = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const { USER_ROLES } = require('../../constants');

class ContestController {
  /**
   * Get all contests
   */
  getContests = asyncHandler(async (req, res) => {
    const result = await contestService.getContests(req.query);
    return ApiResponse.paginated(res, result.contests, result.pagination);
  });

  /**
   * Get contest by ID
   */
  getContestById = asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const contest = await contestService.getContestById(req.params.id, userId);
    return ApiResponse.success(res, contest);
  });

  /**
   * Create new contest
   */
  createContest = asyncHandler(async (req, res) => {
    const contest = await contestService.createContest(req.body, req.user.id);
    return ApiResponse.created(res, contest, 'Contest created successfully');
  });

  /**
   * Update contest
   */
  updateContest = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const contest = await contestService.updateContest(
      req.params.id,
      req.body,
      req.user.id,
      isAdmin
    );
    return ApiResponse.success(res, contest, 'Contest updated successfully');
  });

  /**
   * Join contest
   */
  joinContest = asyncHandler(async (req, res) => {
    const result = await contestService.joinContest(req.params.id, req.user.id);
    return ApiResponse.success(res, null, result.message);
  });

  /**
   * Get contest leaderboard
   */
  getLeaderboard = asyncHandler(async (req, res) => {
    const result = await contestService.getContestLeaderboard(req.params.id, req.query);
    return ApiResponse.paginated(res, result.leaderboard, result.pagination);
  });

  /**
   * Get contest problems
   */
  getContestProblems = asyncHandler(async (req, res) => {
    const problems = await contestService.getContestProblems(req.params.id);
    return ApiResponse.success(res, problems);
  });
}

module.exports = new ContestController();
