/**
 * Discussions Service
 * Business logic for discussion/comment operations
 */

const { dbQueryOne, dbQueryMany } = require("../../utils/mysql");

/**
 * Check monthly comment limit for user
 */
const fnCheckCommentLimit = async (user_id) => {
  const month_year = new Date().toISOString().slice(0, 7); // YYYY-MM

  const limit_record = await dbQueryOne(
    "SELECT usage_count FROM monthly_limits WHERE user_id = ? AND limit_type = 'comments' AND month_year = ?",
    [user_id, month_year]
  );

  const current_usage = limit_record ? limit_record.usage_count : 0;
  const max_limit = 20; // Basic subscription limit

  return {
    current_usage,
    max_limit,
    can_comment: current_usage < max_limit,
    remaining: max_limit - current_usage,
  };
};

/**
 * Increment comment usage for user
 */
const fnIncrementCommentUsage = async (user_id) => {
  const month_year = new Date().toISOString().slice(0, 7);

  await dbQueryOne(
    `INSERT INTO monthly_limits (user_id, limit_type, usage_count, month_year)
     VALUES (?, 'comments', 1, ?)
     ON DUPLICATE KEY UPDATE usage_count = usage_count + 1`,
    [user_id, month_year]
  );
};

/**
 * Create new discussion/comment
 */
const fnCreateDiscussion = async (user_id, problem_id, content, parent_id = null) => {
  // Check comment limit
  const limit_check = await fnCheckCommentLimit(user_id);

  if (!limit_check.can_comment) {
    throw new Error(`Monthly comment limit reached (${limit_check.max_limit} comments per month)`);
  }

  // Create discussion
  const result = await dbQueryOne(
    `INSERT INTO discussions (user_id, problem_id, content, parent_id)
     VALUES (?, ?, ?, ?)`,
    [user_id, problem_id, content, parent_id]
  );

  // Increment usage
  await fnIncrementCommentUsage(user_id);

  return await dbQueryOne("SELECT * FROM discussions WHERE discussion_id = ?", [result.insertId]);
};

/**
 * Get discussions for a problem
 */
const fnGetProblemDiscussions = async (problem_id, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  // Get top-level discussions (no parent)
  const [discussions, count] = await Promise.all([
    dbQueryMany(
      `SELECT
        d.*,
        u.username,
        u.full_name,
        u.avatar_url,
        COUNT(r.discussion_id) as reply_count
      FROM discussions d
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN discussions r ON r.parent_id = d.discussion_id
      WHERE d.problem_id = ? AND d.parent_id IS NULL
      GROUP BY d.discussion_id
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?`,
      [problem_id, limit, offset]
    ),
    dbQueryOne("SELECT COUNT(*) as total FROM discussions WHERE problem_id = ? AND parent_id IS NULL", [problem_id]),
  ]);

  return {
    discussions,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

/**
 * Get replies for a discussion
 */
const fnGetDiscussionReplies = async (parent_id) => {
  return await dbQueryMany(
    `SELECT
      d.*,
      u.username,
      u.full_name,
      u.avatar_url
    FROM discussions d
    JOIN users u ON d.user_id = u.user_id
    WHERE d.parent_id = ?
    ORDER BY d.created_at ASC`,
    [parent_id]
  );
};

/**
 * Delete discussion (only by owner or admin)
 */
const fnDeleteDiscussion = async (discussion_id, user_id, is_admin = false) => {
  const discussion = await dbQueryOne("SELECT * FROM discussions WHERE discussion_id = ?", [discussion_id]);

  if (!discussion) {
    throw new Error("Discussion not found");
  }

  if (!is_admin && discussion.user_id !== user_id) {
    throw new Error("You don't have permission to delete this discussion");
  }

  await dbQueryOne("DELETE FROM discussions WHERE discussion_id = ?", [discussion_id]);
};

module.exports = {
  fnCheckCommentLimit,
  fnIncrementCommentUsage,
  fnCreateDiscussion,
  fnGetProblemDiscussions,
  fnGetDiscussionReplies,
  fnDeleteDiscussion,
};
