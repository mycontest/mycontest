const authService = require('../../services/auth.service');
const ApiResponse = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

class AuthController {
  /**
   * Register new user
   */
  register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    // Set session
    req.session.user = user;

    return ApiResponse.created(res, user, 'User registered successfully');
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req, res) => {
    const user = await authService.login(req.body);

    // Set session
    req.session.user = user;

    return ApiResponse.success(res, user, 'Login successful');
  });

  /**
   * Logout user
   */
  logout = asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        throw { statusCode: 500, message: 'Failed to logout' };
      }
      return ApiResponse.success(res, null, 'Logout successful');
    });
  });

  /**
   * Get current user
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);
    return ApiResponse.success(res, user);
  });

  /**
   * Get user by ID
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.params.id);
    return ApiResponse.success(res, user);
  });

  /**
   * Update profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    // Update session
    req.session.user = { ...req.session.user, ...user };

    return ApiResponse.success(res, user, 'Profile updated successfully');
  });

  /**
   * Change password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { old_password, new_password } = req.body;
    const result = await authService.changePassword(req.user.id, old_password, new_password);
    return ApiResponse.success(res, null, result.message);
  });
}

module.exports = new AuthController();
