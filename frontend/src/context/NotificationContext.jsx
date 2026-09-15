"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.isRead
      ).length,
    [notifications]
  );

  const setNotificationList = useCallback((items = []) => {
    setNotifications(Array.isArray(items) ? items : []);
  }, []);

  const addNotification = useCallback((notification) => {
    if (!notification) return;

    setNotifications((current) => [
      notification,
      ...current,
    ]);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    if (!notificationId) return;

    setNotifications((current) =>
      current.map((notification) =>
        (notification._id || notification.id) ===
        notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  }, []);

  const removeNotification = useCallback(
    (notificationId) => {
      if (!notificationId) return;

      setNotifications((current) =>
        current.filter(
          (notification) =>
            (notification._id || notification.id) !==
            notificationId
        )
      );
    },
    []
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    [
      notifications,
      loading,
      unreadCount,
      setNotificationList,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearNotifications,
    ]
  );

  useEffect(() => {
    return () => {
      setNotifications([]);
    };
  }, []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotificationContext must be used inside NotificationProvider."
    );
  }

  return context;
};

export default NotificationContext;