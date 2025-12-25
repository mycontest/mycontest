/**
 * Discussions Module
 * Services and Controllers
 */

const { dbQueryOne, dbQueryMany } = require('../../utils/db');

// ================================================================
// SERVICES
// ================================================================

const fnGetDiscussions = async (problem_id) => {
    const discussions = await dbQueryMany(`
        SELECT d.*, u.username, u.avatar_url,
               COUNT(r.discussion_id) as reply_count
        FROM discussions d
        JOIN users u ON d.user_id = u.user_id
        LEFT JOIN discussions r ON r.parent_id = d.discussion_id
        WHERE d.problem_id = ? AND d.parent_id IS NULL
        GROUP BY d.discussion_id
        ORDER BY d.created_at DESC
    `, [problem_id]);

    return discussions;
};

const fnGetDiscussionReplies = async (parent_id) => {
    const replies = await dbQueryMany(`
        SELECT d.*, u.username, u.avatar_url
        FROM discussions d
        JOIN users u ON d.user_id = u.user_id
        WHERE d.parent_id = ?
        ORDER BY d.created_at ASC
    `, [parent_id]);

    return replies;
};

const fnCreateDiscussion = async (user_id, problem_id, content, parent_id = null) => {
    const result = await dbQueryMany(`
        INSERT INTO discussions (user_id, problem_id, content, parent_id)
        VALUES (?, ?, ?, ?)
    `, [user_id, problem_id, content, parent_id]);

    return { discussion_id: result.insertId };
};

const fnDeleteDiscussion = async (discussion_id, user_id) => {
    const discussion = await dbQueryOne(
        'SELECT user_id FROM discussions WHERE discussion_id = ?',
        [discussion_id]
    );

    if (!discussion || discussion.user_id !== user_id) {
        throw new Error('Unauthorized');
    }

    await dbQueryMany('DELETE FROM discussions WHERE discussion_id = ?', [discussion_id]);
    return true;
};

// ================================================================
// CONTROLLERS
// ================================================================

const discussionsGet = async (req, res) => {
    const { problem_id } = req.params;
    const discussions = await fnGetDiscussions(problem_id);

    res.render('pages/discussions', {
        title: 'Discussions',
        problem_id,
        discussions
    });
};

const discussionsCreate = async (req, res) => {
    const { problem_id, content, parent_id } = req.body;

    await fnCreateDiscussion(
        req.session.user.user_id,
        problem_id,
        content,
        parent_id || null
    );

    res.redirect(`/problems/${problem_id}/discussions`);
};

const discussionsDelete = async (req, res) => {
    const { id } = req.params;

    await fnDeleteDiscussion(id, req.session.user.user_id);

    res.redirect('back');
};

module.exports = {
    // Services
    fnGetDiscussions,
    fnGetDiscussionReplies,
    fnCreateDiscussion,
    fnDeleteDiscussion,

    // Controllers
    discussionsGet,
    discussionsCreate,
    discussionsDelete
};
