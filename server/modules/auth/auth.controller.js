const { fnRegister, fnLogin, fnGetUserProfile, fnUpdateProfile, fnChangePassword } = require("./auth.service");
const response = require("../../utils/response");
const { fnWrap, issueToken } = require("../../utils/utils");

const authRegister = fnWrap(async (req, res) => {
  const user = await fnRegister(req.body);
  const token = issueToken(user);
  return response.created(res, { user, token }, "User registered successfully");
});

const authLogin = fnWrap(async (req, res) => {
  const user = await fnLogin(req.body);
  const token = issueToken(user);
  return response.success(res, { user, token }, "Login successful");
});

const authLogout = fnWrap(async (req, res) => {
  return response.success(res, null, "Logout successful");
});

const authMe = fnWrap(async (req, res) => {
  const user = await fnGetUserProfile(req.user.id);
  return response.success(res, user);
});

const authGetUser = fnWrap(async (req, res) => {
  const user = await fnGetUserProfile(req.params.id);
  return response.success(res, user);
});

const authUpdateProfile = fnWrap(async (req, res) => {
  const user = await fnUpdateProfile(req.user.id, req.body);
  return response.success(res, user, "Profile updated successfully");
});

const authChangePassword = fnWrap(async (req, res) => {
  const { old_password, new_password } = req.body;
  const result = await fnChangePassword(req.user.id, old_password, new_password);
  return response.success(res, null, result.message);
});

module.exports = {
  authRegister,
  authLogin,
  authLogout,
  authMe,
  authGetUser,
  authUpdateProfile,
  authChangePassword,
};
