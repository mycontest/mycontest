const { exec } = require('child_process');
const { ansReturn } = require("./res")
const path = require("path")

let monoRun = async (folder, callback) => {
    const ffolder = path.join(__dirname, `./tmp/${folder}`)
    await exec(`cd ${ffolder} && mono-csc Main.cs`, async (err, stdout, stderr) => {
        return callback({ error: err ? 1 : 0, errorMessage: err, stderr, stdout })
    });
}

let monoCompiler = async (folder, timout, memory, callback) => {
    const ffolder = path.join(__dirname, `./tmp/${folder}`)
    let startTime = new Date().getTime()
    let startMemory = process.memoryUsage();
    await exec(`cd ${ffolder} && mono Main.exe < input.txt > output.txt`, { timeout: timout }, async (err, stdout, stderr) => {
        ansReturn(startTime, startMemory, timout, memory, callback, err, stdout, stderr)
    });
}

module.exports = { monoRun, monoCompiler }


