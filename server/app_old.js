// load environment variables
require("dotenv").config({ path: "../.env" });

const express = require("express");
const app = express();
const { error, missed } = require("./controllers/error");

// session setup
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const FileStore = require("session-file-store")(session);

// cookie parser
app.use(cookieParser(process.env.SECRET));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new FileStore({ path: path.join(__dirname, "/session"), logFn: function () {} }),
    cookie: { maxAge: 12 * 3600000, secure: false, httpOnly: false },
  })
);

// file upload
app.use(fileUpload({ limits: { fileSize: process.env.LIMIT } }));

// config
app.use(express.urlencoded({ extended: false, limit: process.env.LIMIT }));
app.use(express.json({ limit: process.env.LIMIT }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// router use
app.use("/", require("./router/main"));

// error handling middleware
app.use(error);
app.use(missed);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${process.env.DOMAIN}`));
