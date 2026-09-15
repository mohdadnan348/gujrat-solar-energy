// frontend/src/app/hr/notifications/page.jsx

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

const ITEMS_PER_PAGE = 10;

const HrNotificationsPage = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const [selectedNotification, setSelectedNotification] =
    useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const loadNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await notificationService.getNotifications();

      const data =
        response?.data?.notifications ||
        response?.data?.data ||
        response?.notifications ||
        response?.data ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("HR notifications loading error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to load notifications."
      );

      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getTitle = (notification) =>
    notification?.title ||
    notification?.subject ||
    "Notification";

  const getMessage = (notification) =>
    notification?.message ||
    notification?.description ||
    notification?.body ||
    "";

  const getType = (notification) =>
    notification?.type ||
    notification?.notificationType ||
    "GENERAL";

  const getDate = (notification) =>
    notification?.createdAt ||
    notification?.date ||
    notification?.timestamp ||
    null;

  const isRead = (notification) => {
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

  const formatType = (value) => {
    return String(value || "GENERAL")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

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
    const normalized = String(type).toUpperCase();

    if (
      normalized.includes("LEAVE") ||
      normalized.includes("HR")
    ) {
      return "warning";
    }

    if (
      normalized.includes("TASK") ||
      normalized.includes("SYSTEM")
    ) {
      return "info";
    }

    if (
      normalized.includes("ALERT") ||
      normalized.includes("ERROR")
    ) {
      return "danger";
    }

    return "secondary";
  };

  const normalizedNotifications = useMemo(() => {
    return notifications.map((notification) => ({
      ...notification,
      displayTitle: getTitle(notification),
      displayMessage: getMessage(notification),
      displayType: getType(notification),
      displayDate: getDate(notification),
      displayRead: isRead(notification),
    }));
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return normalizedNotifications.filter((notification) => {
      const matchesSearch =
        !searchValue ||
        notification.displayTitle
          .toLowerCase()
          .includes(searchValue) ||
        notification.displayMessage
          .toLowerCase()
          .includes(searchValue) ||
        notification.displayType
          .toLowerCase()
          .includes(searchValue);

      const matchesRead =
        readFilter === "ALL" ||
        (readFilter === "READ" && notification.displayRead) ||
        (readFilter === "UNREAD" &&
          !notification.displayRead);

      const matchesType =
        typeFilter === "ALL" ||
        notification.displayType.toUpperCase() ===
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
    Math.ceil(
      filteredNotifications.length / ITEMS_PER_PAGE
    )
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredNotifications.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredNotifications, currentPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const notificationTypes = useMemo(() => {
    return [
      ...new Set(
        normalizedNotifications.map((notification) =>
          String(notification.displayType).toUpperCase()
        )
      ),
    ].filter(Boolean);
  }, [normalizedNotifications]);

  const stats = useMemo(() => {
    const total = normalizedNotifications.length;

    const unread = normalizedNotifications.filter(
      (notification) => !notification.displayRead
    ).length;

    const read = normalizedNotifications.filter(
      (notification) => notification.displayRead
    ).length;

    const leaveRelated = normalizedNotifications.filter(
      (notification) =>
        String(notification.displayType)
          .toUpperCase()
          .includes("LEAVE")
    ).length;

    return {
      total,
      unread,
      read,
      leaveRelated,
    };
  }, [normalizedNotifications]);

  const openDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedNotification(null);
    setShowDetails(false);
  };

  if (authLoading || loading) {
    return (
      <MainLayout
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationCount={0}
      >
        <div className="hr-notifications-loading">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onSearch={handleSearch}
      notificationCount={stats.unread}
    >
      <div className="hr-notifications-page">
        {/* Header */}
        <div className="hr-notifications-header">
          <div>
            <div className="hr-notifications-breadcrumb">
              HR <span>/</span> Notifications
            </div>

            <h1>Notifications</h1>

            <p>
              Stay updated with important HR and system
              notifications.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </Button>
        </div>

        {/* Stats */}
        <div className="hr-notifications-stats">
          <div className="hr-notification-stat-card">
            <div className="hr-notification-stat-icon">
              🔔
            </div>

            <div>
              <span>Total Notifications</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="hr-notification-stat-card">
            <div className="hr-notification-stat-icon">
              ●
            </div>

            <div>
              <span>Unread</span>
              <strong>{stats.unread}</strong>
            </div>
          </div>

          <div className="hr-notification-stat-card">
            <div className="hr-notification-stat-icon">
              ✓
            </div>

            <div>
              <span>Read</span>
              <strong>{stats.read}</strong>
            </div>
          </div>

          <div className="hr-notification-stat-card">
            <div className="hr-notification-stat-icon">
              📅
            </div>

            <div>
              <span>Leave Related</span>
              <strong>{stats.leaveRelated}</strong>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="hr-notifications-toolbar">
          <div className="hr-notifications-search">
            <SearchBox
              value={search}
              onChange={handleSearch}
              placeholder="Search notifications..."
            />
          </div>

          <div className="hr-notifications-filters">
            <select
              className="hr-notifications-filter-select"
              value={readFilter}
              onChange={(event) => {
                setReadFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Notifications</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>

            <select
              className="hr-notifications-filter-select"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Types</option>

              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="hr-notifications-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadNotifications()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="hr-notifications-card">
          <div className="hr-notifications-card-header">
            <div>
              <h2>All Notifications</h2>

              <p>
                {filteredNotifications.length} notification
                {filteredNotifications.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {paginatedNotifications.length === 0 ? (
            <div className="hr-notifications-empty">
              <div className="hr-notifications-empty-icon">
                🔔
              </div>

              <h3>No notifications found</h3>

              <p>
                Try changing your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="hr-notifications-list">
                {paginatedNotifications.map((notification) => (
                  <div
                    key={
                      notification._id ||
                      notification.id ||
                      `${notification.displayTitle}-${notification.displayDate}`
                    }
                    className={`hr-notification-item ${
                      notification.displayRead
                        ? "is-read"
                        : "is-unread"
                    }`}
                  >
                    <div className="hr-notification-icon">
                      {notification.displayRead
                        ? "✓"
                        : "●"}
                    </div>

                    <div className="hr-notification-content">
                      <div className="hr-notification-top">
                        <h3>
                          {notification.displayTitle}
                        </h3>

                        <Badge
                          variant={getTypeVariant(
                            notification.displayType
                          )}
                        >
                          {formatType(
                            notification.displayType
                          )}
                        </Badge>
                      </div>

                      <p>{notification.displayMessage}</p>

                      <div className="hr-notification-meta">
                        <span>
                          {formatDateTime(
                            notification.displayDate
                          )}
                        </span>

                        {!notification.displayRead && (
                          <span className="hr-notification-unread">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="hr-notification-view-btn"
                      onClick={() =>
                        openDetails(notification)
                      }
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="hr-notifications-pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedNotification && (
          <Modal
            isOpen={showDetails}
            onClose={closeDetails}
            title="Notification Details"
          >
            <div className="hr-notification-details">
              <div className="hr-notification-details-header">
                <div className="hr-notification-details-icon">
                  🔔
                </div>

                <div>
                  <h3>
                    {getTitle(selectedNotification)}
                  </h3>

                  <div className="hr-notification-details-badges">
                    <Badge
                      variant={getTypeVariant(
                        getType(selectedNotification)
                      )}
                    >
                      {formatType(
                        getType(selectedNotification)
                      )}
                    </Badge>

                    <Badge
                      variant={
                        isRead(selectedNotification)
                          ? "secondary"
                          : "warning"
                      }
                    >
                      {isRead(selectedNotification)
                        ? "Read"
                        : "Unread"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="hr-notification-detail-box">
                <span>Message</span>

                <p>
                  {getMessage(selectedNotification) ||
                    "No message available."}
                </p>
              </div>

              <div className="hr-notification-detail-grid">
                <div>
                  <span>Type</span>
                  <strong>
                    {formatType(
                      getType(selectedNotification)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {formatDateTime(
                      getDate(selectedNotification)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {isRead(selectedNotification)
                      ? "Read"
                      : "Unread"}
                  </strong>
                </div>

                <div>
                  <span>Notification ID</span>
                  <strong>
                    {selectedNotification._id ||
                      selectedNotification.id ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="hr-notification-details-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDetails}
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

export default HrNotificationsPage;