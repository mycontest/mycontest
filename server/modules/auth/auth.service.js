const { dbQueryOne } = require("../../utils/mysql");
const crypto = require("crypto");

const password_secret = process.env.PASSWORD_SECRET || process.env.SECRET || "";

const fnRegister = async ({ full_name, email, password, username }) => {
  const existing = await dbQueryOne("SELECT user_id FROM users WHERE email = ? OR username = ?", [email, username]);
  if (existing) {
    throw { statusCode: 409, message: "User already exists with this email or username" };
  }

  const hashed = `${password_secret}${password}`;
  const result = await dbQueryOne(`INSERT INTO users (full_name, email, username, password, role, subscription, created_at) VALUES (?, ?, ?, ?, 'user', 'free', NOW())`, [full_name, email, username, hashed]);
  const user = await dbQueryOne("SELECT user_id, full_name, email, username, role, subscription, created_at FROM users WHERE user_id = ?", [result.insertId]);

  return { ...user, id: user.user_id };
};

const fnLogin = async ({ username, password }) => {
  const user = await dbQueryOne(`SELECT user_id, full_name, email, username, password, role, subscription, created_at  FROM users  WHERE username = ? OR email = ?`, [username, username]);
  if (!user) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  const hashed = `${password_secret}${password}`;
  if (user.password !== hashed) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  delete user.password;
  return { ...user, id: user.user_id };
};

const fnGetUserById = async (user_id) => {
  const user = await dbQueryOne(`SELECT user_id, full_name, email, username, role, subscription, avatar_url, created_at FROM users WHERE user_id = ?`, [user_id]);
  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }
  return { ...user, id: user.user_id };
};

const fnGetUserProfile = async (user_id) => {
  const [user, stats] = await Promise.all([
    dbQueryOne(`SELECT user_id, full_name, email, username, role, subscription, avatar_url, created_at FROM users WHERE user_id = ?`, [user_id]),
    dbQueryOne(
      `SELECT
          COUNT(DISTINCT s.submission_id) as total_submissions,
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as solved_problems,
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.submission_id END) as accepted_submissions
       FROM submissions s
       WHERE s.user_id = ?`,
      [user_id]
    ),
  ]);

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  return {
    ...user,
    id: user.user_id,
    stats: stats || {
      total_submissions: 0,
      solved_problems: 0,
      accepted_submissions: 0,
    },
  };
};

const fnUpdateProfile = async (user_id, updates) => {
  const allowed = ["full_name", "avatar_url"];
  const update = Object.keys(updates).filter((key) => allowed.includes(key));

  if (update.length === 0) {
    throw { statusCode: 400, message: "No valid fields to update" };
  }

  const clause = update.map((field) => `${field} = ?`).join(", ");
  const values = update.map((field) => updates[field]);

  await dbQueryOne(`UPDATE users SET ${clause}, updated_at = NOW() WHERE user_id = ?`, [...values, user_id]);
  return fnGetUserById(user_id);
};

const fnChangePassword = async (user_id, old_password, new_password) => {
  const user = await dbQueryOne("SELECT password FROM users WHERE user_id = ?", [user_id]);

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  const old_hashed = `${password_secret}${old_password}`;
  if (user.password !== old_hashed) {
    throw { statusCode: 401, message: "Invalid current password" };
  }

  const new_hashed = `${password_secret}${new_password}`;
  await dbQueryOne("UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?", [new_hashed, user_id]);

  return { message: "Password changed successfully" };
};

module.exports = {
  fnRegister,
  fnLogin,
  fnGetUserById,
  fnGetUserProfile,
  fnUpdateProfile,
  fnChangePassword,
};
