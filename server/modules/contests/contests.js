/**
 * Contests Module
 * Services and Controllers
 */

const { dbQueryOne, dbQueryMany, dbTransaction } = require('../../utils/db');

// ================================================================
// SERVICES
// ================================================================

const fnGetAllContests = async () => {
    const contests = await dbQueryMany(`
        SELECT c.*, u.username as creator_name,
               COUNT(cp.problem_id) as problem_count,
               CASE
                   WHEN NOW() < c.start_time THEN 'upcoming'
                   WHEN NOW() BETWEEN c.start_time AND c.end_time THEN 'active'
                   ELSE 'ended'
               END as status
        FROM contests c
        LEFT JOIN users u ON c.creator_id = u.user_id
        LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
        WHERE c.is_public = TRUE
        GROUP BY c.contest_id
        ORDER BY c.start_time DESC
    `);
    return contests;
};

const fnGetContestById = async (contest_id) => {
    const contest = await dbQueryOne(`
        SELECT c.*, u.username as creator_name,
               CASE
                   WHEN NOW() < c.start_time THEN 'upcoming'
                   WHEN NOW() BETWEEN c.start_time AND c.end_time THEN 'active'
                   ELSE 'ended'
               END as status
        FROM contests c
        LEFT JOIN users u ON c.creator_id = u.user_id
        WHERE c.contest_id = ?
    `, [contest_id]);

    if (!contest) {
        throw new Error('Contest not found');
    }

    const problems = await dbQueryMany(`
        SELECT p.problem_id, p.title, p.difficulty, cp.problem_order, cp.bonus_points
        FROM contest_problems cp
        JOIN problems p ON cp.problem_id = p.problem_id
        WHERE cp.contest_id = ?
        ORDER BY cp.problem_order
    `, [contest_id]);

    return { ...contest, problems };
};

const fnCreateContest = async (contest_data) => {
    const { title, description, creator_id, is_public, start_time, end_time, problem_ids } = contest_data;

    const result = await dbTransaction(async (conn) => {
        const [contest_result] = await conn.execute(`
            INSERT INTO contests (title, description, creator_id, is_public, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [title, description, creator_id, is_public, start_time, end_time]);

        const contest_id = contest_result.insertId;

        if (problem_ids && problem_ids.length > 0) {
            for (let i = 0; i < problem_ids.length; i++) {
                await conn.execute(`
                    INSERT INTO contest_problems (contest_id, problem_id, problem_order)
                    VALUES (?, ?, ?)
                `, [contest_id, problem_ids[i], i + 1]);
            }
        }

        return { contest_id };
    });

    return result;
};

const fnGetContestLeaderboard = async (contest_id) => {
    const leaderboard = await dbQueryMany(`
        SELECT u.user_id, u.username, u.full_name,
               COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as solved,
               SUM(CASE WHEN s.status = 'accepted' THEN s.score ELSE 0 END) as total_score,
               MAX(s.submitted_at) as last_submission
        FROM users u
        LEFT JOIN submissions s ON u.user_id = s.user_id AND s.contest_id = ?
        WHERE u.role != 'admin'
        GROUP BY u.user_id
        HAVING solved > 0
        ORDER BY solved DESC, total_score DESC, last_submission ASC
    `, [contest_id]);

    return leaderboard;
};

// ================================================================
// CONTROLLERS
// ================================================================

const contestsList = async (req, res) => {
    const contests = await fnGetAllContests();
    res.render('pages/contests', {
        title: 'Contests',
        contests
    });
};

const contestsView = async (req, res) => {
    const contest = await fnGetContestById(req.params.id);
    const leaderboard = await fnGetContestLeaderboard(req.params.id);

    res.render('pages/contest', {
        title: contest.title,
        contest,
        leaderboard
    });
};

const contestsCreate = async (req, res) => {
    const { title, description, is_public, start_time, end_time, problem_ids } = req.body;

    await fnCreateContest({
        title,
        description,
        creator_id: req.session.user.user_id,
        is_public: is_public === 'true',
        start_time,
        end_time,
        problem_ids: problem_ids ? (Array.isArray(problem_ids) ? problem_ids : [problem_ids]) : []
    });

    res.redirect('/contests');
};

module.exports = {
    // Services
    fnGetAllContests,
    fnGetContestById,
    fnCreateContest,
    fnGetContestLeaderboard,

    // Controllers
    contestsList,
    contestsView,
    contestsCreate
};
