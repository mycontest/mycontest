const { dbQueryOne, dbQueryMany } = require("../../shared/mysql");
const { signSchema } = require("./auth.schema");

exports.fnGetSignIn = async (req, res) => {
  return res.render("pages/signin");
};

exports.fnGetHome = async (req, res) => {
  try {
    let contests = await dbQueryMany("SELECT * FROM vw_contest ORDER BY contest_id DESC");
    res.render("pages/home", { contests });
  } catch (err) {
    req.flash("error", err.message);
    res.render("pages/home", { contests: [] });
  }
};

exports.fnPostSignIn = async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = await dbQueryOne("SELECT * FROM users WHERE username = ? and password = md5(?)", [username, password + ":" + process.env.SECRET]);
    if (!user) {
      req.flash("error", "Noto'g'ri foydalanuvchi nomi yoki parol");
      return res.redirect("/sign-in");
    }
    req.session.data = user;
    res.redirect("/");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/sign-in");
  }
};

exports.fnGetSignUp = async (req, res) => {
  res.render("pages/signup");
};

exports.fnPostSignUp = async (req, res) => {
  try {
    const { username, password, full_name } = req.body;
    await signSchema.validateAsync({ username, password, full_name });
    let user = await dbQueryOne("SELECT * FROM users WHERE username = ?", [username]);
    if (user) {
      req.flash("error", "Bunaqa username mavjud!");
      return res.redirect("/sign-up");
    }
    await dbQueryMany("INSERT INTO users (username, password, full_name) values (?, md5(?), ?)", [username, password + ":" + process.env.SECRET, full_name]);
    req.flash("success", "Ro'yxatdan muvaffaqiyatli o'tdingiz.");
    res.redirect("/sign-in");
  } catch (err) {
    req.flash("error", "Kiritilgan ma'lumotlar noto'g'ri.");
    res.redirect("/sign-up");
  }
};

exports.fnLogout = async (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
