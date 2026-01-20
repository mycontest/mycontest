exports.nextError = (err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);
  res.render("layout", { page: "pages/user/error", title: "Error", error: "Tizimda xatolik yuz berdi: " + (err.message || "Noma'lum xato") });
};
