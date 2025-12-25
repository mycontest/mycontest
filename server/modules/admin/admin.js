/**
 * Admin Module
 * Services and Controllers
 */

const { dbQueryOne, dbQueryMany, dbTransaction } = require('../../utils/db');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

// ================================================================
// SERVICES
// ================================================================

const fnCreateProblem = async (problem_data, test_zip_buffer) => {
    const temp_path = path.join(__dirname, '../../../temp', `upload_${Date.now()}`);

    const {
        title,
        slug,
        difficulty,
        description,
        input_format,
        output_format,
        constraints,
        time_limit,
        memory_limit,
        created_by
    } = problem_data;

    // Extract test cases ZIP
    const zip = new AdmZip(test_zip_buffer);
    zip.extractAllTo(temp_path, true);

    // Read input/output files
    const input_dir = path.join(temp_path, 'input');
    const output_dir = path.join(temp_path, 'output');

    if (!fs.existsSync(input_dir) || !fs.existsSync(output_dir)) {
        fs.rmSync(temp_path, { recursive: true, force: true });
        throw new Error('ZIP must contain input/ and output/ folders');
    }

    const input_files = fs.readdirSync(input_dir).filter(f => f.endsWith('.txt')).sort();
    const output_files = fs.readdirSync(output_dir).filter(f => f.endsWith('.txt')).sort();

    if (input_files.length !== output_files.length) {
        fs.rmSync(temp_path, { recursive: true, force: true });
        throw new Error('Input and output files count mismatch');
    }

    if (input_files.length === 0) {
        fs.rmSync(temp_path, { recursive: true, force: true });
        throw new Error('No test cases found');
    }

    // Create problem with transaction
    const result = await dbTransaction(async (conn) => {
        const [problem_result] = await conn.execute(`
            INSERT INTO problems
            (title, slug, difficulty, description, input_format, output_format,
             constraints, time_limit, memory_limit, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, slug, difficulty, description, input_format, output_format,
            constraints, time_limit, memory_limit, created_by]);

        const problem_id = problem_result.insertId;

        // Insert test cases
        for (let i = 0; i < input_files.length; i++) {
            const input_data = fs.readFileSync(path.join(input_dir, input_files[i]), 'utf-8').trim();
            const expected_output = fs.readFileSync(path.join(output_dir, output_files[i]), 'utf-8').trim();
            const is_sample = i < 2;
            const points = 10;

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
};

const fnAddProblemLanguage = async (problem_id, lang_id, template_code) => {
    await dbQueryMany(`
        INSERT INTO problem_languages (problem_id, lang_id, template_code)
        VALUES (?, ?, ?)
    `, [problem_id, lang_id, template_code]);
    return true;
};

const fnAddLanguage = async (lang_data) => {
    const { lang_name, lang_code, file_extension, compile_command, run_command } = lang_data;

    const result = await dbQueryMany(`
        INSERT INTO languages
        (lang_name, lang_code, file_extension, compile_command, run_command)
        VALUES (?, ?, ?, ?, ?)
    `, [lang_name, lang_code, file_extension, compile_command || null, run_command]);

    return { lang_id: result.insertId };
};

const fnGetAllLanguages = async () => {
    const languages = await dbQueryMany('SELECT * FROM languages ORDER BY lang_name');
    return languages;
};

const fnToggleLanguage = async (lang_id) => {
    await dbQueryMany('UPDATE languages SET is_active = NOT is_active WHERE lang_id = ?', [lang_id]);
    return true;
};

const fnGetAllUsers = async () => {
    const users = await dbQueryMany(`
        SELECT user_id, username, email, full_name, role, subscription, total_score, created_at
        FROM users
        ORDER BY created_at DESC
    `);
    return users;
};

const fnUpdateUserRole = async (user_id, role) => {
    await dbQueryMany('UPDATE users SET role = ? WHERE user_id = ?', [role, user_id]);
    return true;
};

const fnDeleteProblem = async (problem_id) => {
    await dbQueryMany('UPDATE problems SET is_active = FALSE WHERE problem_id = ?', [problem_id]);
    return true;
};

const fnGetDashboardStats = async () => {
    const stats = {};

    const users = await dbQueryOne('SELECT COUNT(*) as total FROM users');
    stats.total_users = users.total;

    const problems = await dbQueryOne('SELECT COUNT(*) as total FROM problems WHERE is_active = TRUE');
    stats.total_problems = problems.total;

    const submissions = await dbQueryOne('SELECT COUNT(*) as total FROM submissions');
    stats.total_submissions = submissions.total;

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
};

// ================================================================
// CONTROLLERS
// ================================================================

const adminDashboard = async (req, res) => {
    const stats = await fnGetDashboardStats();
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats
    });
};

const adminProblems = async (req, res) => {
    const { fnGetAllProblems } = require('../problems/problems');
    const problems = await fnGetAllProblems();
    res.render('admin/problems', {
        title: 'Manage Problems',
        problems
    });
};

const adminProblemCreateForm = async (req, res) => {
    const languages = await fnGetAllLanguages();
    res.render('admin/problem-create', {
        title: 'Create Problem',
        languages,
        error: null
    });
};

const adminProblemCreate = async (req, res) => {
    if (!req.files || !req.files.test_zip) {
        const languages = await fnGetAllLanguages();
        return res.render('admin/problem-create', {
            title: 'Create Problem',
            languages,
            error: 'No test cases ZIP file uploaded'
        });
    }

    const {
        title,
        difficulty,
        description,
        input_format,
        output_format,
        constraints,
        time_limit,
        memory_limit,
        lang_ids,
        templates
    } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const result = await fnCreateProblem({
        title,
        slug,
        difficulty,
        description: description || '',
        input_format: input_format || '',
        output_format: output_format || '',
        constraints: constraints || '',
        time_limit: parseInt(time_limit) || 1000,
        memory_limit: parseInt(memory_limit) || 256,
        created_by: req.session.user.user_id
    }, req.files.test_zip.data);

    // Add language templates
    const lang_id_array = Array.isArray(lang_ids) ? lang_ids : [lang_ids];
    const templates_array = Array.isArray(templates) ? templates : [templates];

    for (let i = 0; i < lang_id_array.length; i++) {
        if (lang_id_array[i] && templates_array[i]) {
            await fnAddProblemLanguage(result.problem_id, lang_id_array[i], templates_array[i]);
        }
    }

    res.redirect('/admin/problems');
};

const adminLanguages = async (req, res) => {
    const languages = await fnGetAllLanguages();
    res.render('admin/languages', {
        title: 'Manage Languages',
        languages
    });
};

const adminLanguageAdd = async (req, res) => {
    await fnAddLanguage(req.body);
    res.redirect('/admin/languages');
};

const adminLanguageToggle = async (req, res) => {
    await fnToggleLanguage(req.params.id);
    res.redirect('/admin/languages');
};

const adminUsers = async (req, res) => {
    const users = await fnGetAllUsers();
    res.render('admin/users', {
        title: 'Manage Users',
        users
    });
};

module.exports = {
    // Services
    fnCreateProblem,
    fnAddProblemLanguage,
    fnAddLanguage,
    fnGetAllLanguages,
    fnToggleLanguage,
    fnGetAllUsers,
    fnUpdateUserRole,
    fnDeleteProblem,
    fnGetDashboardStats,

    // Controllers
    adminDashboard,
    adminProblems,
    adminProblemCreateForm,
    adminProblemCreate,
    adminLanguages,
    adminLanguageAdd,
    adminLanguageToggle,
    adminUsers
};
