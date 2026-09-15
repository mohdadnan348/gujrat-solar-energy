"use client";

import React from "react";
import "./NotificationItem.css";

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationIcon = (type) => {
  const icons = {
    lead: "L",
    quotation: "Q",
    invoice: "I",
    task: "T",
    employee: "E",
    attendance: "A",
    leave: "V",
    system: "S",
    default: "N",
  };

  return icons[String(type || "").toLowerCase()] || icons.default;
};

const NotificationItem = ({
  notification = {},
  onClick,
  onMarkAsRead,
  onRemove,
  compact = false,
}) => {
  const notificationId =
    notification._id || notification.id;

  const isRead =
    notification.isRead ??
    notification.read ??
    Boolean(notification.readAt);

  const type =
    notification.type ||
    notification.category ||
    "system";

  const title =
    notification.title ||
    notification.subject ||
    "Notification";

  const message =
    notification.message ||
    notification.description ||
    notification.body ||
    "You have a new notification.";

  const createdAt =
    notification.createdAt ||
    notification.created_at ||
    notification.date;

  const handleClick = () => {
    onClick?.(notification);

    if (!isRead) {
      onMarkAsRead?.(notification);
    }
  };

  const handleMarkAsRead = (event) => {
    event.stopPropagation();
    onMarkAsRead?.(notification);
  };

  const handleRemove = (event) => {
    event.stopPropagation();
    onRemove?.(notification);
  };

  return (
    <article
      className={[
        "notification-item",
        !isRead ? "notification-item--unread" : "",
        compact ? "notification-item--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (
          onClick &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="notification-item__icon">
        {notification.icon ? (
          <span>{notification.icon}</span>
        ) : (
          getNotificationIcon(type)
        )}
      </div>

      <div className="notification-item__content">
        <div className="notification-item__title-row">
          <h4>{title}</h4>

          {!isRead && (
            <span
              className="notification-item__unread-dot"
              aria-label="Unread notification"
            />
          )}
        </div>

        <p className="notification-item__message">
          {message}
        </p>

        {createdAt && (
          <time
            className="notification-item__time"
            dateTime={createdAt}
          >
            {formatTime(createdAt)}
          </time>
        )}

        {!compact && notification.actionLabel && (
          <span className="notification-item__action-label">
            {notification.actionLabel}
          </span>
        )}
      </div>

      {!compact && (
        <div className="notification-item__actions">
          {!isRead && onMarkAsRead && (
            <button
              type="button"
              className="notification-item__action"
              onClick={handleMarkAsRead}
              title="Mark as read"
              aria-label="Mark notification as read"
            >
              ✓
            </button>
          )}

          {onRemove && (
            <button
              type="button"
              className="notification-item__action notification-item__action--remove"
              onClick={handleRemove}
              title="Remove notification"
              aria-label="Remove notification"
            >
              ×
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default NotificationItem;