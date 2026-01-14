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
    const { dbQueryMany } = require("../../shared/mysql");
    let contest_id = req.params.id;
    let contest = await dbQueryOne(`SELECT * FROM vw_contest WHERE contest_id = ?`, [contest_id]);

    if (!contest) return res.redirect("/");

    // Check private contest access
    if (contest.contest_type === "private") {
      const user_id = req.session.data?.user_id;
      const is_admin = req.session.data?.role === "admin";

      // Admins can access all contests
      if (!is_admin) {
        if (!user_id) {
          req.flash("error", "Bu private contest. Kirish uchun tizimga kiring.");
          return res.redirect("/sign-in");
        }

        // Check if user is a participant
        const participant = await dbQueryOne("SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?", [contest_id, user_id]);

        if (!participant) {
          req.flash("error", "Sizda bu contestga kirish huquqi yo'q.");
          return res.redirect("/");
        }
      }
    }

    res.locals.contest_id = contest_id;
    res.locals.contest = contest;
    req.contest_id = contest_id;
    req.contest = contest;
    next();
  } catch (err) {
    next(err);
  }
};
