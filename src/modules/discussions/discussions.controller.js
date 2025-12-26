/**
 * Discussions Controller
 * Handles HTTP requests for discussions/comments
 */

const {
  fnCreateDiscussion,
  fnGetProblemDiscussions,
  fnGetDiscussionReplies,
  fnDeleteDiscussion,
  fnCheckCommentLimit,
} = require("./discussions.service");
const { fnWrap } = require("../../utils");

/**
 * Create new discussion/comment
 */
const discussionCreate = fnWrap(async (req, res) => {
  const { problem_id } = req.params;
  const { content, parent_id } = req.body;

  await fnCreateDiscussion(req.session.user_id, problem_id, content, parent_id || null);

  req.flash("success_msg", "Comment posted successfully!");
  res.redirect(`/problems/${problem_id}#discussions`);
});

/**
 * Get problem discussions (AJAX)
 */
const discussionsList = fnWrap(async (req, res) => {
  const { problem_id } = req.params;
  const page = parseInt(req.query.page) || 1;

  const data = await fnGetProblemDiscussions(problem_id, page, 20);

  res.json({
    success: true,
    ...data,
  });
});

/**
 * Get discussion replies (AJAX)
 */
const discussionReplies = fnWrap(async (req, res) => {
  const { discussion_id } = req.params;

  const replies = await fnGetDiscussionReplies(discussion_id);

  res.json({
    success: true,
    replies,
  });
});

/**
 * Delete discussion
 */
const discussionDelete = fnWrap(async (req, res) => {
  const { discussion_id } = req.params;
  const is_admin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'organization');

  await fnDeleteDiscussion(discussion_id, req.session.user_id, is_admin);

  req.flash("success_msg", "Comment deleted successfully!");
  res.redirect("back");
});

/**
 * Get comment limit info (AJAX)
 */
const discussionLimitInfo = fnWrap(async (req, res) => {
  const limit_info = await fnCheckCommentLimit(req.session.user_id);

  res.json({
    success: true,
    ...limit_info,
  });
});

module.exports = {
  discussionCreate,
  discussionsList,
  discussionReplies,
  discussionDelete,
  discussionLimitInfo,
};
