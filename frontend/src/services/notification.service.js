import api from "@/services/api";

const BASE_URL = "/notifications";

export const getMyNotifications = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/my`, {
    params,
  });

  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get(
    `${BASE_URL}/unread-count`
  );

  return response.data;
};

export const markNotificationAsRead = async (
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

export const markAllNotificationsAsRead = async () => {
  const response = await api.put(
    `${BASE_URL}/read-all`
  );

  return response.data;
};

const notificationService = {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;