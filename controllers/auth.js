const { execute } = require("uzdev/mysql");
const { fnCatch } = require("uzdev/function");

exports.authCheck = fnCatch(async (req, res, next) => {
    req.data = req.session.data || {}
    return next();
})

exports.authStop = fnCatch(async (req, res, next) => {
    if (!req.data.user_id) {
        if (req.data.contest_id) return res.redirect("/contest/" + req.data.contest_id)
        res.redirect("/")
    }
    next();
})

exports.authAdmin = fnCatch(async (req, res, next) => {
    if (req.data?.role == 'admin') return next();
    throw new Error("Siz admin emassiz!")
})

exports.authContest = fnCatch(async (req, res, next) => {
    req.data.contest_id = req.params.id;
    let contest = await execute(`SELECT  * FROM vw_contest WHERE contest_id = ?`, [req.data.contest_id])
    if (contest.length == 0) return res.redirect("/about")
    req.data.contest = contest[0];
    next();
})