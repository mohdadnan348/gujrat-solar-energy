"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import notificationService from "@/services/notification.service";

const EmployeeNotificationsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const limit = 10;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (
        typeof notificationService.getMyNotifications === "function"
      ) {
        response =
          await notificationService.getMyNotifications();
      } else if (
        typeof notificationService.getNotifications === "function"
      ) {
        response =
          await notificationService.getNotifications();
      } else {
        throw new Error(
          "Notification service is not available."
        );
      }

      const items =
        response?.data?.notifications ||
        response?.data?.items ||
        response?.notifications ||
        response?.items ||
        response?.data ||
        [];

      setNotifications(
        Array.isArray(items) ? items : []
      );
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );

      setError(
        err?.message ||
          "Unable to load notifications. Please try again."
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadNotifications();
    }
  }, [authLoading, user]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const getReadState = (notification) => {
    if (typeof notification?.isRead === "boolean") {
      return notification.isRead;
    }

    if (typeof notification?.read === "boolean") {
      return notification.read;
    }

    if (notification?.readAt) {
      return true;
    }

    return false;
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter(
        (notification) =>
          !getReadState(notification)
      );
    }

    if (filter === "read") {
      return notifications.filter(
        (notification) =>
          getReadState(notification)
      );
    }

    return notifications;
  }, [notifications, filter]);

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort(
      (a, b) => {
        const dateA = new Date(
          a?.createdAt ||
            a?.date ||
            a?.timestamp ||
            0
        );

        const dateB = new Date(
          b?.createdAt ||
            b?.date ||
            b?.timestamp ||
            0
        );

        return dateB - dateA;
      }
    );
  }, [filteredNotifications]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedNotifications.length / limit
    )
  );

  const paginatedNotifications = useMemo(() => {
    const start = (page - 1) * limit;

    return sortedNotifications.slice(
      start,
      start + limit
    );
  }, [sortedNotifications, page]);

  const unreadCount = notifications.filter(
    (notification) =>
      !getReadState(notification)
  ).length;

  const getTitle = (notification) =>
    notification?.title ||
    notification?.subject ||
    "Notification";

  const getMessage = (notification) =>
    notification?.message ||
    notification?.description ||
    notification?.body ||
    "You have a new notification.";

  const getType = (notification) =>
    notification?.type ||
    notification?.notificationType ||
    "GENERAL";

  const getTypeVariant = (type) => {
    const value = String(type).toLowerCase();

    if (
      value.includes("leave") ||
      value.includes("attendance")
    ) {
      return "info";
    }

    if (
      value.includes("task") ||
      value.includes("lead")
    ) {
      return "warning";
    }

    if (
      value.includes("success") ||
      value.includes("approved") ||
      value.includes("completed")
    ) {
      return "success";
    }

    if (
      value.includes("error") ||
      value.includes("rejected") ||
      value.includes("failed")
    ) {
      return "danger";
    }

    return "default";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markAsRead = async (notification) => {
    const id =
      notification?._id ||
      notification?.id;

    if (!id || getReadState(notification)) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      if (
        typeof notificationService.markAsRead ===
        "function"
      ) {
        await notificationService.markAsRead(id);
      } else if (
        typeof notificationService.markRead ===
        "function"
      ) {
        await notificationService.markRead(id);
      } else {
        throw new Error(
          "Mark as read service is not available."
        );
      }

      setNotifications((previous) =>
        previous.map((item) => {
          const itemId =
            item?._id || item?.id;

          if (itemId !== id) {
            return item;
          }

          return {
            ...item,
            isRead: true,
            read: true,
            readAt:
              new Date().toISOString(),
          };
        })
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );

      setError(
        err?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      if (
        typeof notificationService.markAllAsRead ===
        "function"
      ) {
        await notificationService.markAllAsRead();
      } else if (
        typeof notificationService.markAllRead ===
        "function"
      ) {
        await notificationService.markAllRead();
      } else {
        throw new Error(
          "Mark all as read service is not available."
        );
      }

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
          read: true,
          readAt:
            item?.readAt ||
            new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setError(
        err?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    await markAsRead(notification);

    const link =
      notification?.link ||
      notification?.url ||
      notification?.actionUrl;

    if (link) {
      window.location.href = link;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="employee-notifications-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      notificationCount={unreadCount}
    >
      <div className="employee-notifications-page">
        <div className="employee-notifications-header">
          <div>
            <span className="employee-notifications-eyebrow">
              Employee Portal
            </span>

            <h1>Notifications</h1>

            <p>
              Stay updated with your latest activities
              and important alerts.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={markAllAsRead}
            disabled={
              actionLoading ||
              unreadCount === 0
            }
          >
            {actionLoading
              ? "Processing..."
              : `Mark All as Read${
                  unreadCount
                    ? ` (${unreadCount})`
                    : ""
                }`}
          </Button>
        </div>

        {error && (
          <div className="employee-notifications-error">
            <span>{error}</span>

            <Button
              type="button"
              variant="secondary"
              onClick={loadNotifications}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="employee-notifications-toolbar">
          <div className="notification-filter-tabs">
            <button
              type="button"
              className={
                filter === "all"
                  ? "notification-filter active"
                  : "notification-filter"
              }
              onClick={() => setFilter("all")}
            >
              All
              <span>{notifications.length}</span>
            </button>

            <button
              type="button"
              className={
                filter === "unread"
                  ? "notification-filter active"
                  : "notification-filter"
              }
              onClick={() => setFilter("unread")}
            >
              Unread
              <span>{unreadCount}</span>
            </button>

            <button
              type="button"
              className={
                filter === "read"
                  ? "notification-filter active"
                  : "notification-filter"
              }
              onClick={() => setFilter("read")}
            >
              Read
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={loadNotifications}
          >
            Refresh
          </Button>
        </div>

        <div className="employee-notifications-card">
          {loading ? (
            <div className="employee-notifications-loader">
              <Loader />
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="employee-notifications-empty">
              <div className="notification-empty-icon">
                🔔
              </div>

              <h3>No notifications</h3>

              <p>
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "There are no notifications to display."}
              </p>
            </div>
          ) : (
            <>
              <div className="employee-notifications-list">
                {paginatedNotifications.map(
                  (notification, index) => {
                    const id =
                      notification?._id ||
                      notification?.id ||
                      index;

                    const isRead =
                      getReadState(notification);

                    const createdAt =
                      notification?.createdAt ||
                      notification?.date ||
                      notification?.timestamp;

                    const type =
                      getType(notification);

                    const hasLink =
                      Boolean(
                        notification?.link ||
                          notification?.url ||
                          notification?.actionUrl
                      );

                    return (
                      <div
                        key={id}
                        className={
                          isRead
                            ? "employee-notification-item"
                            : "employee-notification-item unread"
                        }
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        role={
                          hasLink
                            ? "button"
                            : undefined
                        }
                        tabIndex={
                          hasLink ? 0 : undefined
                        }
                      >
                        <div className="notification-icon">
                          {isRead ? "✓" : "●"}
                        </div>

                        <div className="notification-content">
                          <div className="notification-top">
                            <h3>
                              {getTitle(
                                notification
                              )}
                            </h3>

                            <Badge
                              variant={getTypeVariant(
                                type
                              )}
                            >
                              {String(type).replaceAll(
                                "_",
                                " "
                              )}
                            </Badge>
                          </div>

                          <p>
                            {getMessage(
                              notification
                            )}
                          </p>

                          <div className="notification-meta">
                            <span>
                              {formatDate(
                                createdAt
                              )}
                            </span>

                            <span>
                              {formatTime(
                                createdAt
                              )}
                            </span>

                            {!isRead && (
                              <span className="notification-unread-label">
                                Unread
                              </span>
                            )}
                          </div>
                        </div>

                        {!isRead && (
                          <button
                            type="button"
                            className="notification-read-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              markAsRead(
                                notification
                              );
                            }}
                            disabled={actionLoading}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              <div className="employee-notifications-footer">
                <span>
                  Showing{" "}
                  {(page - 1) * limit + 1} -{" "}
                  {Math.min(
                    page * limit,
                    sortedNotifications.length
                  )}{" "}
                  of {sortedNotifications.length}{" "}
                  notifications
                </span>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeNotificationsPage;