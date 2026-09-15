"use client";

import React from "react";
import "./Badge.css";

const Badge = ({
  children,
  variant = "default",
  size = "medium",
  dot = false,
  removable = false,
  onRemove,
  icon,
  className = "",
  ...props
}) => {
  const badgeClasses = [
    "gse-badge",
    `gse-badge-${variant}`,
    `gse-badge-${size}`,
    dot ? "gse-badge-with-dot" : "",
    removable ? "gse-badge-removable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClasses} {...props}>
      {dot && <span className="gse-badge-dot" aria-hidden="true" />}

      {icon && (
        <span className="gse-badge-icon" aria-hidden="true">
          {icon}
        </span>
      )}

      <span className="gse-badge-content">{children}</span>

      {removable && (
        <button
          type="button"
          className="gse-badge-remove"
          onClick={onRemove}
          aria-label="Remove badge"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </span>
  );
};

export default Badge;