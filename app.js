// load environment variables
require("dotenv").config();

const { nextError, nextMissed } = require("./modules/error/error.controller");
const { fnAuthCheck, fnAuthAdmin, fnAuthContest } = require("./modules/auth/auth.middleware");
const { fnGetRedisClient } = require("./shared/redis");
const express = require("express");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const RedisStore = require("connect-redis").RedisStore;
const authRouter = require("./modules/auth/auth.router");
const contestRouter = require("./modules/contest/contest.router");
const adminRouter = require("./modules/admin/admin.router");

async function startServer() {
  const app = express();

  const redisClient = await fnGetRedisClient();

  // cookie parser
  app.use(cookieParser(process.env.SECRET));
  app.use(
    session({
      secret: process.env.SECRET,
      store: new RedisStore({ client: redisClient }),
      cookie: { maxAge: 12 * 3600000, secure: false, httpOnly: true, sameSite: "lax" },
      saveUninitialized: false,
      resave: false,
    })
  );

  app.use(flash());

  app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
  });

  // file upload
  app.use(fileUpload({ limits: { fileSize: process.env.LIMIT } }));

  // config
  app.use(express.urlencoded({ extended: false, limit: process.env.LIMIT }));
  app.use(express.json({ limit: process.env.LIMIT }));
  app.use(express.static("public"));
  app.set("view engine", "ejs");

  // router use
  app.use("/", fnAuthCheck);
  app.use("/", authRouter);
  app.use("/contest/:id", fnAuthContest, contestRouter);
  app.use("/admin", fnAuthAdmin, adminRouter);

  // error handling middleware
  app.use(nextError);
  app.use(nextMissed);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
}

startServer().catch(console.error);
