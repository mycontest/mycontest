exports.nextError = (err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);
  res.render("layout", { page: "user/error", title: "Error", navbar: "home", error: "Tizimda xatolik yuz berdi: " + (err.message || "Noma'lum xato") });
};
