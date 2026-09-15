"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/admin/layout";
import notificationService from "@/services/notification.service";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import "./notifications.css";

const NOTIFICATION_TYPES = [
  "ALL",
  "LEAD",
  "TASK",
  "LEAVE",
  "ATTENDANCE",
  "SYSTEM",
];

const getNotificationId = (notification) =>
  notification?._id ||
  notification?.id ||
  notification?.notificationId ||
  `${notification?.createdAt || "notification"}-${notification?.title || "item"}`;

const getNotificationTitle = (notification) =>
  notification?.title ||
  notification?.subject ||
  notification?.message ||
  "Notification";

const getNotificationMessage = (notification) =>
  notification?.message ||
  notification?.description ||
  notification?.body ||
  "You have a new notification.";

const getNotificationType = (notification) => {
  const type = notification?.type || notification?.category || "SYSTEM";
  return String(type).toUpperCase();
};

const getNotificationDate = (notification) =>
  notification?.createdAt ||
  notification?.date ||
  notification?.updatedAt ||
  null;

const isReadNotification = (notification) =>
  Boolean(
    notification?.read === true ||
      notification?.isRead === true ||
      notification?.readAt
  );

const normalizeNotifications = (response) => {
  const value = response?.data ?? response;

  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.notifications)) return value.notifications;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;

  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTypeVariant = (type) => {
  switch (type) {
    case "LEAD":
      return "info";
    case "TASK":
      return "warning";
    case "LEAVE":
      return "danger";
    case "ATTENDANCE":
      return "success";
    default:
      return "default";
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getNotifications();
      const data = normalizeNotifications(response);

      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(
        err?.message ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const title = getNotificationTitle(notification).toLowerCase();
      const message = getNotificationMessage(notification).toLowerCase();
      const type = getNotificationType(notification);
      const isRead = isReadNotification(notification);

      const matchesSearch =
        !query ||
        title.includes(query) ||
        message.includes(query) ||
        type.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" || type === typeFilter;

      const matchesRead =
        readFilter === "ALL" ||
        (readFilter === "READ" && isRead) ||
        (readFilter === "UNREAD" && !isRead);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [notifications, search, typeFilter, readFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / itemsPerPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredNotifications.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !isReadNotification(notification)
      ).length,
    [notifications]
  );

  const handleMarkAsRead = async (notification) => {
    const id = getNotificationId(notification);

    if (!id || isReadNotification(notification)) return;

    try {
      setActionLoading(true);

      if (typeof notificationService.markAsRead === "function") {
        await notificationService.markAsRead(id);
      }

      setNotifications((previous) =>
        previous.map((item) =>
          getNotificationId(item) === id
            ? {
                ...item,
                read: true,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError(
        err?.message ||
          "Unable to update the notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !isReadNotification(notification)
    );

    if (!unreadNotifications.length) return;

    try {
      setActionLoading(true);
      setError("");

      if (typeof notificationService.markAllAsRead === "function") {
        await notificationService.markAllAsRead();
      } else if (typeof notificationService.markAsRead === "function") {
        await Promise.all(
          unreadNotifications.map((notification) =>
            notificationService.markAsRead(
              getNotificationId(notification)
            )
          )
        );
      }

      const readAt = new Date().toISOString();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
          readAt,
        }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError(
        err?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadNotifications();
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  const handleReadChange = (event) => {
    setReadFilter(event.target.value);
    setPage(1);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-notifications-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-notifications-page">
        <div className="admin-notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>
              Stay updated with important activities and system events.
            </p>
          </div>

          <div className="admin-notifications-header-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={actionLoading || unreadCount === 0}
            >
              Mark All as Read
            </Button>
          </div>
        </div>

        {error && (
          <div className="admin-notifications-error">
            {error}
          </div>
        )}

        <div className="admin-notifications-summary">
          <div className="notification-summary-card">
            <span className="notification-summary-label">
              Total Notifications
            </span>
            <strong>{notifications.length}</strong>
          </div>

          <div className="notification-summary-card notification-summary-unread">
            <span className="notification-summary-label">
              Unread Notifications
            </span>
            <strong>{unreadCount}</strong>
          </div>

          <div className="notification-summary-card">
            <span className="notification-summary-label">
              Read Notifications
            </span>
            <strong>{notifications.length - unreadCount}</strong>
          </div>
        </div>

        <div className="admin-notifications-filters">
          <div className="notification-search">
            <SearchBox
              value={search}
              onChange={handleSearchChange}
              placeholder="Search notifications..."
            />
          </div>

          <div className="notification-filter">
            <label htmlFor="notification-type">
              Notification Type
            </label>
            <select
              id="notification-type"
              value={typeFilter}
              onChange={handleTypeChange}
            >
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "ALL"
                    ? "All Types"
                    : type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="notification-filter">
            <label htmlFor="notification-read-status">
              Read Status
            </label>
            <select
              id="notification-read-status"
              value={readFilter}
              onChange={handleReadChange}
            >
              <option value="ALL">All Notifications</option>
              <option value="READ">Read</option>
              <option value="UNREAD">Unread</option>
            </select>
          </div>
        </div>

        <div className="admin-notifications-card">
          <div className="admin-notifications-card-header">
            <div>
              <h2>Notification Center</h2>
              <span>
                {filteredNotifications.length} notification
                {filteredNotifications.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {paginatedNotifications.length === 0 ? (
            <div className="admin-notifications-empty">
              <div className="notification-empty-icon">✓</div>
              <h3>No Notifications Found</h3>
              <p>
                There are no notifications matching your current filters.
              </p>
            </div>
          ) : (
            <div className="admin-notifications-list">
              {paginatedNotifications.map((notification) => {
                const id = getNotificationId(notification);
                const type = getNotificationType(notification);
                const isRead = isReadNotification(notification);

                return (
                  <div
                    className={`admin-notification-item ${
                      isRead
                        ? "admin-notification-read"
                        : "admin-notification-unread"
                    }`}
                    key={id}
                  >
                    <div className="notification-status-indicator" />

                    <div className="notification-content">
                      <div className="notification-top-row">
                        <div className="notification-title-wrap">
                          <h3>
                            {getNotificationTitle(notification)}
                          </h3>

                          <Badge variant={getTypeVariant(type)}>
                            {type}
                          </Badge>
                        </div>

                        {!isRead && (
                          <span className="notification-unread-label">
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="notification-message">
                        {getNotificationMessage(notification)}
                      </p>

                      <div className="notification-bottom-row">
                        <span className="notification-date">
                          {formatDate(
                            getNotificationDate(notification)
                          )}
                        </span>

                        {!isRead && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={() =>
                              handleMarkAsRead(notification)
                            }
                            disabled={actionLoading}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredNotifications.length > itemsPerPage && (
            <div className="admin-notifications-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotificationsPage;