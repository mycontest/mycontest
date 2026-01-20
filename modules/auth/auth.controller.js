const bcrypt = require("bcrypt");
const { dbQueryOne, dbQueryMany } = require("../../shared/utils/mysql");

exports.getLogin = (req, res) => {
  res.render("layout", { page: "user/login", navbar: "empty", title: "Login - mycontest" });
};

exports.getRegister = (req, res) => {
  res.render("layout", { page: "user/register", navbar: "empty", title: "Register - mycontest" });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await dbQueryOne("SELECT * FROM users WHERE username = ?", [username]);

    if (!user) {
      req.session.error = "Invalid username or password";
      return res.redirect("/auth/login");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.session.error = "Invalid username or password";
      return res.redirect("/auth/login");
    }

    req.session.user = { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role };
    req.session.success = "Logged in successfully";
    res.redirect("/");
  } catch (error) {
    req.session.error = error.message;
    res.redirect("/auth/login");
  }
};

exports.postRegister = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);
    await dbQueryMany("INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)", [name, username, email, hashed_password]);
    req.session.success = "Registration successful! Please login.";
    res.redirect("/auth/login");
  } catch (error) {
    req.session.error = "Registration failed: " + error.message;
    res.redirect("/auth/register");
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
