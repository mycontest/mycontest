/**
 * Problems Service
 * Master Spec: Professional Code Judge & Contest Platform
 *
 * All functions use 'fn' prefix as per naming conventions
 */

const path = require('path');
const {
    fnExecuteTransaction,
    fnGetOne,
    fnGetAll,
    fnInsert
} = require('../../utils/mysql.db');

const {
    fnExtractZip,
    fnValidateZipStructure,
    fnParseConfig,
    fnReadTestCases,
    fnCleanupExtractedFiles
} = require('../../utils/zip.handler');

/**
 * Process ZIP file and save problem to database
 * Master Spec requirement: Extract ZIP, parse config.json, perform atomic INSERT operations
 *
 * @param {Buffer} file_buffer - ZIP file buffer
 * @param {number} user_id - ID of admin uploading the problem
 * @returns {Promise<Object>} Result with problem_id and status
 */
const fnProcessZipAndSave = async (file_buffer, user_id) => {
    const temp_extract_path = path.join(__dirname, '../../../temp', `upload_${Date.now()}`);

    try {
        // Step 1: Extract ZIP file
        await fnExtractZip(file_buffer, temp_extract_path);

        // Step 2: Validate ZIP structure
        const validation_result = await fnValidateZipStructure(temp_extract_path);

        // Step 3: Parse config.json
        const config = await fnParseConfig(validation_result.config_path);

        // Step 4: Read test case files
        const test_cases = await fnReadTestCases(
            validation_result.input_dir,
            validation_result.output_dir,
            validation_result.input_files,
            validation_result.output_files
        );

        // Step 5: Insert data into database using transaction
        const result = await fnExecuteTransaction(async (connection) => {
            // Insert problem
            const insert_problem_query = `
                INSERT INTO problems
                (title, slug, difficulty, problem_type, description, template_code, time_limit, memory_limit, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [problem_result] = await connection.execute(insert_problem_query, [
                config.title,
                config.slug,
                config.difficulty,
                config.problem_type,
                config.description,
                config.template_code,
                config.time_limit,
                config.memory_limit,
                user_id
            ]);

            const problem_id = problem_result.insertId;

            // Insert test cases
            const insert_test_case_query = `
                INSERT INTO test_cases
                (problem_id, input_data, expected_output, is_hidden, points_per_case, test_order)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            for (const test_case of test_cases) {
                await connection.execute(insert_test_case_query, [
                    problem_id,
                    test_case.input_data,
                    test_case.expected_output,
                    test_case.is_hidden,
                    config.points_per_case,
                    test_case.test_order
                ]);
            }

            return {
                problem_id,
                test_cases_count: test_cases.length
            };
        });

        // Step 6: Cleanup extracted files
        fnCleanupExtractedFiles(temp_extract_path);

        return {
            success: true,
            problem_id: result.problem_id,
            test_cases_count: result.test_cases_count,
            message: `Problem "${config.title}" uploaded successfully`
        };
    } catch (error) {
        // Cleanup on error
        fnCleanupExtractedFiles(temp_extract_path);

        console.error('fnProcessZipAndSave Error:', error.message);
        throw error;
    }
};

/**
 * Get all problems with pagination
 * @param {number} limit - Number of problems per page
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of problems
 */
const fnGetAllProblems = async (limit = 50, offset = 0) => {
    try {
        const query = `
            SELECT
                p.*,
                COUNT(tc.id) as test_case_count,
                COUNT(DISTINCT s.user_id) as total_attempts,
                COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count
            FROM problems p
            LEFT JOIN test_cases tc ON p.id = tc.problem_id
            LEFT JOIN submissions s ON p.id = s.problem_id
            WHERE p.is_active = TRUE
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        return await fnGetAll(query, [limit, offset]);
    } catch (error) {
        console.error('fnGetAllProblems Error:', error.message);
        throw error;
    }
};

/**
 * Get problem by ID with test cases
 * @param {number} problem_id - Problem ID
 * @returns {Promise<Object>} Problem with test cases
 */
const fnGetProblemById = async (problem_id) => {
    try {
        const problem_query = `
            SELECT
                p.*,
                u.username as creator_username
            FROM problems p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = ? AND p.is_active = TRUE
        `;

        const problem = await fnGetOne(problem_query, [problem_id]);

        if (!problem) {
            throw new Error('Problem not found');
        }

        // Get visible test cases (for user to see examples)
        const test_cases_query = `
            SELECT id, input_data, expected_output, points_per_case, test_order
            FROM test_cases
            WHERE problem_id = ? AND is_hidden = FALSE
            ORDER BY test_order
        `;

        const test_cases = await fnGetAll(test_cases_query, [problem_id]);

        return {
            ...problem,
            test_cases
        };
    } catch (error) {
        console.error('fnGetProblemById Error:', error.message);
        throw error;
    }
};

/**
 * Get all test cases for a problem (including hidden ones - for judge system)
 * @param {number} problem_id - Problem ID
 * @returns {Promise<Array>} Array of all test cases
 */
const fnGetAllTestCases = async (problem_id) => {
    try {
        const query = `
            SELECT *
            FROM test_cases
            WHERE problem_id = ?
            ORDER BY test_order
        `;

        return await fnGetAll(query, [problem_id]);
    } catch (error) {
        console.error('fnGetAllTestCases Error:', error.message);
        throw error;
    }
};

/**
 * Get problems by difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @returns {Promise<Array>} Array of problems
 */
const fnGetProblemsByDifficulty = async (difficulty) => {
    try {
        const query = `
            SELECT
                p.*,
                COUNT(tc.id) as test_case_count
            FROM problems p
            LEFT JOIN test_cases tc ON p.id = tc.problem_id
            WHERE p.difficulty = ? AND p.is_active = TRUE
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;

        return await fnGetAll(query, [difficulty]);
    } catch (error) {
        console.error('fnGetProblemsByDifficulty Error:', error.message);
        throw error;
    }
};

/**
 * Get problems by type
 * @param {string} problem_type - Problem type (python, sql, pandas, etc.)
 * @returns {Promise<Array>} Array of problems
 */
const fnGetProblemsByType = async (problem_type) => {
    try {
        const query = `
            SELECT
                p.*,
                COUNT(tc.id) as test_case_count
            FROM problems p
            LEFT JOIN test_cases tc ON p.id = tc.problem_id
            WHERE p.problem_type = ? AND p.is_active = TRUE
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;

        return await fnGetAll(query, [problem_type]);
    } catch (error) {
        console.error('fnGetProblemsByType Error:', error.message);
        throw error;
    }
};

/**
 * Search problems by title or slug
 * @param {string} search_term - Search term
 * @returns {Promise<Array>} Array of matching problems
 */
const fnSearchProblems = async (search_term) => {
    try {
        const query = `
            SELECT
                p.*,
                COUNT(tc.id) as test_case_count
            FROM problems p
            LEFT JOIN test_cases tc ON p.id = tc.problem_id
            WHERE (p.title LIKE ? OR p.slug LIKE ?) AND p.is_active = TRUE
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;

        const search_pattern = `%${search_term}%`;
        return await fnGetAll(query, [search_pattern, search_pattern]);
    } catch (error) {
        console.error('fnSearchProblems Error:', error.message);
        throw error;
    }
};

/**
 * Calculate user rating based on solved problems
 * @param {number} user_id - User ID
 * @returns {Promise<number>} Total rating/score
 */
const fnCalculateUserRating = async (user_id) => {
    try {
        const query = `
            SELECT
                COALESCE(SUM(score_earned), 0) as total_score
            FROM submissions
            WHERE user_id = ? AND status = 'accepted'
        `;

        const result = await fnGetOne(query, [user_id]);
        return result ? result.total_score : 0;
    } catch (error) {
        console.error('fnCalculateUserRating Error:', error.message);
        throw error;
    }
};

/**
 * Update user's total score
 * @param {number} user_id - User ID
 * @returns {Promise<boolean>} Success status
 */
const fnUpdateUserTotalScore = async (user_id) => {
    try {
        const total_score = await fnCalculateUserRating(user_id);

        const update_query = `
            UPDATE users
            SET total_score = ?
            WHERE id = ?
        `;

        await fnGetAll(update_query, [total_score, user_id]);
        return true;
    } catch (error) {
        console.error('fnUpdateUserTotalScore Error:', error.message);
        throw error;
    }
};

module.exports = {
    fnProcessZipAndSave,
    fnGetAllProblems,
    fnGetProblemById,
    fnGetAllTestCases,
    fnGetProblemsByDifficulty,
    fnGetProblemsByType,
    fnSearchProblems,
    fnCalculateUserRating,
    fnUpdateUserTotalScore
};
