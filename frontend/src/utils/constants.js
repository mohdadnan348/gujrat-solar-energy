export const APP_NAME = "GUJRAT SOLAR ENERGY";

export const APP_CONFIG = {
  name: APP_NAME,
  shortName: "GSE",
  description: "Solar Company Management System",
  defaultPageSize: 10,
  maxPageSize: 100,
};

export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.HR]: "HR",
  [ROLES.EMPLOYEE]: "Employee",
};

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: "Active",
  [USER_STATUS.INACTIVE]: "Inactive",
};

/* Lead */

export const LEAD_STATUS = {
  NEW: "New",
  ASSIGNED: "Assigned",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  SITE_VISIT: "Site Visit",
  QUOTATION: "Quotation",
  WON: "Won",
  LOST: "Lost",
};

export const LEAD_STATUS_LABELS = {
  [LEAD_STATUS.NEW]: "New",
  [LEAD_STATUS.ASSIGNED]: "Assigned",
  [LEAD_STATUS.CONTACTED]: "Contacted",
  [LEAD_STATUS.QUALIFIED]: "Qualified",
  [LEAD_STATUS.SITE_VISIT]: "Site Visit",
  [LEAD_STATUS.QUOTATION]: "Quotation",
  [LEAD_STATUS.WON]: "Won",
  [LEAD_STATUS.LOST]: "Lost",
};

export const LEAD_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const LEAD_PRIORITY_LABELS = {
  [LEAD_PRIORITY.LOW]: "Low",
  [LEAD_PRIORITY.MEDIUM]: "Medium",
  [LEAD_PRIORITY.HIGH]: "High",
};

export const LEAD_SOURCES = [
  "Website",
  "WhatsApp",
  "Call",
  "Referral",
  "Social Media",
  "Walk-in",
  "Other",
];

/* Solar Requirement */

export const SYSTEM_TYPES = {
  ON_GRID: "ON_GRID",
  OFF_GRID: "OFF_GRID",
  HYBRID: "HYBRID",
};

export const SYSTEM_TYPE_LABELS = {
  [SYSTEM_TYPES.ON_GRID]: "On-grid",
  [SYSTEM_TYPES.OFF_GRID]: "Off-grid",
  [SYSTEM_TYPES.HYBRID]: "Hybrid",
};

export const ROOF_TYPES = [
  "RCC",
  "Metal Sheet",
  "Tin Shed",
  "Ground Mounted",
  "Other",
];

export const BATTERY_REQUIREMENT = {
  YES: "YES",
  NO: "NO",
};

export const CONNECTION_TYPES = [
  "Single Phase",
  "Three Phase",
  "Other",
];

/* System Configuration */

export const CONFIGURATION_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  REVISED: "REVISED",
  ARCHIVED: "ARCHIVED",
};

export const CONFIGURATION_STATUS_LABELS = {
  [CONFIGURATION_STATUS.DRAFT]: "Draft",
  [CONFIGURATION_STATUS.ACTIVE]: "Active",
  [CONFIGURATION_STATUS.REVISED]: "Revised",
  [CONFIGURATION_STATUS.ARCHIVED]: "Archived",
};

export const PRODUCT_CATEGORIES = {
  PANEL: "PANEL",
  INVERTER: "INVERTER",
  BATTERY: "BATTERY",
  STRUCTURE: "STRUCTURE",
  ACCESSORY: "ACCESSORY",
  INSTALLATION: "INSTALLATION",
  OTHER: "OTHER",
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.PANEL]: "Panel",
  [PRODUCT_CATEGORIES.INVERTER]: "Inverter",
  [PRODUCT_CATEGORIES.BATTERY]: "Battery",
  [PRODUCT_CATEGORIES.STRUCTURE]: "Structure",
  [PRODUCT_CATEGORIES.ACCESSORY]: "Accessory",
  [PRODUCT_CATEGORIES.INSTALLATION]: "Installation",
  [PRODUCT_CATEGORIES.OTHER]: "Other",
};

/* Quotation */

export const QUOTATION_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
};

export const QUOTATION_STATUS_LABELS = {
  [QUOTATION_STATUS.DRAFT]: "Draft",
  [QUOTATION_STATUS.SENT]: "Sent",
  [QUOTATION_STATUS.ACCEPTED]: "Accepted",
  [QUOTATION_STATUS.REJECTED]: "Rejected",
  [QUOTATION_STATUS.EXPIRED]: "Expired",
};

/* Customer */

export const CUSTOMER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const CUSTOMER_STATUS_LABELS = {
  [CUSTOMER_STATUS.ACTIVE]: "Active",
  [CUSTOMER_STATUS.INACTIVE]: "Inactive",
};

/* Invoice */

export const INVOICE_STATUS = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.DRAFT]: "Draft",
  [INVOICE_STATUS.ISSUED]: "Issued",
  [INVOICE_STATUS.OVERDUE]: "Overdue",
  [INVOICE_STATUS.CANCELLED]: "Cancelled",
};

/* Task */

export const TASK_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: "Pending",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.COMPLETED]: "Completed",
  [TASK_STATUS.CANCELLED]: "Cancelled",
};

export const TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: "Low",
  [TASK_PRIORITY.MEDIUM]: "Medium",
  [TASK_PRIORITY.HIGH]: "High",
  [TASK_PRIORITY.URGENT]: "Urgent",
};

/* Attendance */

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  HALF_DAY: "HALF_DAY",
  LATE: "LATE",
  LEAVE: "LEAVE",
};

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: "Present",
  [ATTENDANCE_STATUS.ABSENT]: "Absent",
  [ATTENDANCE_STATUS.HALF_DAY]: "Half Day",
  [ATTENDANCE_STATUS.LATE]: "Late",
  [ATTENDANCE_STATUS.LEAVE]: "Leave",
};

/* Leave */

export const LEAVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

export const LEAVE_STATUS_LABELS = {
  [LEAVE_STATUS.PENDING]: "Pending",
  [LEAVE_STATUS.APPROVED]: "Approved",
  [LEAVE_STATUS.REJECTED]: "Rejected",
  [LEAVE_STATUS.CANCELLED]: "Cancelled",
};

/* Date Filters */

export const DATE_FILTERS = {
  TODAY: "TODAY",
  THIS_WEEK: "THIS_WEEK",
  THIS_MONTH: "THIS_MONTH",
  CUSTOM: "CUSTOM",
};

export const DATE_FILTER_LABELS = {
  [DATE_FILTERS.TODAY]: "Today",
  [DATE_FILTERS.THIS_WEEK]: "This Week",
  [DATE_FILTERS.THIS_MONTH]: "This Month",
  [DATE_FILTERS.CUSTOM]: "Custom Range",
};

/* Lead Activity */

export const LEAD_ACTIVITY_TYPES = {
  CALL: "CALL",
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
  MEETING: "MEETING",
  SITE_VISIT: "SITE_VISIT",
  NOTE: "NOTE",
  OTHER: "OTHER",
};

export const LEAD_ACTIVITY_TYPE_LABELS = {
  [LEAD_ACTIVITY_TYPES.CALL]: "Call",
  [LEAD_ACTIVITY_TYPES.WHATSAPP]: "WhatsApp",
  [LEAD_ACTIVITY_TYPES.EMAIL]: "Email",
  [LEAD_ACTIVITY_TYPES.MEETING]: "Meeting",
  [LEAD_ACTIVITY_TYPES.SITE_VISIT]: "Site Visit",
  [LEAD_ACTIVITY_TYPES.NOTE]: "Note",
  [LEAD_ACTIVITY_TYPES.OTHER]: "Other",
};

/* Departments */

export const DEPARTMENTS = [
  "Sales",
  "Operations",
  "HR",
  "Finance",
  "Administration",
  "Technical",
  "Installation",
  "Other",
];

/* Pagination */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

/* API */

export const API = {
  DEFAULT_TIMEOUT: 15000,
  DOWNLOAD_TIMEOUT: 60000,
};

/* Storage Keys */

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "gse_access_token",
  REFRESH_TOKEN: "gse_refresh_token",
  USER: "gse_user",
};

/* Common Messages */

export const MESSAGES = {
  LOADING: "Loading...",
  SAVING: "Saving...",
  CREATING: "Creating...",
  UPDATING: "Updating...",
  DELETING: "Deleting...",
  NO_DATA: "No records found.",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
};

/* Module Names */

export const MODULES = {
  DASHBOARD: "dashboard",
  LEADS: "leads",
  SOLAR_REQUIREMENTS: "solar-requirements",
  SYSTEM_CONFIGURATIONS: "system-configurations",
  QUOTATIONS: "quotations",
  CUSTOMERS: "customers",
  INVOICES: "invoices",
  TASKS: "tasks",
  EMPLOYEES: "employees",
  ATTENDANCE: "attendance",
  LEAVES: "leaves",
  REPORTS: "reports",
  NOTIFICATIONS: "notifications",
  AUDIT_LOGS: "audit-logs",
  SETTINGS: "settings",
};

/* Permission Actions */

export const PERMISSION_ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  ASSIGN: "assign",
  APPROVE: "approve",
  EXPORT: "export",
};

/* Generic Entity Actions */

export const ENTITY_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  STATUS_CHANGE: "STATUS_CHANGE",
  ASSIGNMENT_CHANGE: "ASSIGNMENT_CHANGE",
};