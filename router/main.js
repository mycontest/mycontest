const express = require("express")
const app = express()
const { authCheck, authAdmin, authContest } = require("../controllers/auth.js")

app.use("/", authCheck) // auth 
app.use("/", require("./auth.js")) // sign router 
app.use("/", require("./about.js")) // about router 
app.use("/contest/:id", authContest, require("./contest.js"))
app.use("/admin", [authAdmin], require("./admin.js"))  // admin app.use

module.exports = app