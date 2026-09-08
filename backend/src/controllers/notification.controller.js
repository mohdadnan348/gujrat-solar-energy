const notificationService = require("../services/notification.service");

/**
 * Create notification
 */
const createNotification = async (req, res, next) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      module,
      recordId,
      recordType,
      actionUrl,
      priority,
      expiresAt,
      metadata,
    } = req.body;

    const notification =
      await notificationService.createNotification({
        recipient,
        type,
        title,
        message,
        module,
        recordId,
        recordType,
        actionUrl,
        priority,
        expiresAt,
        metadata,
        createdBy: req.user.userId,
      });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create bulk notifications
 */
const createBulkNotifications = async (
  req,
  res,
  next
) => {
  try {
    const {
      recipients,
      type,
      title,
      message,
      module,
      recordId,
      recordType,
      actionUrl,
      priority,
      expiresAt,
      metadata,
    } = req.body;

    const notifications =
      await notificationService.createBulkNotifications({
        recipients,
        type,
        title,
        message,
        module,
        recordId,
        recordType,
        actionUrl,
        priority,
        expiresAt,
        metadata,
        createdBy: req.user.userId,
      });

    return res.status(201).json({
      success: true,
      message: "Bulk notifications created successfully",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's notifications
 */
const getMyNotifications = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 20,
      isRead,
      type,
      priority,
      search = "",
    } = req.query;

    const result =
      await notificationService.getMyNotifications(
        req.user.userId,
        {
          page,
          limit,
          isRead,
          type,
          priority,
          search,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (
  req,
  res,
  next
) => {
  try {
    const count =
      await notificationService.getUnreadCount(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Unread notification count fetched successfully",
      data: {
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification by ID
 */
const getNotification = async (
  req,
  res,
  next
) => {
  try {
    const notification =
      await notificationService.getNotificationById(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Notification fetched successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (
  req,
  res,
  next
) => {
  try {
    const notification =
      await notificationService.markAsRead(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await notificationService.markAllAsRead(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await notificationService.deleteNotification(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 */
const deleteReadNotifications = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await notificationService.deleteReadNotifications(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Read notifications deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for a specific record
 */
const getRecordNotifications = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 20,
    } = req.query;

    const result =
      await notificationService.getRecordNotifications(
        req.params.recordId,
        {
          page,
          limit,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Record notifications fetched successfully",
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove expired notifications
 */
const removeExpiredNotifications = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await notificationService.removeExpiredNotifications();

    return res.status(200).json({
      success: true,
      message: "Expired notifications removed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getMyNotifications,
  getUnreadCount,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getRecordNotifications,
  removeExpiredNotifications,
};