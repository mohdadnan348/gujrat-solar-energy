"use client";

import React from "react";
import Badge from "../common/Badge";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    variant: "default",
  },
  SENT: {
    label: "Sent",
    variant: "info",
  },
  VIEWED: {
    label: "Viewed",
    variant: "info",
  },
  ACCEPTED: {
    label: "Accepted",
    variant: "success",
  },
  REJECTED: {
    label: "Rejected",
    variant: "danger",
  },
  EXPIRED: {
    label: "Expired",
    variant: "warning",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "danger",
  },
};

const normalizeStatus = (status) => {
  if (!status) return "DRAFT";

  return String(status)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

export default function QuotationStatusBadge({
  status,
  size = "small",
  dot = false,
  className = "",
}) {
  const normalizedStatus = normalizeStatus(status);

  const config = STATUS_CONFIG[normalizedStatus] || {
    label: String(status || "Draft"),
    variant: "default",
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={dot}
      className={`quotation-status-badge quotation-status-${normalizedStatus.toLowerCase()} ${className}`}
    >
      {config.label}
    </Badge>
  );
}