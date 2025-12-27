const express = require("express")
const app = express()
const { authCheck, authAdmin, authContest } = require("../controllers/auth.js")

app.use("/", authCheck)
app.use("/", require("./auth.js"))
app.use("/", require("./about.js"))
app.use("/contest/:id", authContest, require("./contest.js"))
app.use("/admin", [authAdmin], require("./admin.js"))

module.exports = app