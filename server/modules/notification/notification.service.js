const { dbQueryOne, dbQueryMany } = require("../../utils/mysql");
const { PAGINATION } = require("../../utils/constants");

class NotificationService {
  /**
   * Get user notifications
   */
  async getUserNotifications(userId, { page = 1, limit = PAGINATION.DEFAULT_LIMIT, unread_only = false }) {
    const offset = (page - 1) * limit;
    let whereConditions = ["user_id = ?"];
    let params = [userId];

    if (unread_only) {
      whereConditions.push("is_read = FALSE");
    }

    const whereClause = whereConditions.join(" AND ");

    const [notifications, countResult] = await Promise.all([
      dbQueryMany(
        `SELECT *
         FROM notifications
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      dbQueryOne(`SELECT COUNT(*) as total FROM notifications WHERE ${whereClause}`, params),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total: countResult.total,
      },
    };
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId) {
    const result = await dbQueryOne("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE", [userId]);

    return result.count;
  }

  /**
   * Create notification
   */
  async createNotification({ user_id, type, title, message, link = null }) {
    const result = await dbQueryOne(
      `INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, FALSE, NOW())`,
      [user_id, type, title, message, link]
    );

    return {
      id: result.insertId,
      user_id,
      type,
      title,
      message,
      link,
      is_read: false,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await dbQueryOne("SELECT user_id FROM notifications WHERE id = ?", [notificationId]);

    if (!notification) {
      throw { statusCode: 404, message: "Notification not found" };
    }

    if (notification.user_id !== userId) {
      throw { statusCode: 403, message: "Not authorized" };
    }

    await dbQueryOne("UPDATE notifications SET is_read = TRUE WHERE id = ?", [notificationId]);

    return { message: "Notification marked as read" };
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds, userId) {
    if (!notificationIds || notificationIds.length === 0) {
      throw { statusCode: 400, message: "No notification IDs provided" };
    }

    const placeholders = notificationIds.map(() => "?").join(",");

    await dbQueryOne(
      `UPDATE notifications SET is_read = TRUE
       WHERE id IN (${placeholders}) AND user_id = ?`,
      [...notificationIds, userId]
    );

    return { message: "Notifications marked as read" };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    await dbQueryOne("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE", [userId]);

    return { message: "All notifications marked as read" };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await dbQueryOne("SELECT user_id FROM notifications WHERE id = ?", [notificationId]);

    if (!notification) {
      throw { statusCode: 404, message: "Notification not found" };
    }

    if (notification.user_id !== userId) {
      throw { statusCode: 403, message: "Not authorized" };
    }

    await dbQueryOne("DELETE FROM notifications WHERE id = ?", [notificationId]);

    return { message: "Notification deleted successfully" };
  }

  /**
   * Notify user about new submission result
   */
  async notifySubmissionResult(userId, problemTitle, status) {
    const statusMessages = {
      accepted: "✅ Accepted",
      wrong_answer: "❌ Wrong Answer",
      time_limit_exceeded: "⏱️ Time Limit Exceeded",
      memory_limit_exceeded: "💾 Memory Limit Exceeded",
      runtime_error: "⚠️ Runtime Error",
      compilation_error: "🔧 Compilation Error",
    };

    return this.createNotification({
      user_id: userId,
      type: "submission",
      title: `Submission ${statusMessages[status] || status}`,
      message: `Your submission for "${problemTitle}" has been evaluated: ${statusMessages[status] || status}`,
      link: `/problems/${problemTitle}`,
    });
  }

  /**
   * Notify user about new reply to their discussion
   */
  async notifyDiscussionReply(userId, discussionId, replierName) {
    return this.createNotification({
      user_id: userId,
      type: "discussion",
      title: "New Reply",
      message: `${replierName} replied to your discussion`,
      link: `/discuss/${discussionId}`,
    });
  }

  /**
   * Notify user about contest starting soon
   */
  async notifyContestStarting(userId, contestTitle, contestId) {
    return this.createNotification({
      user_id: userId,
      type: "contest",
      title: "Contest Starting Soon",
      message: `"${contestTitle}" will start in 30 minutes`,
      link: `/contests/${contestId}`,
    });
  }
}

module.exports = new NotificationService();
