/**
 * Problems Controller
 * Master Spec: Professional Code Judge & Contest Platform
 *
 * All controllers use 'controller' prefix as per naming conventions
 */

const {
    fnProcessZipAndSave,
    fnGetAllProblems,
    fnGetProblemById,
    fnGetAllTestCases,
    fnGetProblemsByDifficulty,
    fnGetProblemsByType,
    fnSearchProblems
} = require('./problems.service');

const { fnInsert, fnGetOne } = require('../../utils/mysql.db');

/**
 * Upload problem via ZIP file (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerUploadProblem = async (req, res) => {
    try {
        // Check if file exists
        if (!req.files || !req.files.zip_file) {
            return res.status(400).json({
                success: false,
                message: 'No ZIP file uploaded'
            });
        }

        const zip_file = req.files.zip_file;

        // Validate file type
        if (!zip_file.name.endsWith('.zip')) {
            return res.status(400).json({
                success: false,
                message: 'Only ZIP files are allowed'
            });
        }

        // Get user ID from session
        const user_id = req.session.user?.id || req.user?.id;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Process ZIP and save to database
        const result = await fnProcessZipAndSave(zip_file.data, user_id);

        return res.status(200).json(result);
    } catch (error) {
        console.error('controllerUploadProblem Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all problems with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerGetAllProblems = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const problems = await fnGetAllProblems(limit, offset);

        return res.status(200).json({
            success: true,
            count: problems.length,
            problems
        });
    } catch (error) {
        console.error('controllerGetAllProblems Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get single problem by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerGetProblem = async (req, res) => {
    try {
        const problem_id = parseInt(req.params.id);

        if (!problem_id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid problem ID'
            });
        }

        const problem = await fnGetProblemById(problem_id);

        return res.status(200).json({
            success: true,
            problem
        });
    } catch (error) {
        console.error('controllerGetProblem Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get problems by difficulty
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerGetProblemsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;

        const valid_difficulties = ['easy', 'medium', 'hard'];
        if (!valid_difficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid difficulty. Must be: easy, medium, or hard'
            });
        }

        const problems = await fnGetProblemsByDifficulty(difficulty);

        return res.status(200).json({
            success: true,
            count: problems.length,
            problems
        });
    } catch (error) {
        console.error('controllerGetProblemsByDifficulty Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get problems by type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerGetProblemsByType = async (req, res) => {
    try {
        const { type } = req.params;

        const valid_types = ['python', 'sql', 'pandas', 'cpp', 'java', 'javascript'];
        if (!valid_types.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid type. Must be one of: ${valid_types.join(', ')}`
            });
        }

        const problems = await fnGetProblemsByType(type);

        return res.status(200).json({
            success: true,
            count: problems.length,
            problems
        });
    } catch (error) {
        console.error('controllerGetProblemsByType Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Search problems
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerSearchProblems = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search term must be at least 2 characters'
            });
        }

        const problems = await fnSearchProblems(q.trim());

        return res.status(200).json({
            success: true,
            count: problems.length,
            problems
        });
    } catch (error) {
        console.error('controllerSearchProblems Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Submit solution to a problem
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerSubmitSolution = async (req, res) => {
    try {
        const { problem_id, code_body, language, contest_id } = req.body;

        // Validate input
        if (!problem_id || !code_body || !language) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: problem_id, code_body, language'
            });
        }

        // Get user ID from session
        const user_id = req.session.user?.id || req.user?.id;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Verify problem exists
        const problem = await fnGetProblemById(problem_id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Get all test cases (including hidden ones)
        const test_cases = await fnGetAllTestCases(problem_id);

        // Create submission record
        const insert_query = `
            INSERT INTO submissions
            (user_id, problem_id, contest_id, code_body, language, test_total, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `;

        const result = await fnInsert(insert_query, [
            user_id,
            problem_id,
            contest_id || null,
            code_body,
            language,
            test_cases.length
        ]);

        const submission_id = result.insertId;

        // Return submission ID for client to track execution
        return res.status(200).json({
            success: true,
            submission_id,
            message: 'Submission received. Execution in progress...',
            test_total: test_cases.length
        });

        // Note: Actual code execution should be handled asynchronously
        // by a separate judge system/worker that processes the submission queue
    } catch (error) {
        console.error('controllerSubmitSolution Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get submission status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerGetSubmissionStatus = async (req, res) => {
    try {
        const submission_id = parseInt(req.params.id);

        if (!submission_id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });
        }

        const query = `
            SELECT
                s.*,
                p.title as problem_title,
                u.username
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `;

        const submission = await fnGetOne(query, [submission_id]);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        return res.status(200).json({
            success: true,
            submission
        });
    } catch (error) {
        console.error('controllerGetSubmissionStatus Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get user's submissions for a problem
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const controllerGetUserSubmissions = async (req, res) => {
    try {
        const problem_id = parseInt(req.params.problem_id);
        const user_id = req.session.user?.id || req.user?.id;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const query = `
            SELECT
                id,
                status,
                language,
                execution_time,
                memory_used,
                score_earned,
                test_passed,
                test_total,
                submitted_at
            FROM submissions
            WHERE user_id = ? AND problem_id = ?
            ORDER BY submitted_at DESC
            LIMIT 20
        `;

        const submissions = await fnGetAll(query, [user_id, problem_id]);

        return res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (error) {
        console.error('controllerGetUserSubmissions Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    controllerUploadProblem,
    controllerGetAllProblems,
    controllerGetProblem,
    controllerGetProblemsByDifficulty,
    controllerGetProblemsByType,
    controllerSearchProblems,
    controllerSubmitSolution,
    controllerGetSubmissionStatus,
    controllerGetUserSubmissions
};
