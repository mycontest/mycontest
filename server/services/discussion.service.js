const { dbQueryOne, dbQueryMany } = require('../config/database');
const { PAGINATION } = require('../constants');

class DiscussionService {
  /**
   * Get all discussions (general chat)
   */
  async getDiscussions({ page = 1, limit = PAGINATION.DEFAULT_LIMIT, problem_id = null }) {
    const offset = (page - 1) * limit;
    let whereConditions = ['parent_id IS NULL'];
    let params = [];

    if (problem_id) {
      whereConditions.push('problem_id = ?');
      params.push(problem_id);
    } else {
      whereConditions.push('problem_id IS NULL');
    }

    const whereClause = whereConditions.join(' AND ');

    const [discussions, countResult] = await Promise.all([
      dbQueryMany(
        `SELECT d.*, u.username, u.full_name, u.avatar_url,
                (SELECT COUNT(*) FROM discussions WHERE parent_id = d.id) as replies_count
         FROM discussions d
         JOIN users u ON d.user_id = u.id
         WHERE ${whereClause}
         ORDER BY d.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      dbQueryOne(
        `SELECT COUNT(*) as total FROM discussions WHERE ${whereClause}`,
        params
      )
    ]);

    return {
      discussions,
      pagination: {
        page,
        limit,
        total: countResult.total
      }
    };
  }

  /**
   * Get discussion by ID with replies
   */
  async getDiscussionById(discussionId) {
    const discussion = await dbQueryOne(
      `SELECT d.*, u.username, u.full_name, u.avatar_url
       FROM discussions d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [discussionId]
    );

    if (!discussion) {
      throw { statusCode: 404, message: 'Discussion not found' };
    }

    // Get replies
    const replies = await dbQueryMany(
      `SELECT d.*, u.username, u.full_name, u.avatar_url
       FROM discussions d
       JOIN users u ON d.user_id = u.id
       WHERE d.parent_id = ?
       ORDER BY d.created_at ASC`,
      [discussionId]
    );

    discussion.replies = replies;

    return discussion;
  }

  /**
   * Create new discussion/comment
   */
  async createDiscussion(discussionData, userId) {
    const { problem_id, parent_id, content } = discussionData;

    // If it's a reply, verify parent exists
    if (parent_id) {
      const parent = await dbQueryOne(
        'SELECT id, problem_id FROM discussions WHERE id = ?',
        [parent_id]
      );

      if (!parent) {
        throw { statusCode: 404, message: 'Parent discussion not found' };
      }

      // Inherit problem_id from parent
      discussionData.problem_id = parent.problem_id;
    }

    // If problem_id is provided, verify problem exists
    if (problem_id) {
      const problem = await dbQueryOne(
        'SELECT id FROM problems WHERE id = ?',
        [problem_id]
      );

      if (!problem) {
        throw { statusCode: 404, message: 'Problem not found' };
      }
    }

    const result = await dbQueryOne(
      `INSERT INTO discussions (user_id, problem_id, parent_id, content, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, discussionData.problem_id || null, parent_id || null, content]
    );

    return this.getDiscussionById(result.insertId);
  }

  /**
   * Update discussion
   */
  async updateDiscussion(discussionId, updates, userId, isAdmin = false) {
    const discussion = await dbQueryOne(
      'SELECT user_id FROM discussions WHERE id = ?',
      [discussionId]
    );

    if (!discussion) {
      throw { statusCode: 404, message: 'Discussion not found' };
    }

    // Check permission
    if (!isAdmin && discussion.user_id !== userId) {
      throw { statusCode: 403, message: 'Not authorized to update this discussion' };
    }

    await dbQueryOne(
      'UPDATE discussions SET content = ?, updated_at = NOW() WHERE id = ?',
      [updates.content, discussionId]
    );

    return this.getDiscussionById(discussionId);
  }

  /**
   * Delete discussion
   */
  async deleteDiscussion(discussionId, userId, isAdmin = false) {
    const discussion = await dbQueryOne(
      'SELECT user_id FROM discussions WHERE id = ?',
      [discussionId]
    );

    if (!discussion) {
      throw { statusCode: 404, message: 'Discussion not found' };
    }

    // Check permission
    if (!isAdmin && discussion.user_id !== userId) {
      throw { statusCode: 403, message: 'Not authorized to delete this discussion' };
    }

    // Delete discussion and all replies (CASCADE should handle this)
    await dbQueryOne('DELETE FROM discussions WHERE id = ?', [discussionId]);

    return { message: 'Discussion deleted successfully' };
  }

  /**
   * Get problem discussions
   */
  async getProblemDiscussions(problemId, { page = 1, limit = 20 }) {
    return this.getDiscussions({ page, limit, problem_id: problemId });
  }
}

module.exports = new DiscussionService();
