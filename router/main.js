const express = require("express")
const app = express()
const { clientInfo } = require("../controllers/functions.js")
const { checkAuth } = require("../controllers/auth.js")

app.use("/", clientInfo) // all function 
app.use("/", checkAuth) // auth 
app.use("/", require("./auth.js")) // sign router 
app.use("/", require("./about.js")) // about router 

// // use contest id  
// app.use("/contest/:id", async (req, res, next) => {
//        await authContest(req, res, req.params.id);
//        next();
// }, require("./router/contest.js"))

// // admin app.use
// app.use("/admin", [authAdmin], require("./router/admin.js"))

module.exports = app