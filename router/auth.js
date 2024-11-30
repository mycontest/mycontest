const express = require("express")
const router = express.Router()
const { execute } = require("uzdev/mysql");
const { fnCatch } = require("uzdev/function");
const { signSchema } = require("../module/schema")

const GoogleRecaptcha = require('google-recaptcha');
const googleRecaptcha = new GoogleRecaptcha({ secret: process.env.GOOGLE_SECRET })

router.get("/sign-in", fnCatch(async (req, res) => {
  return res.render("pages/signin", { data: req.data })
}))

router.post("/sign-in", fnCatch(async (req, res) => {
  let { username, password } = req.body
  let user = await execute("SELECT * FROM users WHERE username = ? and password = md5(?)", [username, password + ":" + process.env.SECRET], 1);
  if (!user || user.length == 0) return res.redirect("/sign-in?error=Noto'g'ri foydalanuvchi nomi yoki parol")
  req.session.data = user
  res.redirect("/about")
}))

router.get("/sign-up", fnCatch(async (req, res) => {
  res.render("pages/signup", { data: req.data })
}))

router.post("/sign-up", fnCatch(async (req, res) => {
  const recaptchaResponse = req.body['g-recaptcha-response']
  googleRecaptcha.verify({ response: recaptchaResponse }, async (error) => {
    if (error) return res.redirect("/sign-in?error=Captcha noto'g'ri.")
    try {
      const { username, password, full_name } = req.body
      await signSchema.validateAsync({ username, password, full_name });
      let user = await execute("SELECT * FROM users WHERE username = ?", [username], 1);
      if (user) return res.redirect("/sign-up?error=Bunaqa username mavjud!")
      await execute("INSERT INTO users (username, password, full_name) values (?, md5(?), ?)", [username, password + ":" + process.env.SECRET, full_name])
      res.redirect("/sign-in?scc=Ro'yxatdan muvaffaqiyatli o'tdingiz.")
    } catch (err) {
      res.redirect("/sign-up?error=Kiritilgan ma'lumotlar noto‘g‘ri.")
    }
  })
}))

router.get('/logout', fnCatch(async (req, res, next) => {
  req.session.destroy()
  res.redirect('/');
}));

module.exports = router