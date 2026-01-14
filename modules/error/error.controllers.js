let nextError = (err, req, res, next) => {
  try {
    req.flash("error", `Unexpected error, ${err?.message}!`);
    return res.redirect("/");
  } catch (error) {
    req.flash("error", "Json parse error!");
    return res.redirect("/");
  }
};

let nextMissed = (req, res, next) => {
  req.flash("error", "There is no such router!");
  res.redirect("/");
};

module.exports = { nextError, nextMissed };
