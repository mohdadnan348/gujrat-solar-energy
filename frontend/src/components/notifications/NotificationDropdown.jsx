"use client";

import React, { useEffect, useRef, useState } from "react";
import useNotification from "../../hooks/useNotification";
import NotificationItem from "./NotificationItem";
import "./NotificationDropdown.css";

const NotificationDropdown = ({
  onViewAll,
  onNotificationClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification);

    onNotificationClick?.(notification);

    if (!onNotificationClick) {
      setIsOpen(false);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    onViewAll?.();
  };

  const visibleNotifications = notifications.slice(0, 6);

  return (
    <div
      ref={dropdownRef}
      className="notification-dropdown"
    >
      <button
        type="button"
        className="notification-dropdown__trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <span className="notification-dropdown__bell">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
        </span>

        {unreadCount > 0 && (
          <span className="notification-dropdown__count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown__panel">
          <div className="notification-dropdown__header">
            <div>
              <h3>Notifications</h3>
              <span>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-dropdown__mark-all"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-dropdown__list">
            {visibleNotifications.length > 0 ? (
              visibleNotifications.map((notification) => (
                <NotificationItem
                  key={
                    notification._id ||
                    notification.id
                  }
                  notification={notification}
                  compact
                  onClick={handleNotificationClick}
                />
              ))
            ) : (
              <div className="notification-dropdown__empty">
                <div className="notification-dropdown__empty-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                </div>

                <strong>No notifications</strong>
                <p>
                  You are up to date. New notifications will
                  appear here.
                </p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-dropdown__footer">
              <button
                type="button"
                onClick={handleViewAll}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;