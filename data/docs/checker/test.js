const { fork } = require("child_process");

const child = fork("./main.js");
child.send({ attempt_id: 1, task_id: 1, lang_id: 3, code: `print(sum(map(int, input().split(" "))))` });

child.on("message", (message) => {
    console.log("Message from child:", message);
});
child.on("error", (error) => {
    console.error("Child process error:", error);
});
child.on("exit", (code) => {
    console.log(`Child process exited with code ${code}`);
});
