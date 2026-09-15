import { ROLE_LABELS } from "@/utils/constants";

/* =========================
   String Formatters
========================= */

export const formatText = (value, fallback = "-") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();

  return text || fallback;
};

export const capitalize = (value) => {
  if (!value) return "";

  const text = String(value).trim();

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (value) => {
  if (!value) return "";

  return String(value)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(" ");
};

export const formatStatus = (value, fallback = "-") => {
  if (!value) return fallback;

  return String(value)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatEnum = (value, fallback = "-") =>
  formatStatus(value, fallback);

/* =========================
   Name Formatters
========================= */

export const formatFullName = (
  firstName,
  lastName,
  fallback = "-"
) => {
  const parts = [firstName, lastName]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : fallback;
};

export const getInitials = (name, fallback = "U") => {
  if (!name) return fallback;

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
};

export const formatRole = (role) => {
  if (!role) return "-";

  return (
    ROLE_LABELS[role] ||
    ROLE_LABELS[String(role).toUpperCase()] ||
    formatStatus(role)
  );
};

/* =========================
   Phone Formatters
========================= */

export const formatPhone = (
  value,
  fallback = "-"
) => {
  if (!value) return fallback;

  const phone = String(value).trim();

  return phone;
};

export const formatIndianPhone = (
  value,
  fallback = "-"
) => {
  if (!value) return fallback;

  let phone = String(value).replace(/\D/g, "");

  if (phone.startsWith("91") && phone.length === 12) {
    phone = phone.slice(2);
  }

  if (phone.length !== 10) {
    return String(value);
  }

  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
};

/* =========================
   Email
========================= */

export const formatEmail = (
  value,
  fallback = "-"
) => {
  if (!value) return fallback;

  return String(value).trim().toLowerCase();
};

/* =========================
   Date Formatters
========================= */

const getDateObject = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (
  value,
  options = {}
) => {
  const date = getDateObject(value);

  if (!date) return "-";

  const {
    locale = "en-IN",
    dateStyle = "medium",
  } = options;

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
  }).format(date);
};

export const formatShortDate = (value) => {
  const date = getDateObject(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatLongDate = (value) => {
  const date = getDateObject(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (
  value,
  options = {}
) => {
  const date = getDateObject(value);

  if (!date) return "-";

  const {
    locale = "en-IN",
  } = options;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatTime = (value) => {
  const date = getDateObject(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatMonthYear = (value) => {
  const date = getDateObject(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
};

/* =========================
   Relative Date
========================= */

export const isToday = (value) => {
  const date = getDateObject(value);

  if (!date) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const isPastDate = (value) => {
  const date = getDateObject(value);

  if (!date) return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  return date < today;
};

export const isFutureDate = (value) => {
  const date = getDateObject(value);

  if (!date) return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  return date > today;
};

/* =========================
   Number Formatters
========================= */

export const formatNumber = (
  value,
  options = {}
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  const {
    locale = "en-IN",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(number);
};

export const formatInteger = (value) =>
  formatNumber(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const formatDecimal = (
  value,
  digits = 2
) =>
  formatNumber(value, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/* =========================
   Currency
========================= */

export const formatCurrency = (
  value,
  currency = "INR"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "₹0.00";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatCompactCurrency = (
  value,
  currency = "INR"
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

/* =========================
   Percentage
========================= */

export const formatPercentage = (
  value,
  digits = 2
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0%";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0%";
  }

  return `${number.toFixed(digits)}%`;
};

/* =========================
   Solar Units
========================= */

export const formatCapacity = (
  value,
  unit = "kW"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return `0 ${unit}`;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return `0 ${unit}`;
  }

  return `${formatDecimal(number, 2)} ${unit}`;
};

export const formatEnergy = (
  value,
  unit = "kWh"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return `0 ${unit}`;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return `0 ${unit}`;
  }

  return `${formatDecimal(number, 2)} ${unit}`;
};

/* =========================
   File Formatters
========================= */

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) < 0) {
    return "0 Bytes";
  }

  const size = Number(bytes);

  if (size === 0) return "0 Bytes";

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.floor(
    Math.log(size) / Math.log(1024)
  );

  const unitIndex = Math.min(index, units.length - 1);

  return `${(size / 1024 ** unitIndex).toFixed(
    unitIndex === 0 ? 0 : 2
  )} ${units[unitIndex]}`;
};

export const getFileExtension = (filename) => {
  if (!filename) return "";

  const name = String(filename);

  const lastDot = name.lastIndexOf(".");

  if (lastDot === -1) return "";

  return name
    .slice(lastDot + 1)
    .toLowerCase();
};

/* =========================
   ID Formatters
========================= */

export const formatId = (
  prefix,
  number,
  digits = 4
) => {
  if (
    number === null ||
    number === undefined ||
    number === ""
  ) {
    return "-";
  }

  const numericPart = String(number).replace(
    /\D/g,
    ""
  );

  if (!numericPart) {
    return `${prefix}-${number}`;
  }

  return `${prefix}-${numericPart.padStart(
    digits,
    "0"
  )}`;
};

export const formatLeadId = (number) =>
  formatId("LD", number);

export const formatCustomerId = (number) =>
  formatId("CUS", number);

export const formatQuotationId = (number) =>
  formatId("QT", number);

export const formatInvoiceId = (number) =>
  formatId("INV", number);

export const formatTaskId = (number) =>
  formatId("TASK", number);

export const formatEmployeeId = (number) =>
  formatId("EMP", number);

/* =========================
   Address
========================= */

export const formatAddress = (
  parts = [],
  fallback = "-"
) => {
  if (!Array.isArray(parts)) {
    return fallback;
  }

  const filtered = parts
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  return filtered.length > 0
    ? filtered.join(", ")
    : fallback;
};

/* =========================
   Truncation
========================= */

export const truncateText = (
  value,
  maxLength = 50,
  suffix = "..."
) => {
  if (!value) return "";

  const text = String(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(
    0,
    Math.max(0, maxLength - suffix.length)
  )}${suffix}`;
};

/* =========================
   Boolean
========================= */

export const formatBoolean = (
  value,
  trueLabel = "Yes",
  falseLabel = "No"
) => {
  return value ? trueLabel : falseLabel;
};

/* =========================
   List / Array
========================= */

export const formatList = (
  values,
  separator = ", ",
  fallback = "-"
) => {
  if (!Array.isArray(values) || values.length === 0) {
    return fallback;
  }

  return values
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(separator);
};

/* =========================
   Safe Display
========================= */

export const displayValue = (
  value,
  fallback = "-"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
};

export default {
  formatText,
  capitalize,
  capitalizeWords,
  formatStatus,
  formatEnum,
  formatFullName,
  getInitials,
  formatRole,
  formatPhone,
  formatIndianPhone,
  formatEmail,
  formatDate,
  formatShortDate,
  formatLongDate,
  formatDateTime,
  formatTime,
  formatMonthYear,
  isToday,
  isPastDate,
  isFutureDate,
  formatNumber,
  formatInteger,
  formatDecimal,
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
  formatCapacity,
  formatEnergy,
  formatFileSize,
  getFileExtension,
  formatId,
  formatLeadId,
  formatCustomerId,
  formatQuotationId,
  formatInvoiceId,
  formatTaskId,
  formatEmployeeId,
  formatAddress,
  truncateText,
  formatBoolean,
  formatList,
  displayValue,
};