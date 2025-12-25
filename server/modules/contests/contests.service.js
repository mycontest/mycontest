/**
 * Contests Service
 * Database operations for contests
 */

const { dbQueryOne, dbQueryMany } = require('../../utils/mysql');

const fnGetAllContests = async () => {
    return await dbQueryMany(`
        SELECT
            c.contest_id,
            c.title,
            c.description,
            c.start_time,
            c.end_time,
            c.status,
            c.created_by,
            COUNT(DISTINCT cp.problem_id) as problem_count,
            COUNT(DISTINCT cs.user_id) as participant_count
        FROM contests c
        LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
        LEFT JOIN contest_submissions cs ON c.contest_id = cs.contest_id
        GROUP BY c.contest_id
        ORDER BY c.start_time DESC
    `);
};

const fnGetContestById = async (contest_id) => {
    const contest = await dbQueryOne(`
        SELECT
            c.*,
            u.username as creator_name
        FROM contests c
        LEFT JOIN users u ON c.created_by = u.user_id
        WHERE c.contest_id = ?
    `, [contest_id]);

    if (!contest) {
        throw new Error('Contest not found');
    }

    const problems = await dbQueryMany(`
        SELECT
            p.problem_id,
            p.title,
            p.slug,
            p.difficulty,
            cp.points,
            COUNT(DISTINCT s.submission_id) as total_submissions,
            COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count
        FROM contest_problems cp
        JOIN problems p ON cp.problem_id = p.problem_id
        LEFT JOIN submissions s ON p.problem_id = s.problem_id
        WHERE cp.contest_id = ?
        GROUP BY p.problem_id
        ORDER BY cp.problem_order
    `, [contest_id]);

    return {
        ...contest,
        problems
    };
};

const fnGetContestLeaderboard = async (contest_id) => {
    return await dbQueryMany(`
        SELECT
            u.user_id,
            u.username,
            u.full_name,
            SUM(cs.score) as total_score,
            COUNT(DISTINCT cs.problem_id) as problems_solved,
            MAX(cs.submitted_at) as last_submission_time
        FROM contest_submissions cs
        JOIN users u ON cs.user_id = u.user_id
        WHERE cs.contest_id = ?
        GROUP BY u.user_id
        ORDER BY total_score DESC, last_submission_time ASC
        LIMIT 100
    `, [contest_id]);
};

module.exports = {
    fnGetAllContests,
    fnGetContestById,
    fnGetContestLeaderboard
};
