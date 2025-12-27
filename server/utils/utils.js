const fnWrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const decodeToken = (req) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;
  if (!token) return null;
  try {
    const jwtSecret = process.env.JWT_SECRET || process.env.SECRET || "change-me";
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    return null;
  }
};

const issueToken = (payload) => {
  const jwt = require("jsonwebtoken");
  const jwtSecret = process.env.JWT_SECRET || process.env.SECRET || "change-me";
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
};

module.exports = {
  fnWrap,
  toInt,
  decodeToken,
  issueToken,
};
