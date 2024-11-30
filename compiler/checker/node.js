const { exec } = require('child_process');
const { ansReturn } = require("./res")
const path = require("path")

let js = async (folder, timout, memory, callback) => {
    const ffolder = path.join(__dirname, `./tmp/${folder}`)
    let startTime = new Date().getTime()
    let startMemory = process.memoryUsage();
    await exec(`cd ${ffolder} && node Main.js < input.txt > output.txt`, { timeout: timout }, async (err, stdout, stderr) => {
        ansReturn(startTime, startMemory, timout, memory, callback, err, stdout, stderr)
    });
}

module.exports = js

