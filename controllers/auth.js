const { execute } = require("uzdev/mysql");
const { fnCatch } = require("uzdev/function");

exports.checkAuth = fnCatch(async (req, res, next) => {
    req.data = req.session.data || {}
    return next();
})

exports.authGood = fnCatch(async (req, res, next) => {
    if (!req.session.uid) {
        if (req.data.cid) return res.redirect("/contest/" + req.data.cid)
        res.redirect("/")
    }
    next();
})

exports.authAdmin = fnCatch(async (req, res, next) => {
    let isAdmin = await query("SELECT * FROM users WHERE role = 'admin' and id = ?", [req.data.user_id])
    if (!isAdmin.err && isAdmin.length != 0) return next();
    res.Error("Sahifa topilmadi!")
})

exports.authAdminIS = fnCatch(async (uid) => {
    let isAdmin = await query("SELECT * FROM users WHERE role='admin' and id=?", [uid])
    return (!isAdmin.err && isAdmin.length != 0)
})

exports.authContest = fnCatch(async (req, res, cid) => {
    const { query } = require("../database/db.fun")
    req.data.cid = cid;
    let contest = await query(`SELECT  * FROM v_contest WHERE id=?`, [req.data.cid])
    if (contest.length == 0) return res.redirect("/about")
    req.data.contest = contest[0]
})