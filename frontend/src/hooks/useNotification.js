"use client";

import { useCallback } from "react";
import { useNotificationContext } from "../context/NotificationContext";

const useNotification = () => {
  const {
    notifications,
    loading,
    setLoading,
    unreadCount,
    setNotificationList,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotificationContext();

  const getNotificationId = useCallback(
    (notification) =>
      notification?._id || notification?.id || null,
    []
  );

  const findNotification = useCallback(
    (notificationId) => {
      if (!notificationId) return null;

      return (
        notifications.find(
          (notification) =>
            getNotificationId(notification) ===
            notificationId
        ) || null
      );
    },
    [notifications, getNotificationId]
  );

  const markNotificationAsRead = useCallback(
    (notification) => {
      const notificationId =
        typeof notification === "string"
          ? notification
          : getNotificationId(notification);

      if (!notificationId) return;

      markAsRead(notificationId);
    },
    [getNotificationId, markAsRead]
  );

  const removeNotificationById = useCallback(
    (notification) => {
      const notificationId =
        typeof notification === "string"
          ? notification
          : getNotificationId(notification);

      if (!notificationId) return;

      removeNotification(notificationId);
    },
    [getNotificationId, removeNotification]
  );

  return {
    notifications,
    loading,
    setLoading,
    unreadCount,

    setNotificationList,
    addNotification,

    markAsRead: markNotificationAsRead,
    markAllAsRead,

    removeNotification: removeNotificationById,
    clearNotifications,

    findNotification,
    getNotificationId,
  };
};

export default useNotification;