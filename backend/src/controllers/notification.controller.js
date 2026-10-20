const service = require("../services/notification.service");

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const broadcastNotification = asyncHandler(async (req, res) => {
  const result = await service.broadcastToStaff({ ...req.body, createdBy: req.user.userId });
  res.status(201).json({ success: true, message: "Notification sent successfully", data: result });
});

const getSentBroadcasts = asyncHandler(async (req, res) => {
  const result = await service.getSentBroadcasts({ ...req.query, createdBy: req.user.userId });
  res.json({ success: true, message: "Sent notification history fetched", data: result.notifications, pagination: result.pagination });
});

const createNotification = asyncHandler(async (req, res) => {
  const result = await service.createNotification({ ...req.body, createdBy: req.user.userId });
  res.status(201).json({ success: true, message: "Notification created successfully", data: result });
});
const createBulkNotifications = asyncHandler(async (req, res) => {
  const result = await service.createBulkNotifications({ ...req.body, createdBy: req.user.userId });
  res.status(201).json({ success: true, message: "Notifications created successfully", data: result });
});
const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await service.getMyNotifications(req.user.userId, req.query);
  res.json({ success: true, message: "Notifications fetched successfully", data: result.notifications, pagination: result.pagination });
});
const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await service.getUnreadCount(req.user.userId);
  res.json({ success: true, message: "Unread count fetched", data: result });
});
const getNotification = asyncHandler(async (req, res) => {
  const result = await service.getNotificationById(req.params.id, req.user.userId);
  res.json({ success: true, data: result });
});
const markAsRead = asyncHandler(async (req, res) => {
  const result = await service.markAsRead(req.params.id, req.user.userId);
  res.json({ success: true, message: "Notification marked as read", data: result });
});
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await service.markAllAsRead(req.user.userId);
  res.json({ success: true, message: "All notifications marked as read", data: result });
});
const deleteNotification = asyncHandler(async (req, res) => {
  const result = await service.deleteNotification(req.params.id, req.user.userId);
  res.json({ success: true, data: result });
});
const deleteReadNotifications = asyncHandler(async (req, res) => {
  const result = await service.deleteReadNotifications(req.user.userId);
  res.json({ success: true, data: result });
});
const getRecordNotifications = asyncHandler(async (req, res) => {
  const result = await service.getRecordNotifications(req.params.recordId, req.query);
  res.json({ success: true, data: result.notifications, pagination: result.pagination });
});
const removeExpiredNotifications = asyncHandler(async (req, res) => {
  const result = await service.removeExpiredNotifications();
  res.json({ success: true, data: result });
});

module.exports = { broadcastNotification, getSentBroadcasts, createNotification, createBulkNotifications, getMyNotifications, getUnreadCount, getNotification, markAsRead, markAllAsRead, deleteNotification, deleteReadNotifications, getRecordNotifications, removeExpiredNotifications };
