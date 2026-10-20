"use client";

import React from "react";

export default function NotificationItem({
  notification,
  compact = false,
  onClick,
  onMarkAsRead,
  onRemove,
  onRead,
  onDelete,
}) {
  const title = notification?.title || "Notification";
  const message =
    notification?.message ||
    notification?.body ||
    notification?.content ||
    "";

  const isRead = Boolean(notification?.isRead ?? notification?.readAt);
  const markRead = onMarkAsRead || onRead;
  const remove = onRemove || onDelete;

  const handleRead = (event) => {
    event.stopPropagation();
    markRead?.(notification);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    remove?.(notification);
  };

  return (
    <article
      className={[
        "notification-item",
        isRead ? "is-read" : "is-unread",
        compact ? "notification-item--compact" : "",
      ].filter(Boolean).join(" ")}
      onClick={() => onClick?.(notification)}
    >
      <div className="notification-item-content">
        <div className="notification-item-heading">
          <h3>{title}</h3>
          {!isRead && <span className="notification-unread-dot" />}
        </div>

        <p>{message}</p>

        {notification?.createdAt && (
          <small>
            {new Date(notification.createdAt).toLocaleString("en-IN")}
          </small>
        )}
      </div>

      {!compact && (
        <div className="notification-item-actions">
          {!isRead && (
            <button type="button" onClick={handleRead}>
              Mark as read
            </button>
          )}
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}