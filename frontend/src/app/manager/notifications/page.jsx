"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import notificationService from "@/services/notification.service";

import "./notifications.css";

const PAGE_SIZE = 10;

const ManagerNotificationsPage = () => {
  const { loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] =
    useState(null);

  /* =========================
     LOAD NOTIFICATIONS
  ========================= */

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await notificationService.getNotifications();

      const data =
        response?.data?.notifications ||
        response?.data?.data ||
        response?.notifications ||
        response?.data ||
        response ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load notifications."
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, readFilter, typeFilter]);

  /* =========================
     HELPERS
  ========================= */

  const getNotificationTitle = (notification) => {
    return String(
      notification?.title ||
        notification?.subject ||
        notification?.name ||
        "Notification"
    );
  };

  const getNotificationMessage = (notification) => {
    return String(
      notification?.message ||
        notification?.description ||
        notification?.body ||
        notification?.content ||
        "No message available."
    );
  };

  const getNotificationType = (notification) => {
    return String(
      notification?.type ||
        notification?.notificationType ||
        notification?.category ||
        "GENERAL"
    );
  };

  const getNotificationDate = (notification) => {
    return (
      notification?.createdAt ||
      notification?.date ||
      notification?.timestamp ||
      notification?.sentAt ||
      null
    );
  };

  const isNotificationRead = (notification) => {
    if (typeof notification?.read === "boolean") {
      return notification.read;
    }

    if (typeof notification?.isRead === "boolean") {
      return notification.isRead;
    }

    if (notification?.readAt) {
      return true;
    }

    return false;
  };

  const formatType = (type) => {
    if (!type) return "General";

    return String(type)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTypeVariant = (type) => {
    const normalized = String(type || "").toUpperCase();

    if (
      normalized === "LEAD" ||
      normalized === "LEAD_UPDATE"
    ) {
      return "success";
    }

    if (
      normalized === "TASK" ||
      normalized === "TASK_ASSIGNED"
    ) {
      return "warning";
    }

    if (
      normalized === "QUOTATION" ||
      normalized === "INVOICE"
    ) {
      return "info";
    }

    return "default";
  };

  const getNotificationIcon = (type) => {
    const normalized = String(type || "").toUpperCase();

    if (normalized.includes("LEAD")) return "◉";
    if (normalized.includes("TASK")) return "✓";
    if (normalized.includes("QUOTATION")) return "▤";
    if (normalized.includes("INVOICE")) return "₹";
    if (normalized.includes("EMPLOYEE")) return "👥";
    if (normalized.includes("SYSTEM")) return "⚙";

    return "●";
  };

  /* =========================
     NORMALIZE
  ========================= */

  const normalizedNotifications = useMemo(() => {
    return notifications.map((notification) => ({
      ...notification,
      _title: getNotificationTitle(notification),
      _message: getNotificationMessage(notification),
      _type: getNotificationType(notification),
      _date: getNotificationDate(notification),
      _isRead: isNotificationRead(notification),
    }));
  }, [notifications]);

  /* =========================
     FILTER
  ========================= */

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedNotifications.filter(
      (notification) => {
        const matchesSearch =
          !query ||
          String(notification._title)
            .toLowerCase()
            .includes(query) ||
          String(notification._message)
            .toLowerCase()
            .includes(query) ||
          String(notification._type)
            .toLowerCase()
            .includes(query);

        const matchesRead =
          readFilter === "ALL" ||
          (readFilter === "READ" &&
            notification._isRead) ||
          (readFilter === "UNREAD" &&
            !notification._isRead);

        const matchesType =
          typeFilter === "ALL" ||
          String(notification._type).toUpperCase() ===
            typeFilter;

        return (
          matchesSearch &&
          matchesRead &&
          matchesType
        );
      }
    );
  }, [
    normalizedNotifications,
    search,
    readFilter,
    typeFilter,
  ]);

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredNotifications.length / PAGE_SIZE
    )
  );

  const paginatedNotifications = useMemo(() => {
    const start =
      (currentPage - 1) * PAGE_SIZE;

    return filteredNotifications.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredNotifications, currentPage]);

  /* =========================
     COUNTS
  ========================= */

  const unreadCount = useMemo(() => {
    return normalizedNotifications.filter(
      (notification) => !notification._isRead
    ).length;
  }, [normalizedNotifications]);

  const readCount =
    normalizedNotifications.length - unreadCount;

  const uniqueTypes = useMemo(() => {
    return [
      ...new Set(
        normalizedNotifications.map(
          (notification) =>
            String(notification._type).toUpperCase()
        )
      ),
    ];
  }, [normalizedNotifications]);

  /* =========================
     ACTIONS
  ========================= */

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleMarkAllRead = async () => {
    try {
      if (
        typeof notificationService.markAllAsRead ===
        "function"
      ) {
        await notificationService.markAllAsRead();
        await loadNotifications();
      }
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );
    }
  };

  /* =========================
     AUTH LOADING
  ========================= */

  if (authLoading) {
    return (
      <div className="manager-notifications-loading">
        <Loader />
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="manager-notifications">
      {/* HEADER */}
      <div className="manager-notifications__header">
        <div>
          <span className="manager-notifications__eyebrow">
            Communication Center
          </span>

          <h1 className="manager-notifications__title">
            Notifications
          </h1>

          <p className="manager-notifications__subtitle">
            Stay updated with leads, tasks, quotations
            and system activities.
          </p>
        </div>

        <div className="manager-notifications__actions">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={loadNotifications}
            disabled={loading}
          >
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="manager-notifications__error">
          <span>{error}</span>

          <Button
            size="small"
            variant="secondary"
            onClick={loadNotifications}
          >
            Retry
          </Button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="manager-notifications__summary">
        <div className="manager-notifications__summary-card">
          <span className="manager-notifications__summary-icon">
            🔔
          </span>

          <div className="manager-notifications__summary-content">
            <span className="manager-notifications__summary-label">
              Total Notifications
            </span>

            <strong className="manager-notifications__summary-value">
              {normalizedNotifications.length}
            </strong>
          </div>
        </div>

        <div className="manager-notifications__summary-card">
          <span className="manager-notifications__summary-icon">
            ●
          </span>

          <div className="manager-notifications__summary-content">
            <span className="manager-notifications__summary-label">
              Unread
            </span>

            <strong className="manager-notifications__summary-value">
              {unreadCount}
            </strong>
          </div>
        </div>

        <div className="manager-notifications__summary-card">
          <span className="manager-notifications__summary-icon">
            ✓
          </span>

          <div className="manager-notifications__summary-content">
            <span className="manager-notifications__summary-label">
              Read
            </span>

            <strong className="manager-notifications__summary-value">
              {readCount}
            </strong>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="manager-notifications__content">
        {/* TOOLBAR */}
        <div className="manager-notifications__toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search notifications..."
          />

          <div className="manager-notifications__filters">
            <select
              className="manager-notifications__filter"
              value={readFilter}
              onChange={(event) =>
                setReadFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Notifications
              </option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>

            <select
              className="manager-notifications__filter"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="ALL">All Types</option>

              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="manager-notifications__loading">
            <span className="manager-notifications__spinner" />
            Loading notifications...
          </div>
        ) : (
          <>
            <div className="manager-notifications__list">
              {paginatedNotifications.length === 0 ? (
                <div className="manager-notifications__empty">
                  <span className="manager-notifications__empty-icon">
                    🔔
                  </span>

                  <h3>No notifications found</h3>

                  <p>
                    You&apos;re all caught up or no
                    notification matches the selected
                    filters.
                  </p>
                </div>
              ) : (
                paginatedNotifications.map(
                  (notification) => (
                    <div
                      key={
                        notification._id ||
                        notification.id ||
                        `${notification._title}-${notification._date}`
                      }
                      className={`manager-notifications__item ${
                        !notification._isRead
                          ? "manager-notifications__item--unread"
                          : ""
                      }`}
                    >
                      <span className="manager-notifications__item-icon">
                        {getNotificationIcon(
                          notification._type
                        )}
                      </span>

                      <div className="manager-notifications__item-body">
                        <h3 className="manager-notifications__item-title">
                          {notification._title}
                        </h3>

                        <p className="manager-notifications__item-message">
                          {notification._message}
                        </p>

                        <span className="manager-notifications__item-time">
                          {formatDateTime(
                            notification._date
                          )}
                        </span>
                      </div>

                      {!notification._isRead && (
                        <span className="manager-notifications__unread-dot" />
                      )}

                      <div className="manager-notifications__item-actions">
                        <Badge
                          variant={getTypeVariant(
                            notification._type
                          )}
                        >
                          {formatType(
                            notification._type
                          )}
                        </Badge>

                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {filteredNotifications.length > 0 && (
              <div className="manager-notifications__pagination">
                <span>
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * PAGE_SIZE + 1,
                    filteredNotifications.length
                  )}{" "}
                  -{" "}
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredNotifications.length
                  )}{" "}
                  of {filteredNotifications.length}
                </span>

                <div className="manager-notifications__pagination-actions">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedNotification && (
        <Modal
          isOpen={Boolean(selectedNotification)}
          onClose={() =>
            setSelectedNotification(null)
          }
          title="Notification Details"
        >
          <div className="manager-notification-modal-content">
            <div className="manager-notification-modal-header">
              <span className="manager-notification-modal-icon">
                {getNotificationIcon(
                  selectedNotification._type
                )}
              </span>

              <div>
                <h2>
                  {selectedNotification._title}
                </h2>

                <p>
                  {formatDateTime(
                    selectedNotification._date
                  )}
                </p>
              </div>
            </div>

            <div className="manager-notification-modal-meta">
              <div>
                <span>Type</span>

                <Badge
                  variant={getTypeVariant(
                    selectedNotification._type
                  )}
                >
                  {formatType(
                    selectedNotification._type
                  )}
                </Badge>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {selectedNotification._isRead
                    ? "Read"
                    : "Unread"}
                </strong>
              </div>
            </div>

            <div className="manager-notification-message">
              <span>Message</span>

              <p>
                {selectedNotification._message}
              </p>
            </div>

            <div className="manager-notification-modal-footer">
              <Button
                variant="secondary"
                onClick={() =>
                  setSelectedNotification(null)
                }
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManagerNotificationsPage;