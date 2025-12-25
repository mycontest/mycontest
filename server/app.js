// ================================================================
// MYCONTEST PLATFORM
// Clean Modular MVC with Router/Controller/Service/Schema
// ================================================================

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const FileStore = require("session-file-store")(session);
const flash = require("connect-flash");
const createError = require("http-errors");

/**
 * Create Express Application
 * @returns {Express} Configured Express app
 */
const createApp = () => {
  const app = express();

  // ================================================================
  // MIDDLEWARE
  // ================================================================

  app.use(cookieParser(process.env.SECRET));
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: new FileStore({
        path: path.join(__dirname, "session"),
        logFn: function () {},
      }),
      cookie: { maxAge: 12 * 3600000, secure: false, httpOnly: false },
    })
  );

  app.use(fileUpload({ limits: { fileSize: process.env.LIMIT || 52428800 } }));
  app.use(express.urlencoded({ extended: false, limit: process.env.LIMIT }));
  app.use(express.json({ limit: process.env.LIMIT }));
  app.use(express.static("public"));
  app.use(flash());

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // Flash messages middleware
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
  });

  // ================================================================
  // GLOBAL MIDDLEWARE
  // ================================================================

  const middlewareAuth = require("./middleware/auth");
  app.use(middlewareAuth.authCheck);

  // ================================================================
  // ROUTES
  // ================================================================

  app.use("/", require("./modules/auth/auth.router"));
  app.use("/", require("./modules/problems/problems.router"));
  app.use("/admin", require("./modules/admin/admin.router"));

  // ================================================================
  // ERROR HANDLING
  // ================================================================

  // 404 Handler
  app.use((req, res, next) => {
    next(createError(404, "Page not found"));
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    const status_code = err.status || 500;
    const message = err.message || "Internal Server Error";

    console.error("Error:", err);

    // JSON response for API/AJAX requests
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf("json") > -1)) {
      return res.status(status_code).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }

    // Validation errors (400) - redirect back with flash message
    if (status_code === 400) {
      req.flash("error_msg", message);
      const back_url = req.header("Referer") || "/";
      return res.redirect(back_url);
    }

    // Other errors - render error page
    res.status(status_code).render("error", {
      title: status_code === 404 ? "Not Found" : "Error",
      message: message,
      error: process.env.NODE_ENV === "development" ? err : { status: status_code },
    });
  });

  return app;
};

module.exports = createApp;
