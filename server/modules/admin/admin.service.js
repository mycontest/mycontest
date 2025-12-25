/**
 * Admin Service
 * Handles admin operations (problems, languages, etc.)
 */

const { dbQueryOne, dbQueryMany, dbTransaction } = require('../../utils/db');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

/**
 * Create new problem with ZIP upload
 * ZIP structure:
 * - config.json (title, difficulty, description, etc.)
 * - templates/ (python.py, javascript.js, etc.)
 * - tests/input/ (1.txt, 2.txt, ...)
 * - tests/output/ (1.txt, 2.txt, ...)
 */
const fnCreateProblemService = async (zip_buffer, creator_id) => {
    const temp_path = path.join(__dirname, '../../../temp', `upload_${Date.now()}`);

    try {
        // Extract ZIP
        const zip = new AdmZip(zip_buffer);
        zip.extractAllTo(temp_path, true);

        // Read config.json
        const config_path = path.join(temp_path, 'config.json');
        if (!fs.existsSync(config_path)) {
            throw new Error('config.json not found in ZIP');
        }

        const config = JSON.parse(fs.readFileSync(config_path, 'utf-8'));

        // Validate config
        if (!config.title || !config.difficulty) {
            throw new Error('Missing required fields in config.json');
        }

        // Create slug from title
        const slug = config.slug || config.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Read test cases
        const tests_input_path = path.join(temp_path, 'tests', 'input');
        const tests_output_path = path.join(temp_path, 'tests', 'output');

        if (!fs.existsSync(tests_input_path) || !fs.existsSync(tests_output_path)) {
            throw new Error('tests/input or tests/output folders not found');
        }

        const input_files = fs.readdirSync(tests_input_path)
            .filter(f => f.endsWith('.txt'))
            .sort();
        const output_files = fs.readdirSync(tests_output_path)
            .filter(f => f.endsWith('.txt'))
            .sort();

        if (input_files.length !== output_files.length) {
            throw new Error('Input and output files count mismatch');
        }

        if (input_files.length === 0) {
            throw new Error('No test cases found');
        }

        // Read templates
        const templates_path = path.join(temp_path, 'templates');
        let templates = {};

        if (fs.existsSync(templates_path)) {
            const template_files = fs.readdirSync(templates_path);
            for (const file of template_files) {
                const ext = path.extname(file).substring(1); // Remove dot
                const content = fs.readFileSync(path.join(templates_path, file), 'utf-8');
                templates[ext] = content;
            }
        }

        // Create problem in database with transaction
        const result = await dbTransaction(async (conn) => {
            // Insert problem
            const [problem_result] = await conn.execute(`
                INSERT INTO problems
                (title, slug, difficulty, description, input_format, output_format,
                 constraints, time_limit, memory_limit, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                config.title,
                slug,
                config.difficulty,
                config.description || '',
                config.input_format || '',
                config.output_format || '',
                config.constraints || '',
                config.time_limit || 1000,
                config.memory_limit || 256,
                creator_id
            ]);

            const problem_id = problem_result.insertId;

            // Insert templates for each language
            if (Object.keys(templates).length > 0) {
                for (const [ext, template_code] of Object.entries(templates)) {
                    // Find language by file extension
                    const [lang] = await conn.execute(
                        'SELECT lang_id FROM languages WHERE file_extension = ? AND is_active = TRUE',
                        [ext]
                    );

                    if (lang.length > 0) {
                        await conn.execute(`
                            INSERT INTO problem_languages (problem_id, lang_id, template_code)
                            VALUES (?, ?, ?)
                        `, [problem_id, lang[0].lang_id, template_code]);
                    }
                }
            }

            // Insert test cases
            for (let i = 0; i < input_files.length; i++) {
                const input_data = fs.readFileSync(
                    path.join(tests_input_path, input_files[i]),
                    'utf-8'
                ).trim();

                const expected_output = fs.readFileSync(
                    path.join(tests_output_path, output_files[i]),
                    'utf-8'
                ).trim();

                const is_sample = i < 2; // First 2 are samples
                const points = config.points_per_case || 10;

                await conn.execute(`
                    INSERT INTO test_cases
                    (problem_id, input_data, expected_output, is_sample, points, test_order)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [problem_id, input_data, expected_output, is_sample, points, i + 1]);
            }

            return { problem_id, test_count: input_files.length };
        });

        // Cleanup
        fs.rmSync(temp_path, { recursive: true, force: true });

        return result;
    } catch (error) {
        // Cleanup on error
        if (fs.existsSync(temp_path)) {
            fs.rmSync(temp_path, { recursive: true, force: true });
        }
        throw error;
    }
};

/**
 * Add new language
 */
const fnAddLanguageService = async (lang_data) => {
    try {
        const { lang_name, lang_code, file_extension, compile_command, run_command } = lang_data;

        const result = await dbQueryMany(`
            INSERT INTO languages
            (lang_name, lang_code, file_extension, compile_command, run_command)
            VALUES (?, ?, ?, ?, ?)
        `, [lang_name, lang_code, file_extension, compile_command || null, run_command]);

        return { lang_id: result.insertId };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all languages
 */
const fnGetAllLanguagesService = async () => {
    try {
        const languages = await dbQueryMany(`
            SELECT * FROM languages
            ORDER BY lang_name
        `);

        return languages;
    } catch (error) {
        throw error;
    }
};

/**
 * Toggle language active status
 */
const fnToggleLanguageService = async (lang_id) => {
    try {
        await dbQueryMany(`
            UPDATE languages
            SET is_active = NOT is_active
            WHERE lang_id = ?
        `, [lang_id]);

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all users
 */
const fnGetAllUsersService = async () => {
    try {
        const users = await dbQueryMany(`
            SELECT user_id, username, email, full_name, role, subscription,
                   total_score, created_at
            FROM users
            ORDER BY created_at DESC
        `);

        return users;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user role
 */
const fnUpdateUserRoleService = async (user_id, role) => {
    try {
        await dbQueryMany(`
            UPDATE users
            SET role = ?
            WHERE user_id = ?
        `, [role, user_id]);

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete problem
 */
const fnDeleteProblemService = async (problem_id) => {
    try {
        await dbQueryMany(`
            UPDATE problems
            SET is_active = FALSE
            WHERE problem_id = ?
        `, [problem_id]);

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get dashboard statistics
 */
const fnGetDashboardStatsService = async () => {
    try {
        const stats = {};

        // Total users
        const users = await dbQueryOne('SELECT COUNT(*) as total FROM users');
        stats.total_users = users.total;

        // Total problems
        const problems = await dbQueryOne('SELECT COUNT(*) as total FROM problems WHERE is_active = TRUE');
        stats.total_problems = problems.total;

        // Total submissions
        const submissions = await dbQueryOne('SELECT COUNT(*) as total FROM submissions');
        stats.total_submissions = submissions.total;

        // Recent submissions
        stats.recent_submissions = await dbQueryMany(`
            SELECT s.submission_id, s.status, s.submitted_at,
                   u.username, p.title as problem_title, l.lang_name
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            JOIN problems p ON s.problem_id = p.problem_id
            LEFT JOIN languages l ON s.lang_id = l.lang_id
            ORDER BY s.submitted_at DESC
            LIMIT 10
        `);

        return stats;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    fnCreateProblemService,
    fnAddLanguageService,
    fnGetAllLanguagesService,
    fnToggleLanguageService,
    fnGetAllUsersService,
    fnUpdateUserRoleService,
    fnDeleteProblemService,
    fnGetDashboardStatsService
};
