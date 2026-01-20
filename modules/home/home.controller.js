exports.getHome = async (req, res) => {
  res.render("layout", { page: "user/home", navbar: "home", title: "Home" });
};

exports.getProfile = async (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");
  res.render("layout", { page: "user/profile", navbar: "home", title: "Profile", user: req.session.user });
};
