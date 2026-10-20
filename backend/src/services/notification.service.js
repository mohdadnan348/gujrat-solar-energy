const crypto = require("crypto");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { ROLES, USER_STATUS } = require("../config/constants");

const makeError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const safePage = (value, fallback) => Math.max(1, Math.min(100000, Number(value) || fallback));

const createNotification = async (data) => {
  if (!data.recipient) throw makeError("Notification recipient is required");
  if (!data.title?.trim() || !data.message?.trim()) throw makeError("Title and message are required");
  const recipient = await User.findById(data.recipient).select("_id").lean();
  if (!recipient) throw makeError("Notification recipient not found", 404);
  return Notification.create({
    recipient: data.recipient,
    createdBy: data.createdBy || null,
    type: data.type || "system",
    title: data.title.trim(), message: data.message.trim(),
    module: data.module || "notifications", recordId: data.recordId || null,
    recordType: data.recordType || null, actionUrl: data.actionUrl || null,
    priority: data.priority || "normal", expiresAt: data.expiresAt || null,
    metadata: data.metadata || {},
  });
};

const createBulkNotifications = async (data) => {
  const recipients = [...new Set((data.recipients || []).map(String))];
  if (!recipients.length) throw makeError("At least one recipient is required");
  if (!data.title?.trim() || !data.message?.trim()) throw makeError("Title and message are required");
  const users = await User.find({ _id: { $in: recipients } }).select("_id").lean();
  if (users.length !== recipients.length) throw makeError("One or more recipients were not found", 404);
  return Notification.insertMany(recipients.map((recipient) => ({
    recipient, createdBy: data.createdBy || null, type: data.type || "system",
    title: data.title.trim(), message: data.message.trim(), module: data.module || "notifications",
    recordId: data.recordId || null, recordType: data.recordType || null,
    actionUrl: data.actionUrl || null, priority: data.priority || "normal",
    expiresAt: data.expiresAt || null, metadata: data.metadata || {},
  })));
};

const broadcastToStaff = async ({ title, message, audience = "ALL", createdBy }) => {
  const cleanTitle = String(title || "").trim();
  const cleanMessage = String(message || "").trim();
  if (!cleanTitle || !cleanMessage) throw makeError("Title and message are required");
  if (cleanTitle.length > 160) throw makeError("Title must be 160 characters or fewer");
  if (cleanMessage.length > 5000) throw makeError("Message must be 5000 characters or fewer");
  if (!["ALL", "EMPLOYEE"].includes(audience)) throw makeError("Invalid audience");
  const roles = [ROLES.EMPLOYEE];
  const recipients = await User.find({ role: { $in: roles }, status: USER_STATUS.ACTIVE }).select("_id").lean();
  if (!recipients.length) throw makeError("No active employees were found", 404);
  const broadcastId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  const sentAt = new Date();
  const result = await Notification.insertMany(recipients.map(({ _id }) => ({
    recipient: _id, createdBy, type: "system", title: cleanTitle, message: cleanMessage,
    module: "notifications", priority: "normal", isBroadcast: true, broadcastId,
    audienceRole: audience, metadata: { sentAt }, createdAt: sentAt, updatedAt: sentAt,
  })));
  return { broadcastId, title: cleanTitle, message: cleanMessage, audience, sentAt, recipientCount: result.length };
};

const getSentBroadcasts = async ({ page = 1, limit = 20, createdBy }) => {
  const pageNumber = safePage(page, 1);
  const limitNumber = Math.min(100, safePage(limit, 20));
  const match = { isBroadcast: true, createdBy: new mongoose.Types.ObjectId(createdBy) };
  const [groups, countResult] = await Promise.all([
    Notification.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: "$broadcastId", title: { $first: "$title" }, message: { $first: "$message" },
        audience: { $first: "$audienceRole" }, sentAt: { $first: "$createdAt" },
        recipientCount: { $sum: 1 }, readCount: { $sum: { $cond: ["$isRead", 1, 0] } },
      } },
      { $sort: { sentAt: -1 } }, { $skip: (pageNumber - 1) * limitNumber }, { $limit: limitNumber },
    ]),
    Notification.aggregate([{ $match: match }, { $group: { _id: "$broadcastId" } }, { $count: "total" }]),
  ]);
  const total = countResult[0]?.total || 0;
  return { notifications: groups, pagination: { page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) } };
};

const getNotifications = async ({ recipient, page = 1, limit = 20, isRead, type, priority, search = "" } = {}) => {
  const pageNumber = safePage(page, 1);
  const limitNumber = Math.min(100, safePage(limit, 20));
  const filter = { recipient, $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: new Date() } }] };
  if (isRead !== undefined && isRead !== "") filter.isRead = isRead === true || isRead === "true";
  if (type) filter.type = String(type).toLowerCase();
  if (priority) filter.priority = priority;
  if (String(search).trim()) {
    const regex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$and = [{ $or: [{ title: regex }, { message: regex }] }];
  }
  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ isRead: 1, createdAt: -1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber).lean(),
    Notification.countDocuments(filter),
  ]);
  return { notifications, pagination: { page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) } };
};

const getMyNotifications = (userId, options = {}) => getNotifications({ ...options, recipient: userId });
const getNotificationById = async (id, userId) => {
  const notification = await Notification.findOne({ _id: id, recipient: userId }).lean();
  if (!notification) throw makeError("Notification not found", 404);
  return notification;
};
const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { $set: { isRead: true, readAt: new Date() } }, { new: true });
  if (!notification) throw makeError("Notification not found", 404);
  return notification;
};
const markAsUnread = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { $set: { isRead: false, readAt: null } }, { new: true });
  if (!notification) throw makeError("Notification not found", 404);
  return notification;
};
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  return { modifiedCount: result.modifiedCount || 0 };
};
const getUnreadCount = async (userId) => ({ count: await Notification.countDocuments({ recipient: userId, isRead: false, $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: new Date() } }] }) });
const deleteNotification = async (id, userId) => {
  const result = await Notification.deleteOne({ _id: id, recipient: userId });
  if (!result.deletedCount) throw makeError("Notification not found", 404);
  return { message: "Notification deleted successfully" };
};
const deleteReadNotifications = async (userId) => {
  const result = await Notification.deleteMany({ recipient: userId, isRead: true });
  return { deleted: result.deletedCount || 0 };
};
const getRecordNotifications = async (recordId, { page = 1, limit = 20 } = {}) => {
  const pageNumber = safePage(page, 1); const limitNumber = Math.min(100, safePage(limit, 20));
  const filter = { $or: [{ recordId }, { "metadata.recordId": recordId }] };
  const [notifications, total] = await Promise.all([Notification.find(filter).sort({ createdAt: -1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber).lean(), Notification.countDocuments(filter)]);
  return { notifications, pagination: { page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) } };
};
const removeExpiredNotifications = async () => {
  const result = await Notification.deleteMany({ expiresAt: { $ne: null, $lt: new Date() } });
  return { deleted: result.deletedCount || 0 };
};

module.exports = { createNotification, createBulkNotifications, broadcastToStaff, getSentBroadcasts, getNotifications, getMyNotifications, getNotificationById, markAsRead, markAsUnread, markAllAsRead, getUnreadCount, deleteNotification, deleteReadNotifications, getRecordNotifications, removeExpiredNotifications };
