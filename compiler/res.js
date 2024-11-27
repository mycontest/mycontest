let ansReturn = (startTime, startMemory, timout, memory, callback, err, stdout, stderr) => {
    let endTime = (new Date()).getTime()
    let timeRun = endTime - startTime;
    let endMemory = process.memoryUsage();
    let memoryRun = (endMemory.rss - startMemory.rss) / 1000;
    let message = 0
    if (err) message = "Runtime error"
    if (timeRun > timout) message = "Time limit exceeded"
    if (memoryRun > memory * 1000) message = "Memory limit exceeded"
    if (message) return callback({ message: message, error: 1, time: timeRun, memory: memoryRun, errorMessage: err })
    return callback({ message: "Test", error: 0, time: timeRun, memory: memoryRun })
}

module.exports = {
    ansReturn
}