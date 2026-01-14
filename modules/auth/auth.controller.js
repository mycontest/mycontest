const { dbQueryOne, dbQueryMany } = require("../../shared/mysql");
const { signSchema } = require("./auth.schema");
const { sendVerificationEmail } = require("../../shared/email");
const crypto = require("crypto");

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
    const { username, password, full_name, email } = req.body;
    await signSchema.validateAsync({ username, password, full_name, email });

    // Check if username exists
    let user = await dbQueryOne("SELECT * FROM users WHERE username = ?", [username]);
    if (user) {
      req.flash("error", "Bunaqa username mavjud!");
      return res.redirect("/sign-up");
    }

    // Check if email exists
    let emailExists = await dbQueryOne("SELECT * FROM users WHERE email = ?", [email]);
    if (emailExists) {
      req.flash("error", "Bunaqa email mavjud!");
      return res.redirect("/sign-up");
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Insert user
    await dbQueryMany("INSERT INTO users (username, password, full_name, email, verification_token, email_verified) values (?, md5(?), ?, ?, ?, FALSE)", [username, password + ":" + process.env.SECRET, full_name, email, verificationToken]);

    // Send verification email
    try {
      await sendVerificationEmail({ email, full_name }, verificationToken);
      req.flash("success", "Ro'yxatdan muvaffaqiyatli o'tdingiz. Emailingizni tekshiring!");
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      req.flash("success", "Ro'yxatdan muvaffaqiyatli o'tdingiz.");
    }

    res.redirect("/sign-in");
  } catch (err) {
    req.flash("error", "Kiritilgan ma'lumotlar noto'g'ri.");
    res.redirect("/sign-up");
  }
};

exports.fnVerifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      req.flash("error", "Verification token topilmadi.");
      return res.redirect("/sign-in");
    }

    // Find user with this token
    const user = await dbQueryOne("SELECT * FROM users WHERE verification_token = ?", [token]);

    if (!user) {
      req.flash("error", "Noto'g'ri yoki muddati o'tgan token.");
      return res.redirect("/sign-in");
    }

    if (user.email_verified) {
      req.flash("info", "Email allaqachon tasdiqlangan.");
      return res.redirect("/sign-in");
    }

    // Verify email
    await dbQueryMany("UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE user_id = ?", [user.user_id]);

    req.flash("success", "Email muvaffaqiyatli tasdiqlandi! Endi tizimga kirishingiz mumkin.");
    res.redirect("/sign-in");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/sign-in");
  }
};

exports.fnLogout = async (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
