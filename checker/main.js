// load environment variables
require("dotenv").config({ path: "../.env" });

const { spawn, execSync } = require("child_process");
const { execute } = require("uzdev/mysql")
const path = require("path");
const fs = require("fs");

const updateStatus = async (attempt_id, event, event_num, time, memory, comment) => {
    console.log(attempt_id, event, event_num, time, memory, comment)
    try {
        await execute(
            "UPDATE attempts SET event = ?, event_num = ?, time = GREATEST(time, COALESCE(?, 0)), memory = GREATEST(memory, COALESCE(?, 0)), comment = ? WHERE attempt_id = ?",
            [event, event_num, time, memory, comment, attempt_id]
        );
    } catch (err) {
        console.error(`Error processing output: ${err.message}`);
    }
};

const cleanString = (input) => {
    try {
        return input.replace(/[\s\r]+$/, "").replace(/\r/g, "");
    } catch (err) {
        return "-0";
    }
};

function getParseLog(log) {
    const result = {};

    const elapsed_time_regex = /Elapsed \(wall clock\) time \(h:mm:ss or m:ss\): ([0-9:.\s]+)/;
    const max_rss_regex = /Maximum resident set size \(kbytes\): (\d+)/;
    const cpu_usage_regex = /Percent of CPU this job got: (\d+)%/;

    const elapsed_time_match = log.match(elapsed_time_regex);
    if (elapsed_time_match) {
        const time_parts = elapsed_time_match[1].trim().split(":").map(Number);
        let elapsed_ms = 0;
        if (time_parts.length === 3) {
            elapsed_ms = ((time_parts[0] * 3600) + (time_parts[1] * 60) + time_parts[2]) * 1000;
        } else if (time_parts.length === 2) {
            elapsed_ms = ((time_parts[0] * 60) + time_parts[1]) * 1000;
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

const runChecker = async (attempt_id, task_id, temp_dir, test_count, time_limit, memory_limit, script_compilation, script_run, image_name) => {
    const dockerArgs = ["run", "--rm", "-v", `${temp_dir}:/app/sandbox`, "--cpus", "2", "--memory", "64m", image_name, "bash", "-c", `./${image_name}.sh ${test_count} /app/sandbox '${script_compilation}' '${script_run}' ${time_limit}`];
    const process = spawn("docker", dockerArgs);

    process.stdout.on("data", async (data) => {
        try {
            const output = JSON.parse(data.toString());
            const { test_number, time_run } = output;

            console.log("[DOCKER STDOUT]: ", output);
            if (output.status == 'timeout') return updateStatus(attempt_id, 'Time limit exceeded', 3, time_run, 0, output.message);
            if (output.status == 'compilation') return updateStatus(attempt_id, 'Compilation error', 5, time_run, 0, output.message);
            if (output.status == 'runtime') return updateStatus(attempt_id, 'Runtime error', 7, time_run, 0, output.message);

            const expected_output = fs.readFileSync(path.join(__dirname, `/testcase/${task_id}/output${test_number}.txt`), { encoding: "utf8" });
            const current_output = fs.readFileSync(path.join(__dirname, `/temp/${attempt_id}/output${test_number}.txt`), { encoding: "utf8" });
            const info_log = getParseLog(fs.readFileSync(path.join(__dirname, `/temp/${attempt_id}/info${test_number}.log`), { encoding: "utf8" }));

            if (info_log.memory_usage_kb / 1024 > memory_limit) return updateStatus(attempt_id, 'Memory limit exceeded', 6, time_run, 0, output.message);
            if (current_output.length == 0) return updateStatus(attempt_id, 'Presentation Error', 4, time_run, 0, output.message);

            if (cleanString(current_output) !== cleanString(expected_output)) return updateStatus(attempt_id, `Wrong answer #${test_number}`, 2, time_run, info_log.memory_usage_kb, output.message);
            if (test_count != test_number) return updateStatus(attempt_id, `Test #${test_number}`, 0, time_run, info_log.memory_usage_kb, output.message);
            updateStatus(attempt_id, `Accepted`, 1, time_run, info_log.memory_usage_kb, output.message);
        } catch (err) {
            console.error(`Error processing output: ${err.message}`);
            updateStatus(attempt_id, 'Server Error', 10, 0, 0, err.message);
        }
    });

    process.stderr.on("data", (data) => {
        console.error("[DOCKER STDERR]: ", data.toString());
        updateStatus(attempt_id, 'Server Error', 10, 0, 0, data.toString());
    });

    process.on("close", (code) => {
        console.log("Docker process ended with code: ", code);
    });
};

const runMain = async (attempt_id, task_id, lang_id, code, is_rerun = false) => {
    try {
        const [task, lang] = await Promise.all([
            execute(`SELECT * FROM tasks WHERE task_id = ?`, [task_id], 1),
            execute("SELECT * FROM lang WHERE group_id = (SELECT group_id FROM vw_tasks WHERE task_id = ?) AND lang_id = ?", [task_id, lang_id], 1)
        ]);

        const temp_dir = path.join(__dirname, `temp/${attempt_id}`);
        const test_input = path.join(__dirname, `testcase/${task_id}`, "input*.txt");
        const source_file = path.join(temp_dir, `${lang.file_type == 'java' ? "Main" : "source"}.${lang.file_type}`);

        fs.mkdirSync(temp_dir, { recursive: true });
        if (!is_rerun) fs.writeFileSync(source_file, code);

        execSync(`cp ${test_input} ${temp_dir}`);
        await runChecker(attempt_id, task_id, temp_dir, task.test_count, task.time, task.memory, lang.script_compilation, lang.script_run, lang.image_name);
    } catch (err) {
        console.error(`Error in runMain: ${err.message}`);
        updateStatus(attempt_id, 'Server Error', 10, 0, 0, err.message);
    }
};

process.on('message', async (input) => {
    const { attempt_id, task_id, lang_id, code } = input
    runMain(attempt_id, task_id, lang_id, code);
})

/* 
1,1,GNU GCC 14.1 C++20
2,1,Java 21.0.1 (Temurin JDK)
3,1,Python 3.12.3
4,1,Node.js 20.x.x
5,1,C# Mono
runMain(1, 1, 3, `print(sum(map(int, input().split(" "))))`);
*/

/*  0 - wait, 1- success, > 2 error*/
