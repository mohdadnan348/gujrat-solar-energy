"use client";

import React from "react";
import "./Avatar.css";

const Avatar = ({
  src,
  alt = "User avatar",
  name = "",
  size = "medium",
  variant = "circle",
  status,
  online,
  bordered = false,
  className = "",
  ...props
}) => {
  const getInitials = (value) => {
    if (!value) return "U";

    const words = value.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const avatarClasses = [
    "gse-avatar",
    `gse-avatar-${size}`,
    `gse-avatar-${variant}`,
    bordered ? "gse-avatar-bordered" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showStatus = status || typeof online === "boolean";

  const statusValue =
    status || (online ? "online" : "offline");

  return (
    <span className={avatarClasses} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="gse-avatar-image"
        />
      ) : (
        <span className="gse-avatar-initials">
          {getInitials(name)}
        </span>
      )}

      {showStatus && (
        <span
          className={`gse-avatar-status gse-avatar-status-${statusValue}`}
          aria-label={statusValue}
          title={statusValue}
        />
      )}
    </span>
  );
};

export default Avatar;