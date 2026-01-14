const { dbQueryOne } = require("../../shared/mysql");

exports.fnAuthCheck = async (req, res, next) => {
  try {
    res.locals.user = req.session.data || null;
    if (req.session.data) {
      req.user = req.session.data;
      req.user_id = req.session.data.user_id;
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    return next();
  } catch (err) {
    next(err);
  }
};

exports.fnAuthStop = async (req, res, next) => {
  try {
    if (!req.session.data) {
      if (req.params.id) return res.redirect("/contest/" + req.params.id);
      return res.redirect("/");
    }
    next();
  } catch (err) {
    next(err);
  }
};

exports.fnAuthAdmin = async (req, res, next) => {
  try {
    if (req.session.data?.role == "admin") return next();
    throw new Error("Siz admin emassiz!");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/");
  }
};

exports.fnAuthContest = async (req, res, next) => {
  try {
    let contest_id = req.params.id;
    let contest = await dbQueryOne(`SELECT * FROM vw_contest WHERE contest_id = ?`, [contest_id]);
    if (!contest) return res.redirect("/");
    res.locals.contest_id = contest_id;
    res.locals.contest = contest;
    req.contest_id = contest_id;
    req.contest = contest;
    next();
  } catch (err) {
    next(err);
  }
};
