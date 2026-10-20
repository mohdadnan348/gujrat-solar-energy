import api from "@/services/api";

const BASE_URL = "/notifications";

const getNotifications = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/my`, { params });
  return response.data;
};

const getMyNotifications = async (params = {}) => {
  return getNotifications(params);
};

const getUnreadCount = async () => {
  const response = await api.get(`${BASE_URL}/unread-count`);
  return response.data;
};

const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const response = await api.put(`${BASE_URL}/${notificationId}/read`);
  return response.data;
};

const markAllNotificationsAsRead = async () => {
  const response = await api.put(`${BASE_URL}/read-all`);
  return response.data;
};

const broadcastToStaff = async ({ title, message, audience = "ALL" }) => {
  const response = await api.post(`${BASE_URL}/broadcast`, {
    title,
    message,
    audience,
  });

  return response.data;
};

const getBroadcastHistory = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/sent-history`, { params });
  return response.data;
};

// Backward-compatible aliases for existing callers.
const sendBroadcast = broadcastToStaff;
const getSentHistory = getBroadcastHistory;

const notificationService = {
  getNotifications,
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  broadcastToStaff,
  getBroadcastHistory,
  sendBroadcast,
  getSentHistory,
};

export default notificationService;