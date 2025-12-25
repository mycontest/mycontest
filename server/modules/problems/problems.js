/**
 * Problems Module
 * Services and Controllers
 */

const { dbQueryOne, dbQueryMany, dbTransaction } = require('../../utils/db');

// ================================================================
// SERVICES
// ================================================================

const fnGetAllProblems = async () => {
    const problems = await dbQueryMany(`
        SELECT * FROM vw_problem_stats
        ORDER BY problem_id DESC
    `);
    return problems;
};

const fnGetProblemById = async (problem_id) => {
    const problem = await dbQueryOne(`
        SELECT p.*, u.username as creator_username
        FROM problems p
        LEFT JOIN users u ON p.created_by = u.user_id
        WHERE p.problem_id = ? AND p.is_active = TRUE
    `, [problem_id]);

    if (!problem) {
        throw new Error('Problem not found');
    }

    const languages = await dbQueryMany(`
        SELECT pl.*, l.lang_name, l.lang_code, l.file_extension
        FROM problem_languages pl
        JOIN languages l ON pl.lang_id = l.lang_id
        WHERE pl.problem_id = ? AND l.is_active = TRUE
    `, [problem_id]);

    const samples = await dbQueryMany(`
        SELECT input_data, expected_output
        FROM test_cases
        WHERE problem_id = ? AND is_sample = TRUE
        ORDER BY test_order
    `, [problem_id]);

    return { ...problem, languages, samples };
};

const fnGetTestCases = async (problem_id) => {
    const test_cases = await dbQueryMany(`
        SELECT test_id, input_data, expected_output, points
        FROM test_cases
        WHERE problem_id = ?
        ORDER BY test_order
    `, [problem_id]);
    return test_cases;
};

const fnSubmitSolution = async (user_id, problem_id, lang_id, code_body, contest_id = null) => {
    const test_count = await dbQueryOne(
        'SELECT COUNT(*) as total FROM test_cases WHERE problem_id = ?',
        [problem_id]
    );

    const result = await dbQueryMany(`
        INSERT INTO submissions
        (user_id, problem_id, lang_id, code_body, contest_id, test_total, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [user_id, problem_id, lang_id, code_body, contest_id, test_count.total]);

    return {
        submission_id: result.insertId,
        test_total: test_count.total
    };
};

const fnGetSubmission = async (submission_id) => {
    const submission = await dbQueryOne(`
        SELECT s.*, p.title as problem_title, u.username, l.lang_name
        FROM submissions s
        JOIN problems p ON s.problem_id = p.problem_id
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN languages l ON s.lang_id = l.lang_id
        WHERE s.submission_id = ?
    `, [submission_id]);
    return submission;
};

const fnGetUserSubmissions = async (user_id, problem_id) => {
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
};

const fnUpdateSubmission = async (submission_id, status, test_passed, score, execution_time, error_message = null) => {
    await dbQueryMany(`
        UPDATE submissions
        SET status = ?, test_passed = ?, score = ?, execution_time = ?, error_message = ?
        WHERE submission_id = ?
    `, [status, test_passed, score, execution_time, error_message, submission_id]);
    return true;
};

const fnGetProblemsByDifficulty = async (difficulty) => {
    const problems = await dbQueryMany(`
        SELECT * FROM vw_problem_stats
        WHERE difficulty = ?
        ORDER BY problem_id DESC
    `, [difficulty]);
    return problems;
};

// ================================================================
// CONTROLLERS
// ================================================================

const problemsHome = async (req, res) => {
    const problems = await fnGetAllProblems();
    res.render('pages/home', {
        title: 'Home',
        problems
    });
};

const problemsList = async (req, res) => {
    const problems = await fnGetAllProblems();
    res.render('pages/problems', {
        title: 'Problems',
        problems
    });
};

const problemsView = async (req, res) => {
    const problem = await fnGetProblemById(req.params.id);
    res.render('pages/problem', {
        title: problem.title,
        problem
    });
};

const problemsSubmit = async (req, res) => {
    const { lang_id, code_body } = req.body;
    const result = await fnSubmitSolution(
        req.session.user.user_id,
        req.params.id,
        lang_id,
        code_body
    );
    res.redirect(`/submissions/${result.submission_id}`);
};

const problemsSubmissionView = async (req, res) => {
    const submission = await fnGetSubmission(req.params.id);
    res.render('pages/submission', {
        title: `Submission #${submission.submission_id}`,
        submission
    });
};

module.exports = {
    // Services
    fnGetAllProblems,
    fnGetProblemById,
    fnGetTestCases,
    fnSubmitSolution,
    fnGetSubmission,
    fnGetUserSubmissions,
    fnUpdateSubmission,
    fnGetProblemsByDifficulty,

    // Controllers
    problemsHome,
    problemsList,
    problemsView,
    problemsSubmit,
    problemsSubmissionView
};
