/**
 * Problems Router
 * Master Spec: Professional Code Judge & Contest Platform
 *
 * Handles all problem-related routes
 */

const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');

const {
    controllerUploadProblem,
    controllerGetAllProblems,
    controllerGetProblem,
    controllerGetProblemsByDifficulty,
    controllerGetProblemsByType,
    controllerSearchProblems,
    controllerSubmitSolution,
    controllerGetSubmissionStatus,
    controllerGetUserSubmissions
} = require('./problems.controller');

// Middleware for file upload
router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    abortOnLimit: true
}));

// ============================================
// ADMIN ROUTES (Problem Management)
// ============================================

/**
 * POST /api/problems/upload
 * Upload a problem via ZIP file
 * Required: Admin authentication
 * Body: { zip_file: File }
 */
router.post('/upload', controllerUploadProblem);

// ============================================
// PUBLIC ROUTES (Problem Access)
// ============================================

/**
 * GET /api/problems
 * Get all problems with pagination
 * Query params: ?limit=50&offset=0
 */
router.get('/', controllerGetAllProblems);

/**
 * GET /api/problems/search
 * Search problems by title or slug
 * Query params: ?q=search_term
 */
router.get('/search', controllerSearchProblems);

/**
 * GET /api/problems/difficulty/:difficulty
 * Get problems by difficulty (easy, medium, hard)
 */
router.get('/difficulty/:difficulty', controllerGetProblemsByDifficulty);

/**
 * GET /api/problems/type/:type
 * Get problems by type (python, sql, pandas, cpp, java, javascript)
 */
router.get('/type/:type', controllerGetProblemsByType);

/**
 * GET /api/problems/:id
 * Get single problem by ID
 */
router.get('/:id', controllerGetProblem);

// ============================================
// SUBMISSION ROUTES
// ============================================

/**
 * POST /api/problems/submit
 * Submit a solution to a problem
 * Body: { problem_id, code_body, language, contest_id? }
 */
router.post('/submit', controllerSubmitSolution);

/**
 * GET /api/problems/submissions/:id
 * Get submission status by submission ID
 */
router.get('/submissions/:id', controllerGetSubmissionStatus);

/**
 * GET /api/problems/:problem_id/submissions
 * Get user's submissions for a specific problem
 */
router.get('/:problem_id/submissions', controllerGetUserSubmissions);

module.exports = router;
