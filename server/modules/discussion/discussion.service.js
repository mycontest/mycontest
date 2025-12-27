const { dbQueryOne, dbQueryMany } = require("../../utils/mysql");
const { PAGINATION } = require("../../utils/constants");

const fnGetDiscussions = async ({ page = 1, limit = PAGINATION.DEFAULT_LIMIT, problem_id = null }) => {
  const offset = (page - 1) * limit;
  const where = ["d.parent_id IS NULL"];
  const params = [];

  if (problem_id) {
    where.push("d.problem_id = ?");
    params.push(problem_id);
  } else {
    where.push("d.problem_id IS NULL");
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [discussions, countResult] = await Promise.all([
    dbQueryMany(
      `
        SELECT d.discussion_id AS id, d.problem_id, d.parent_id, d.content, d.created_at,
               u.username, u.full_name, u.avatar_url,
               (SELECT COUNT(*) FROM discussions WHERE parent_id = d.discussion_id) AS replies_count
        FROM discussions d
        JOIN users u ON d.user_id = u.user_id
        ${whereClause}
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    ),
    dbQueryOne(`SELECT COUNT(*) AS total FROM discussions d ${whereClause}`, params),
  ]);

  return {
    discussions,
    pagination: {
      page,
      limit,
      total: countResult.total,
    },
  };
};

const fnGetDiscussionById = async (discussionId) => {
  const discussion = await dbQueryOne(
    `
      SELECT d.discussion_id AS id, d.problem_id, d.parent_id, d.content, d.created_at,
             u.username, u.full_name, u.avatar_url
      FROM discussions d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.discussion_id = ?
    `,
    [discussionId]
  );

  if (!discussion) {
    throw { statusCode: 404, message: "Discussion not found" };
  }

  const replies = await dbQueryMany(
    `
      SELECT d.discussion_id AS id, d.problem_id, d.parent_id, d.content, d.created_at,
             u.username, u.full_name, u.avatar_url
      FROM discussions d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.parent_id = ?
      ORDER BY d.created_at ASC
    `,
    [discussionId]
  );

  discussion.replies = replies;
  return discussion;
};

const fnCreateDiscussion = async (discussionData, userId) => {
  const { problem_id, parent_id, content } = discussionData;
  let resolvedProblemId = problem_id || null;

  if (parent_id) {
    const parent = await dbQueryOne("SELECT discussion_id, problem_id FROM discussions WHERE discussion_id = ?", [parent_id]);
    if (!parent) {
      throw { statusCode: 404, message: "Parent discussion not found" };
    }
    resolvedProblemId = parent.problem_id;
  }

  if (resolvedProblemId) {
    const exists = await dbQueryOne("SELECT problem_id FROM problems WHERE problem_id = ?", [resolvedProblemId]);
    if (!exists) {
      throw { statusCode: 404, message: "Problem not found" };
    }
  }

  const result = await dbQueryOne(
    `
      INSERT INTO discussions (user_id, problem_id, parent_id, content, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `,
    [userId, resolvedProblemId, parent_id || null, content]
  );

  return fnGetDiscussionById(result.insertId);
};

const fnUpdateDiscussion = async (discussionId, updates, userId, isAdmin = false) => {
  const discussion = await dbQueryOne("SELECT user_id FROM discussions WHERE discussion_id = ?", [discussionId]);

  if (!discussion) {
    throw { statusCode: 404, message: "Discussion not found" };
  }

  if (!isAdmin && discussion.user_id !== userId) {
    throw { statusCode: 403, message: "Not authorized to update this discussion" };
  }

  await dbQueryOne("UPDATE discussions SET content = ?, updated_at = NOW() WHERE discussion_id = ?", [updates.content, discussionId]);

  return fnGetDiscussionById(discussionId);
};

const fnDeleteDiscussion = async (discussionId, userId, isAdmin = false) => {
  const discussion = await dbQueryOne("SELECT user_id FROM discussions WHERE discussion_id = ?", [discussionId]);

  if (!discussion) {
    throw { statusCode: 404, message: "Discussion not found" };
  }

  if (!isAdmin && discussion.user_id !== userId) {
    throw { statusCode: 403, message: "Not authorized to delete this discussion" };
  }

  await dbQueryOne("DELETE FROM discussions WHERE discussion_id = ?", [discussionId]);
  return { message: "Discussion deleted successfully" };
};

const fnGetProblemDiscussions = async (problemId, { page = 1, limit = 20 }) => {
  return fnGetDiscussions({ page, limit, problem_id: problemId });
};

module.exports = {
  fnGetDiscussions,
  fnGetDiscussionById,
  fnCreateDiscussion,
  fnUpdateDiscussion,
  fnDeleteDiscussion,
  fnGetProblemDiscussions,
};
