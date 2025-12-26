const bcrypt = require('bcryptjs');
const { dbQueryOne, dbQueryMany } = require('../config/database');
const config = require('../config');

class AuthService {
  /**
   * Register a new user
   */
  async register({ full_name, email, password, username }) {
    // Check if user already exists
    const existingUser = await dbQueryOne(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      throw { statusCode: 409, message: 'User already exists with this email or username' };
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create user
    const result = await dbQueryOne(
      `INSERT INTO users (full_name, email, username, password_hash, role, created_at)
       VALUES (?, ?, ?, ?, 'user', NOW())`,
      [full_name, email, username, password_hash]
    );

    // Get created user
    const user = await dbQueryOne(
      'SELECT id, full_name, email, username, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return user;
  }

  /**
   * Login user
   */
  async login({ username, password }) {
    // Get user by username or email
    const user = await dbQueryOne(
      `SELECT id, full_name, email, username, password_hash, role, created_at
       FROM users
       WHERE username = ? OR email = ?`,
      [username, username]
    );

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // Remove password_hash from response
    delete user.password_hash;

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await dbQueryOne(
      `SELECT id, full_name, email, username, role, bio, avatar_url, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }

  /**
   * Get user profile with stats
   */
  async getUserProfile(userId) {
    const [user, stats] = await Promise.all([
      dbQueryOne(
        `SELECT id, full_name, email, username, role, bio, avatar_url, created_at
         FROM users
         WHERE id = ?`,
        [userId]
      ),
      dbQueryOne(
        `SELECT
          COUNT(DISTINCT s.id) as total_submissions,
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as solved_problems,
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.id END) as accepted_submissions
         FROM submissions s
         WHERE s.user_id = ?`,
        [userId]
      )
    ]);

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      ...user,
      stats: stats || {
        total_submissions: 0,
        solved_problems: 0,
        accepted_submissions: 0
      }
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const allowedFields = ['full_name', 'bio', 'avatar_url'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (updateFields.length === 0) {
      throw { statusCode: 400, message: 'No valid fields to update' };
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);

    await dbQueryOne(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, userId]
    );

    return this.getUserById(userId);
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await dbQueryOne(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      throw { statusCode: 401, message: 'Invalid current password' };
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    await dbQueryOne(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, userId]
    );

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();
