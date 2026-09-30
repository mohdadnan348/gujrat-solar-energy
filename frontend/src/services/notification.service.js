import api from "@/services/api";

const BASE_URL = "/notifications";

/**
 * Get current user's notifications
 */
const getNotifications = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/my`, {
    params,
  });

  return response.data;
};

/**
 * Alias for backward compatibility
 */
const getMyNotifications = async (params = {}) => {
  return getNotifications(params);
};

/**
 * Get unread notification count
 */
const getUnreadCount = async () => {
  const response = await api.get(
    `${BASE_URL}/unread-count`
  );

  return response.data;
};

/**
 * Mark one notification as read
 */
const markNotificationAsRead = async (
  notificationId
) => {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${notificationId}/read`
  );

  return response.data;
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = async () => {
  const response = await api.put(
    `${BASE_URL}/read-all`
  );

  return response.data;
};

const notificationService = {
  getNotifications,
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;