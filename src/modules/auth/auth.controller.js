/**
 * Auth Controller
 * Handles authentication requests
 */

const { fnWrap } = require("../../utils");
const { fnRegister, fnLogin, fnGetUserStats } = require("./auth.service");

const authLogin = fnWrap(async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await fnLogin(username, password);
    req.session.user = user;
    if (req.xhr) {
      return res.json({ success: true, redirect: "/" });
    }
    return res.redirect("/");
  } catch (error) {
    if (req.xhr) {
      return res.status(400).json({ success: false, message: error.message });
    }
    req.flash("error_msg", error.message);
    return res.redirect("/login");
  }
});

const authRegister = fnWrap(async (req, res) => {
  const { username, email, password, full_name } = req.body;
  try {
    const user = await fnRegister(username, email, password, full_name);
    req.session.user = user;
    if (req.xhr) {
      return res.json({ success: true, redirect: "/" });
    }
    return res.redirect("/");
  } catch (error) {
    if (req.xhr) {
      return res.status(400).json({ success: false, message: error.message });
    }
    req.flash("error_msg", error.message);
    return res.redirect("/register");
  }
});

const authLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

const authProfile = fnWrap(async (req, res) => {
  const stats = await fnGetUserStats(req.session.user.user_id);
  res.render("pages/profile", {
    title: "Profile",
    stats,
  });
});

const authLoginPage = (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("pages/login", { title: "Login", error: null });
};

const authRegisterPage = (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("pages/register", { title: "Register", error: null });
};

module.exports = {
  authLogin,
  authRegister,
  authLogout,
  authProfile,
  authLoginPage,
  authRegisterPage,
};
