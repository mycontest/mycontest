require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
// const problemRoutes = require("./modules/problem/problem.routes");
// const contestRoutes = require("./modules/contest/contest.routes");
// const discussionRoutes = require("./modules/discussion/discussion.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error");
const { generalLimiter } = require("./middleware/rate");

const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(express.json({ limit: "10mb" }));
  app.use(compression());

  const node_env = process.env.NODE_ENV || "development";
  if (node_env === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  app.use(generalLimiter);

  // Mount routes
  app.use("/api/auth", authRoutes);
  // app.use("/api/problems", problemRoutes);
  // app.use("/api/contests", contestRoutes);
  // app.use("/api/discussions", discussionRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
