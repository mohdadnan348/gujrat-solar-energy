"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import notificationService from "@/services/notification.service";

const PAGE_SIZE = 10;

const ManagerNotificationsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

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
      console.error("Failed to load notifications:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
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

  const getNotificationTitle = (notification) => {
    return (
      notification?.title ||
      notification?.subject ||
      notification?.name ||
      "Notification"
    );
  };

  const getNotificationMessage = (notification) => {
    return (
      notification?.message ||
      notification?.description ||
      notification?.body ||
      notification?.content ||
      "No message available."
    );
  };

  const getNotificationType = (notification) => {
    return (
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

    return type
      .toString()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
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
      return value;
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
    const normalized = type?.toString().toUpperCase();

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

    if (
      normalized === "SYSTEM" ||
      normalized === "GENERAL"
    ) {
      return "default";
    }

    return "default";
  };

  const getNotificationIcon = (type) => {
    const normalized = type?.toString().toUpperCase();

    if (normalized.includes("LEAD")) return "◉";
    if (normalized.includes("TASK")) return "✓";
    if (normalized.includes("QUOTATION")) return "▤";
    if (normalized.includes("INVOICE")) return "₹";
    if (normalized.includes("EMPLOYEE")) return "👥";
    if (normalized.includes("SYSTEM")) return "⚙";

    return "●";
  };

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

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedNotifications.filter((notification) => {
      const matchesSearch =
        !query ||
        notification._title
          .toLowerCase()
          .includes(query) ||
        notification._message
          .toLowerCase()
          .includes(query) ||
        notification._type
          .toString()
          .toLowerCase()
          .includes(query);

      const matchesRead =
        readFilter === "ALL" ||
        (readFilter === "READ" && notification._isRead) ||
        (readFilter === "UNREAD" && !notification._isRead);

      const matchesType =
        typeFilter === "ALL" ||
        notification._type.toString().toUpperCase() ===
          typeFilter;

      return matchesSearch && matchesRead && matchesType;
    });
  }, [
    normalizedNotifications,
    search,
    readFilter,
    typeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE)
  );

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredNotifications.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredNotifications, currentPage]);

  const unreadCount = useMemo(() => {
    return normalizedNotifications.filter(
      (notification) => !notification._isRead
    ).length;
  }, [normalizedNotifications]);

  const readCount = normalizedNotifications.length - unreadCount;

  const uniqueTypes = useMemo(() => {
    return [
      ...new Set(
        normalizedNotifications.map((notification) =>
          notification._type.toString().toUpperCase()
        )
      ),
    ];
  }, [normalizedNotifications]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleMarkAllRead = async () => {
    try {
      if (typeof notificationService.markAllAsRead === "function") {
        await notificationService.markAllAsRead();
        await loadNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="manager-notifications-loading">
        <Loader />
      </div>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={(value) =>
        console.log("Manager global search:", value)
      }
      notificationCount={unreadCount}
    >
      <div className="manager-notifications-page">
        <div className="manager-notifications-header">
          <div>
            <span className="manager-notifications-eyebrow">
              Communication Center
            </span>

            <h1>Notifications</h1>

            <p>
              Stay updated with leads, tasks, quotations and system
              activities.
            </p>
          </div>

          <div className="manager-notifications-header-actions">
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

        {error && (
          <div className="manager-notifications-error">
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

        <div className="manager-notifications-summary">
          <div className="manager-notification-summary-card">
            <span>Total Notifications</span>
            <strong>{normalizedNotifications.length}</strong>
          </div>

          <div className="manager-notification-summary-card manager-notification-unread">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>

          <div className="manager-notification-summary-card manager-notification-read">
            <span>Read</span>
            <strong>{readCount}</strong>
          </div>
        </div>

        <div className="manager-notifications-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search notifications..."
          />

          <select
            className="manager-notifications-filter"
            value={readFilter}
            onChange={(event) =>
              setReadFilter(event.target.value)
            }
          >
            <option value="ALL">All Notifications</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>

          <select
            className="manager-notifications-filter"
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

        <div className="manager-notifications-card">
          {loading ? (
            <div className="manager-notifications-table-loading">
              <Loader />
            </div>
          ) : (
            <>
              <div className="manager-notifications-table-wrapper">
                <table className="manager-notifications-table">
                  <thead>
                    <tr>
                      <th>Notification</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedNotifications.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="manager-notifications-empty"
                        >
                          <div>
                            <span className="manager-notifications-empty-icon">
                              🔔
                            </span>

                            <strong>
                              No notifications found
                            </strong>

                            <p>
                              You&apos;re all caught up or no notification
                              matches the selected filters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedNotifications.map(
                        (notification) => (
                          <tr
                            key={
                              notification._id ||
                              notification.id ||
                              `${notification._title}-${notification._date}`
                            }
                            className={
                              notification._isRead
                                ? ""
                                : "manager-notification-unread-row"
                            }
                          >
                            <td>
                              <div className="manager-notification-item">
                                <span className="manager-notification-icon">
                                  {getNotificationIcon(
                                    notification._type
                                  )}
                                </span>

                                <div>
                                  <strong>
                                    {notification._title}
                                  </strong>

                                  <p>
                                    {notification._message}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td>
                              <Badge
                                variant={getTypeVariant(
                                  notification._type
                                )}
                              >
                                {formatType(
                                  notification._type
                                )}
                              </Badge>
                            </td>

                            <td>
                              <span className="manager-notification-date">
                                {formatDate(notification._date)}
                              </span>
                            </td>

                            <td>
                              {notification._isRead ? (
                                <span className="manager-notification-status read">
                                  Read
                                </span>
                              ) : (
                                <span className="manager-notification-status unread">
                                  Unread
                                </span>
                              )}
                            </td>

                            <td>
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
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {filteredNotifications.length > 0 && (
                <div className="manager-notifications-pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {selectedNotification && (
          <Modal
            isOpen={Boolean(selectedNotification)}
            onClose={() => setSelectedNotification(null)}
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
    </MainLayout>
  );
};

export default ManagerNotificationsPage;