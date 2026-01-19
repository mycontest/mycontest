// load environment variables
require("dotenv").config({ path: "../.env" });

const { spawn, execSync } = require("child_process");
const { dbQueryMany, dbQueryOne } = require("../shared/mysql");
const { fnQueuePush, fnQueuePop, fnQueueLength } = require("../shared/redis");
const path = require("path");
const fs = require("fs");

const QUEUE_NAME = "checker_queue";

async function fnUpdateAttemptStatus(attempt_id, status_message, status_code, time_ms, memory_kb, error_details) {
  console.log(`[Status Update] ${attempt_id}: ${status_message} (${status_code}) - ${time_ms}ms, ${memory_kb}KB`);
  try {
    await dbQueryMany("UPDATE attempts SET status_message = if(status_code = 2, status_message, ?), status_code = ?, time_ms = GREATEST(time_ms, COALESCE(?, 0)), memory_kb = GREATEST(memory_kb, COALESCE(?, 0)), error_details = ? WHERE attempt_id = ?", [
      status_message,
      status_code,
      time_ms,
      memory_kb,
      error_details,
      attempt_id,
    ]);
  } catch (err) {
    console.error(`Error updating status: ${err.message}`);
  }
}

function fnCleanString(input) {
  try {
    return input.replace(/[\s\r]+$/, "").replace(/\r/g, "");
  } catch (err) {
    return "";
  }
}

async function fnClearTempFiles(temp_dir) {
  const patterns = [/^input\d*\.txt$/, /^output\d*\.txt$/, /^info\d*\.log$/];

  try {
    const files = fs.readdirSync(temp_dir);
    files
      .filter((file) => patterns.some((pattern) => pattern.test(file)))
      .forEach((file) => {
        const file_path = path.join(temp_dir, file);
        try {
          fs.unlinkSync(file_path);
          console.log(`Deleted: ${file_path}`);
        } catch (err) {
          console.error(`Failed to delete ${file_path}: ${err}`);
        }
      });
  } catch (err) {
    console.error(`Failed to read directory ${temp_dir}: ${err}`);
  }
}

function fnParseTimeLog(log) {
  const result = {};
  const elapsed_time_regex = /Elapsed \(wall clock\) time \(h:mm:ss or m:ss\): ([0-9:.\s]+)/;
  const max_rss_regex = /Maximum resident set size \(kbytes\): (\d+)/;
  const cpu_usage_regex = /Percent of CPU this job got: (\d+)%/;

  const elapsed_time_match = log.match(elapsed_time_regex);
  if (elapsed_time_match) {
    const time_parts = elapsed_time_match[1].trim().split(":").map(Number);
    let elapsed_ms = 0;
    if (time_parts.length === 3) {
      elapsed_ms = (time_parts[0] * 3600 + time_parts[1] * 60 + time_parts[2]) * 1000;
    } else if (time_parts.length === 2) {
      elapsed_ms = (time_parts[0] * 60 + time_parts[1]) * 1000;
    }
    result.execution_time_ms = elapsed_ms;
  }

  const max_rss_match = log.match(max_rss_regex);
  if (max_rss_match) {
    const max_rss_kb = parseInt(max_rss_match[1], 10);
    result.memory_usage_kb = parseFloat(max_rss_kb).toFixed(2);
  }

  const cpu_usage_match = log.match(cpu_usage_regex);
  if (cpu_usage_match) {
    result.cpu_usage_percent = parseInt(cpu_usage_match[1], 10);
  }

  return result;
}

async function fnRunDockerChecker(attempt_id, problem_id, temp_dir, test_count, time_limit, memory_limit, script_compilation, script_run, image_name) {
  // Determine volume path for Docker (needs host path if running in container)
  let volume_path = temp_dir;
  if (process.env.HOST_DATA_PATH) {
    // If HOST_DATA_PATH is set, replace the container data path with host data path
    // Assumption: temp_dir ends with /data/checker/temp/{attempt_id}
    const relative_part = `checker/temp/${attempt_id}`;
    // Handle Windows paths if necessary by replacing backslashes
    const host_base = process.env.HOST_DATA_PATH.replace(/\\/g, "/");
    volume_path = path.posix.join(host_base, relative_part);
  }

  console.log(volume_path);
  const docker_args = ["run", "--rm", "-v", `${volume_path}:/app/sandbox`, "--cpus", "2", "--memory", "2GB", "--memory-swap", "2GB", image_name, "bash", "-c", `./runner.sh ${test_count} /app/sandbox '${script_compilation}' '${script_run}' ${time_limit}`];

  const docker_process = spawn("docker", docker_args);
  console.log(`[Docker] ${docker_args.join(" ")}`);

  docker_process.stdout.on("data", async (data) => {
    try {
      const output = JSON.parse(data.toString());
      const { test_number, time_run } = output;

      console.log("[DOCKER STDOUT]:", output);

      if (output.status == "timeout") return fnUpdateAttemptStatus(attempt_id, "Time limit exceeded", 3, time_run, 0, output.message);
      if (output.status == "compilation") return fnUpdateAttemptStatus(attempt_id, "Compilation error", 5, time_run, 0, output.message);
      if (output.status == "runtime") return fnUpdateAttemptStatus(attempt_id, "Runtime error", 7, time_run, 0, output.message);

      const expected_output = fs.readFileSync(path.join(__dirname, `../data/checker/testcase/${problem_id}/output${test_number}.txt`), { encoding: "utf8" });
      const current_output = fs.readFileSync(path.join(__dirname, `../data/checker/temp/${attempt_id}/output${test_number}.txt`), { encoding: "utf8" });
      const info_log = fnParseTimeLog(fs.readFileSync(path.join(__dirname, `../data/checker/temp/${attempt_id}/info${test_number}.log`), { encoding: "utf8" }));

      if (info_log.memory_usage_kb / 1024 > memory_limit) return fnUpdateAttemptStatus(attempt_id, "Memory limit exceeded", 6, time_run, 0, output.message);
      if (current_output.length == 0) return fnUpdateAttemptStatus(attempt_id, "Presentation Error", 4, time_run, 0, output.message);

      if (fnCleanString(current_output) !== fnCleanString(expected_output)) return fnUpdateAttemptStatus(attempt_id, `Wrong answer #${test_number}`, 2, time_run, info_log.memory_usage_kb, output.message);
      if (test_count != test_number) return fnUpdateAttemptStatus(attempt_id, `Test #${test_number}`, 0, time_run, info_log.memory_usage_kb, output.message);
      await fnUpdateAttemptStatus(attempt_id, `Accepted`, 1, time_run, info_log.memory_usage_kb, output.message);
    } catch (err) {
      console.error(`Error processing output: ${err.message}`);
      fnUpdateAttemptStatus(attempt_id, "Server Error", 10, 0, 0, err.message);
    }
  });

  docker_process.stderr.on("data", (data) => {
    console.error("[DOCKER STDERR]:", data.toString());
    fnUpdateAttemptStatus(attempt_id, "Server Error", 10, 0, 0, data.toString());
  });

  docker_process.on("close", (code) => {
    setTimeout(() => {
      fnClearTempFiles(temp_dir);
    }, 1000);
    console.log("Docker process ended with code:", code);
  });
}

async function fnProcessAttempt(attempt_id, contest_id, problem_id, language_id, code, is_rerun = false) {
  try {
    const [problem, language] = await Promise.all([
      //
      dbQueryOne(`SELECT * FROM problems WHERE problem_id = ?`, [problem_id]),
      dbQueryOne("SELECT * FROM languages WHERE group_id = (SELECT group_id FROM problems WHERE problem_id = ?) AND language_id = ?", [problem_id, language_id]),
    ]);

    console.log(attempt_id, contest_id, problem_id, language_id, code, problem, language);
    if (!problem || !language) {
      throw new Error("Task or language not found");
    }

    const temp_dir = path.join(__dirname, `../data/checker/temp/${attempt_id}`);
    const test_input = path.join(__dirname, `../data/checker/testcase/${problem_id}`, "input*.txt");
    const source_file = path.join(temp_dir, `${language.file_extension == "java" ? "Main" : "source"}.${language.file_extension}`);

    fs.mkdirSync(temp_dir, { recursive: true });
    if (!is_rerun) fs.writeFileSync(source_file, code);

    execSync(`cp ${test_input} ${temp_dir}`);
    await fnRunDockerChecker(attempt_id, problem_id, temp_dir, problem.test_all, problem.time_ms, problem.memory_kb, language.compile_script, language.run_script, language.docker_image);
  } catch (err) {
    console.error(`Error in fnProcessAttempt: ${err.message}`);
    fnUpdateAttemptStatus(attempt_id, "Server Error", 10, 0, 0, err.message);
  }
}

async function fnAddToQueue(attempt_id, contest_id, problem_id, language_id, code) {
  try {
    await fnQueuePush(QUEUE_NAME, { attempt_id, contest_id, problem_id, language_id, code });
    console.log(`[Queue] Added attempt ${attempt_id} to queue`);
  } catch (err) {
    console.error(`[Queue] Failed to add to queue: ${err.message}`);
  }
}

async function fnProcessQueue() {
  console.log("[Queue Worker] Starting checker queue worker...");

  while (true) {
    try {
      const queue_length = await fnQueueLength(QUEUE_NAME);
      if (queue_length > 0) {
        console.log(`[Queue Worker] Queue length: ${queue_length}`);
      }

      const job = await fnQueuePop(QUEUE_NAME);
      if (job) {
        const { attempt_id, contest_id, problem_id, language_id, code } = job;
        console.log(`[Queue Worker] Processing attempt ${attempt_id}`);
        await fnProcessAttempt(attempt_id, contest_id, problem_id, language_id, code);
      } else {
        // No jobs, wait a bit
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error(`[Queue Worker] Error: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Export functions
module.exports = {
  fnAddToQueue,
  fnProcessAttempt,
  fnProcessQueue,
};

// Start queue worker if run directly
if (require.main === module) {
  console.log("[Checker] Starting as standalone worker...");
  fnProcessQueue().catch(console.error);
}
