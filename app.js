require("dotenv").config();

const express = require("express");
const session = require("express-session");
const redis = require("./shared/utils/redis");
const RedisStore = require("connect-redis").default;
const homeRouter = require("./modules/home/home.router");
const authRouter = require("./modules/auth/auth.router");
const adminRouter = require("./modules/admin/admin.router");
const problemRouter = require("./modules/problem/problem.router");
const contestRouter = require("./modules/contest/contest.router");
const { nextError } = require("./modules/error/error.controller");
const { initDatabase } = require("./shared/utils/mysql");

const app = express();

initDatabase();

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// Global Middleware
app.use((req, res, next) => {
  res.locals.error = req.session.error;
  res.locals.success = req.session.success;
  res.locals.user = req.session.user;
  delete req.session.error;
  delete req.session.success;
  next();
});

app.use("/", homeRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/problems", problemRouter);
app.use("/contests", contestRouter);

// Error Route
app.use(nextError);

// Start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
