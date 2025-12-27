const { fnGetDiscussions, fnGetDiscussionById, fnCreateDiscussion, fnUpdateDiscussion, fnDeleteDiscussion, fnGetProblemDiscussions } = require("./discussion.service");
const { response, fnWrap } = require("../../utils");
const { USER_ROLES } = require("../../utils/constants");

const discussionGetAll = fnWrap(async (req, res) => {
  const result = await fnGetDiscussions(req.query);
  return response.paginated(res, result.discussions, result.pagination);
});

const discussionGet = fnWrap(async (req, res) => {
  const discussion = await fnGetDiscussionById(req.params.id);
  return response.success(res, discussion);
});

const discussionCreate = fnWrap(async (req, res) => {
  const discussion = await fnCreateDiscussion(req.body, req.user.id);
  return response.created(res, discussion, "Discussion created successfully");
});

const discussionUpdate = fnWrap(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const discussion = await fnUpdateDiscussion(req.params.id, req.body, req.user.id, isAdmin);
  return response.success(res, discussion, "Discussion updated successfully");
});

const discussionDelete = fnWrap(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const result = await fnDeleteDiscussion(req.params.id, req.user.id, isAdmin);
  return response.success(res, null, result.message);
});

const discussionProblem = fnWrap(async (req, res) => {
  const result = await fnGetProblemDiscussions(req.params.problemId, req.query);
  return response.paginated(res, result.discussions, result.pagination);
});

module.exports = {
  discussionGetAll,
  discussionGet,
  discussionCreate,
  discussionUpdate,
  discussionDelete,
  discussionProblem,
};
