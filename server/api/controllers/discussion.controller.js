const discussionService = require('../../services/discussion.service');
const ApiResponse = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const { USER_ROLES } = require('../../constants');

class DiscussionController {
  /**
   * Get all discussions (general chat or problem-specific)
   */
  getDiscussions = asyncHandler(async (req, res) => {
    const result = await discussionService.getDiscussions(req.query);
    return ApiResponse.paginated(res, result.discussions, result.pagination);
  });

  /**
   * Get discussion by ID
   */
  getDiscussionById = asyncHandler(async (req, res) => {
    const discussion = await discussionService.getDiscussionById(req.params.id);
    return ApiResponse.success(res, discussion);
  });

  /**
   * Create new discussion/comment
   */
  createDiscussion = asyncHandler(async (req, res) => {
    const discussion = await discussionService.createDiscussion(req.body, req.user.id);
    return ApiResponse.created(res, discussion, 'Discussion created successfully');
  });

  /**
   * Update discussion
   */
  updateDiscussion = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const discussion = await discussionService.updateDiscussion(
      req.params.id,
      req.body,
      req.user.id,
      isAdmin
    );
    return ApiResponse.success(res, discussion, 'Discussion updated successfully');
  });

  /**
   * Delete discussion
   */
  deleteDiscussion = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const result = await discussionService.deleteDiscussion(req.params.id, req.user.id, isAdmin);
    return ApiResponse.success(res, null, result.message);
  });

  /**
   * Get problem discussions
   */
  getProblemDiscussions = asyncHandler(async (req, res) => {
    const result = await discussionService.getProblemDiscussions(req.params.problemId, req.query);
    return ApiResponse.paginated(res, result.discussions, result.pagination);
  });
}

module.exports = new DiscussionController();
