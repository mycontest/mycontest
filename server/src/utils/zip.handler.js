/**
 * ZIP Handler Utility
 * Master Spec: Professional Code Judge & Contest Platform
 *
 * Handles ZIP file extraction and validation for task uploads
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

/**
 * Extract ZIP file to specified directory
 * @param {Buffer} file_buffer - ZIP file buffer
 * @param {string} extract_path - Path to extract files
 * @returns {Promise<Object>} Extraction result
 */
const fnExtractZip = async (file_buffer, extract_path) => {
    try {
        // Create extraction directory if it doesn't exist
        if (!fs.existsSync(extract_path)) {
            fs.mkdirSync(extract_path, { recursive: true });
        }

        // Extract ZIP
        const zip = new AdmZip(file_buffer);
        zip.extractAllTo(extract_path, true);

        return {
            success: true,
            path: extract_path,
            message: 'ZIP extracted successfully'
        };
    } catch (error) {
        console.error('ZIP Extraction Error:', error.message);
        throw new Error(`Failed to extract ZIP: ${error.message}`);
    }
};

/**
 * Validate ZIP structure according to Master Spec
 * Expected structure:
 * - config.json (required)
 * - /input folder with .txt files (required)
 * - /output folder with .txt files (required)
 *
 * @param {string} extract_path - Path where ZIP was extracted
 * @returns {Promise<Object>} Validation result
 */
const fnValidateZipStructure = async (extract_path) => {
    try {
        const config_path = path.join(extract_path, 'config.json');
        const input_dir = path.join(extract_path, 'input');
        const output_dir = path.join(extract_path, 'output');

        // Check config.json exists
        if (!fs.existsSync(config_path)) {
            throw new Error('config.json not found in ZIP');
        }

        // Check input directory exists
        if (!fs.existsSync(input_dir)) {
            throw new Error('input/ directory not found in ZIP');
        }

        // Check output directory exists
        if (!fs.existsSync(output_dir)) {
            throw new Error('output/ directory not found in ZIP');
        }

        // Read input files
        const input_files = fs.readdirSync(input_dir)
            .filter(file => file.endsWith('.txt'))
            .sort();

        // Read output files
        const output_files = fs.readdirSync(output_dir)
            .filter(file => file.endsWith('.txt'))
            .sort();

        // Validate matching input/output files
        if (input_files.length === 0) {
            throw new Error('No input files found in input/ directory');
        }

        if (output_files.length === 0) {
            throw new Error('No output files found in output/ directory');
        }

        if (input_files.length !== output_files.length) {
            throw new Error(`Mismatch: ${input_files.length} input files, ${output_files.length} output files`);
        }

        return {
            success: true,
            config_path,
            input_dir,
            output_dir,
            input_files,
            output_files,
            test_case_count: input_files.length
        };
    } catch (error) {
        console.error('ZIP Validation Error:', error.message);
        throw error;
    }
};

/**
 * Parse config.json from ZIP
 * @param {string} config_path - Path to config.json
 * @returns {Promise<Object>} Parsed config
 */
const fnParseConfig = async (config_path) => {
    try {
        const config_content = fs.readFileSync(config_path, 'utf-8');
        const config = JSON.parse(config_content);

        // Validate required fields
        const required_fields = ['title', 'problem_type', 'difficulty', 'time_limit', 'memory_limit'];
        const missing_fields = required_fields.filter(field => !config[field]);

        if (missing_fields.length > 0) {
            throw new Error(`Missing required fields in config.json: ${missing_fields.join(', ')}`);
        }

        // Validate problem_type
        const valid_types = ['python', 'sql', 'pandas', 'cpp', 'java', 'javascript'];
        if (!valid_types.includes(config.problem_type)) {
            throw new Error(`Invalid problem_type: ${config.problem_type}. Must be one of: ${valid_types.join(', ')}`);
        }

        // Validate difficulty
        const valid_difficulties = ['easy', 'medium', 'hard'];
        if (!valid_difficulties.includes(config.difficulty)) {
            throw new Error(`Invalid difficulty: ${config.difficulty}. Must be one of: ${valid_difficulties.join(', ')}`);
        }

        return {
            title: config.title,
            slug: config.slug || config.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            difficulty: config.difficulty,
            problem_type: config.problem_type,
            description: config.description || '',
            template_code: config.template_code || '',
            time_limit: parseInt(config.time_limit),
            memory_limit: parseInt(config.memory_limit),
            points_per_case: parseInt(config.points_per_case) || 10
        };
    } catch (error) {
        console.error('Config Parse Error:', error.message);
        throw error;
    }
};

/**
 * Read test case files (input/output pairs)
 * @param {string} input_dir - Input directory path
 * @param {string} output_dir - Output directory path
 * @param {Array} input_files - Array of input file names
 * @param {Array} output_files - Array of output file names
 * @returns {Promise<Array>} Array of test case objects
 */
const fnReadTestCases = async (input_dir, output_dir, input_files, output_files) => {
    try {
        const test_cases = [];

        for (let i = 0; i < input_files.length; i++) {
            const input_content = fs.readFileSync(
                path.join(input_dir, input_files[i]),
                'utf-8'
            ).trim();

            const output_content = fs.readFileSync(
                path.join(output_dir, output_files[i]),
                'utf-8'
            ).trim();

            test_cases.push({
                input_data: input_content,
                expected_output: output_content,
                is_hidden: i >= 2, // First 2 test cases are visible, rest are hidden
                test_order: i + 1
            });
        }

        return test_cases;
    } catch (error) {
        console.error('Test Case Read Error:', error.message);
        throw error;
    }
};

/**
 * Clean up extracted files
 * @param {string} extract_path - Path to clean
 */
const fnCleanupExtractedFiles = (extract_path) => {
    try {
        if (fs.existsSync(extract_path)) {
            fs.rmSync(extract_path, { recursive: true, force: true });
        }
    } catch (error) {
        console.error('Cleanup Error:', error.message);
    }
};

module.exports = {
    fnExtractZip,
    fnValidateZipStructure,
    fnParseConfig,
    fnReadTestCases,
    fnCleanupExtractedFiles
};
