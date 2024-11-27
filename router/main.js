const express = require("express")
const app = express()
const { clientInfo } = require("../controllers/functions.js")
const { authCheck, authAdmin, authContest } = require("../controllers/auth.js")

app.use("/", clientInfo) // client info
app.use("/", authCheck) // auth 
app.use("/", require("./auth.js")) // sign router 
app.use("/", require("./about.js")) // about router 
app.use("/contest/:id", authContest, require("./contest.js"))
app.use("/admin", [authAdmin], require("./admin.js"))  // admin app.use

module.exports = app