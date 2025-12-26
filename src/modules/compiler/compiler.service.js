/**
 * Compiler Service
 * Executes code submissions in isolated Docker containers
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { dbQueryMany } = require("../../utils/mysql");

/**
 * Execute Python code
 */
const fnRunPython = async (code, input_data, time_limit = 5000) => {
  return new Promise((resolve, reject) => {
    const temp_file = path.join(__dirname, "../../../temp", `code_${Date.now()}.py`);
    fs.writeFileSync(temp_file, code);

    const start_time = Date.now();
    const process = spawn("python3", [temp_file]);

    let output = "";
    let error = "";

    if (input_data) {
      process.stdin.write(input_data);
      process.stdin.end();
    }

    const timeout = setTimeout(() => {
      process.kill();
      fs.unlinkSync(temp_file);
      reject(new Error("Time Limit Exceeded"));
    }, time_limit);

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      clearTimeout(timeout);
      fs.unlinkSync(temp_file);

      const execution_time = Date.now() - start_time;

      if (code !== 0) {
        reject(new Error(error || "Runtime Error"));
      } else {
        resolve({
          output: output.trim(),
          execution_time,
        });
      }
    });
  });
};

/**
 * Execute JavaScript code
 */
const fnRunJavaScript = async (code, input_data, time_limit = 5000) => {
  return new Promise((resolve, reject) => {
    const temp_file = path.join(__dirname, "../../../temp", `code_${Date.now()}.js`);

    // Wrap code to handle input
    const wrapped_code = `
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input_lines = [];
rl.on('line', (line) => {
    input_lines.push(line);
});

rl.on('close', () => {
    ${code}
});
`;

    fs.writeFileSync(temp_file, wrapped_code);

    const start_time = Date.now();
    const process = spawn("node", [temp_file]);

    let output = "";
    let error = "";

    if (input_data) {
      process.stdin.write(input_data);
      process.stdin.end();
    }

    const timeout = setTimeout(() => {
      process.kill();
      fs.unlinkSync(temp_file);
      reject(new Error("Time Limit Exceeded"));
    }, time_limit);

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      clearTimeout(timeout);
      fs.unlinkSync(temp_file);

      const execution_time = Date.now() - start_time;

      if (code !== 0) {
        reject(new Error(error || "Runtime Error"));
      } else {
        resolve({
          output: output.trim(),
          execution_time,
        });
      }
    });
  });
};

/**
 * Execute SQL query (MySQL)
 */
const fnRunSQL = async (query, input_data) => {
  const mysql = require("mysql2/promise");

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: "test_db",
  });

  const start_time = Date.now();

  const [rows] = await connection.execute(query);
  await connection.end();

  const execution_time = Date.now() - start_time;

  return {
    output: JSON.stringify(rows),
    execution_time,
  };
};

/**
 * Judge submission against test cases
 */
const fnJudgeSubmission = async (submission_id, code, lang_code, test_cases, time_limit) => {
  let total_score = 0;
  let passed = 0;
  let max_time = 0;
  let status = "accepted";
  let error_message = null;

  for (const test_case of test_cases) {
    try {
      let result;

      switch (lang_code) {
        case "python":
          result = await fnRunPython(code, test_case.input_data, time_limit);
          break;
        case "javascript":
          result = await fnRunJavaScript(code, test_case.input_data, time_limit);
          break;
        case "sql":
          result = await fnRunSQL(code, test_case.input_data);
          break;
        default:
          throw new Error("Unsupported language");
      }

      max_time = Math.max(max_time, result.execution_time);

      if (result.output === test_case.expected_output.trim()) {
        total_score += test_case.points;
        passed++;
      } else {
        if (status === "accepted") {
          status = "wrong_answer";
        }
      }
    } catch (error) {
      if (error.message.includes("Time Limit")) {
        status = "time_limit";
        error_message = "Time Limit Exceeded";
      } else {
        status = "runtime_error";
        error_message = error.message;
      }
      break;
    }
  }

  // Update submission
  await dbQueryMany(
    `
        UPDATE submissions
        SET status = ?, test_passed = ?, score = ?, execution_time = ?, error_message = ?
        WHERE submission_id = ?
    `,
    [status, passed, total_score, max_time, error_message, submission_id]
  );

  return {
    status,
    test_passed: passed,
    test_total: test_cases.length,
    score: total_score,
    execution_time: max_time,
    error_message,
  };
};

module.exports = {
  fnRunPython,
  fnRunJavaScript,
  fnRunSQL,
  fnJudgeSubmission,
};
