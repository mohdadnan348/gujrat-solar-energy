const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
});

const LEAD_STATUS = Object.freeze({
  NEW: "New",
  ASSIGNED: "Assigned",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  SITE_VISIT: "Site Visit",
  QUOTATION: "Quotation",
  WON: "Won",
  LOST: "Lost",
});

const LEAD_PRIORITY = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
});

const SYSTEM_TYPE = Object.freeze({
  ON_GRID: "On-grid",
  OFF_GRID: "Off-grid",
  HYBRID: "Hybrid",
});

const QUOTATION_STATUS = Object.freeze({
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
});

const INVOICE_STATUS = Object.freeze({
  DRAFT: "Draft",
  ISSUED: "Issued",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
});

const TASK_STATUS = Object.freeze({
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
});

const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "Present",
  ABSENT: "Absent",
  HALF_DAY: "Half Day",
  LATE: "Late",
});

const LEAVE_STATUS = Object.freeze({
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
});

const USER_STATUS = Object.freeze({
  ACTIVE: "Active",
  INACTIVE: "Inactive",
});

const LEAD_SOURCES = Object.freeze([
  "Website",
  "WhatsApp",
  "Call",
  "Referral",
  "Social Media",
  "Walk-in",
]);

module.exports = {
  ROLES,
  LEAD_STATUS,
  LEAD_PRIORITY,
  SYSTEM_TYPE,
  QUOTATION_STATUS,
  INVOICE_STATUS,
  TASK_STATUS,
  ATTENDANCE_STATUS,
  LEAVE_STATUS,
  USER_STATUS,
  LEAD_SOURCES,
};