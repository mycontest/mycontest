/**
 * Problems Service
 * Handles problem management and submissions
 */

const { dbQueryOne, dbQueryMany, dbTransaction } = require('../../utils/db');

/**
 * Get all problems with statistics
 */
const fnGetAllProblemsService = async () => {
    try {
        const problems = await dbQueryMany(`
            SELECT * FROM vw_problem_stats
            ORDER BY problem_id DESC
        `);

        return problems;
    } catch (error) {
        throw error;
    }
};

/**
 * Get problem by ID with languages and sample test cases
 */
const fnGetProblemByIdService = async (problem_id) => {
    try {
        // Get problem details
        const problem = await dbQueryOne(`
            SELECT p.*, u.username as creator_username
            FROM problems p
            LEFT JOIN users u ON p.created_by = u.user_id
            WHERE p.problem_id = ? AND p.is_active = TRUE
        `, [problem_id]);

        if (!problem) {
            throw new Error('Problem not found');
        }

        // Get available languages for this problem
        const languages = await dbQueryMany(`
            SELECT pl.*, l.lang_name, l.lang_code, l.file_extension
            FROM problem_languages pl
            JOIN languages l ON pl.lang_id = l.lang_id
            WHERE pl.problem_id = ? AND l.is_active = TRUE
        `, [problem_id]);

        // Get sample test cases
        const samples = await dbQueryMany(`
            SELECT input_data, expected_output
            FROM test_cases
            WHERE problem_id = ? AND is_sample = TRUE
            ORDER BY test_order
        `, [problem_id]);

        return {
            ...problem,
            languages,
            samples
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all test cases for problem (for judging)
 */
const fnGetTestCasesService = async (problem_id) => {
    try {
        const test_cases = await dbQueryMany(`
            SELECT test_id, input_data, expected_output, points
            FROM test_cases
            WHERE problem_id = ?
            ORDER BY test_order
        `, [problem_id]);

        return test_cases;
    } catch (error) {
        throw error;
    }
};

/**
 * Submit solution
 */
const fnSubmitSolutionService = async (user_id, problem_id, lang_id, code_body, contest_id = null) => {
    try {
        // Get test cases count
        const test_count = await dbQueryOne(`
            SELECT COUNT(*) as total FROM test_cases WHERE problem_id = ?
        `, [problem_id]);

        // Insert submission
        const result = await dbQueryMany(`
            INSERT INTO submissions
            (user_id, problem_id, lang_id, code_body, contest_id, test_total, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [user_id, problem_id, lang_id, code_body, contest_id, test_count.total]);

        return {
            submission_id: result.insertId,
            test_total: test_count.total
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get submission by ID
 */
const fnGetSubmissionService = async (submission_id) => {
    try {
        const submission = await dbQueryOne(`
            SELECT s.*, p.title as problem_title, u.username, l.lang_name
            FROM submissions s
            JOIN problems p ON s.problem_id = p.problem_id
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN languages l ON s.lang_id = l.lang_id
            WHERE s.submission_id = ?
        `, [submission_id]);

        return submission;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user submissions for problem
 */
const fnGetUserSubmissionsService = async (user_id, problem_id) => {
    try {
        const submissions = await dbQueryMany(`
            SELECT s.submission_id, s.status, s.score, s.test_passed, s.test_total,
                   s.execution_time, s.submitted_at, l.lang_name
            FROM submissions s
            LEFT JOIN languages l ON s.lang_id = l.lang_id
            WHERE s.user_id = ? AND s.problem_id = ?
            ORDER BY s.submitted_at DESC
            LIMIT 20
        `, [user_id, problem_id]);

        return submissions;
    } catch (error) {
        throw error;
    }
};

/**
 * Update submission status (after judging)
 */
const fnUpdateSubmissionService = async (submission_id, status, test_passed, score, execution_time, error_message = null) => {
    try {
        const query = `
            UPDATE submissions
            SET status = ?, test_passed = ?, score = ?, execution_time = ?, error_message = ?
            WHERE submission_id = ?
        `;

        await dbQueryMany(query, [status, test_passed, score, execution_time, error_message, submission_id]);

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get problems by difficulty
 */
const fnGetProblemsByDifficultyService = async (difficulty) => {
    try {
        const problems = await dbQueryMany(`
            SELECT * FROM vw_problem_stats
            WHERE difficulty = ?
            ORDER BY problem_id DESC
        `, [difficulty]);

        return problems;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    fnGetAllProblemsService,
    fnGetProblemByIdService,
    fnGetTestCasesService,
    fnSubmitSolutionService,
    fnGetSubmissionService,
    fnGetUserSubmissionsService,
    fnUpdateSubmissionService,
    fnGetProblemsByDifficultyService
};
