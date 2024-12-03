const { exec } = require('child_process');
const { ansReturn } = require("./res")
const path = require("path")


let cppRun = async (folder, callback) => {
    const ffolder = path.join(__dirname, `./tmp/${folder}`)
    await exec(`cd ${ffolder} && g++ -o Main.out Main.cpp -std=c++17`, async (err, stdout, stderr) => {
        return callback({ error: err ? 1 : 0, errorMessage: err, stderr, stdout })
    });
}


let cppCompiler = async (folder, timout, memory, callback) => {
    const ffolder = path.join(__dirname, `./tmp/${folder}`)
    let startTime = new Date().getTime()
    let startMemory = process.memoryUsage();
    await exec(`cd ${ffolder} && ./Main.out < input.txt > output.txt`, { timeout: timout }, async (err, stdout, stderr) => {
        ansReturn(startTime, startMemory, timout, memory, callback, err, stdout, stderr)
    });
}

module.exports = { cppCompiler, cppRun }


