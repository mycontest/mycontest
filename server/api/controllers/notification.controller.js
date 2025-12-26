const notificationService = require('../../services/notification.service');
const ApiResponse = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

class NotificationController {
  /**
   * Get user notifications
   */
  getNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getUserNotifications(req.user.id, req.query);
    return ApiResponse.paginated(res, result.notifications, result.pagination);
  });

  /**
   * Get unread count
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    return ApiResponse.success(res, { count });
  });

  /**
   * Mark notification as read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAsRead(req.params.id, req.user.id);
    return ApiResponse.success(res, null, result.message);
  });

  /**
   * Mark multiple notifications as read
   */
  markMultipleAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markMultipleAsRead(
      req.body.notification_ids,
      req.user.id
    );
    return ApiResponse.success(res, null, result.message);
  });

  /**
   * Mark all notifications as read
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user.id);
    return ApiResponse.success(res, null, result.message);
  });

  /**
   * Delete notification
   */
  deleteNotification = asyncHandler(async (req, res) => {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    return ApiResponse.success(res, null, result.message);
  });
}

module.exports = new NotificationController();
