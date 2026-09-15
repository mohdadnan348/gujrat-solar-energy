import { LEAD_PRIORITY, ROLES } from "@/utils/constants";

/* =========================
   Generic Validators
========================= */

export const isRequired = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
};

export const isValidEmail = (value) => {
  if (!value) return false;

  const email = String(value).trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (value) => {
  if (!value) return false;

  const phone = String(value).replace(/\s|-/g, "");

  return /^\+?[0-9]{10,15}$/.test(phone);
};

export const isValidIndianMobile = (value) => {
  if (!value) return false;

  const phone = String(value).replace(/\D/g, "");

  const normalized =
    phone.length === 12 && phone.startsWith("91")
      ? phone.slice(2)
      : phone;

  return /^[6-9][0-9]{9}$/.test(normalized);
};

export const isValidNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  return Number.isFinite(Number(value));
};

export const isPositiveNumber = (value) => {
  if (!isValidNumber(value)) return false;

  return Number(value) > 0;
};

export const isNonNegativeNumber = (value) => {
  if (!isValidNumber(value)) return false;

  return Number(value) >= 0;
};

export const isInteger = (value) => {
  if (!isValidNumber(value)) return false;

  return Number.isInteger(Number(value));
};

export const isPositiveInteger = (value) => {
  if (!isInteger(value)) return false;

  return Number(value) > 0;
};

export const isWithinRange = (value, min, max) => {
  if (!isValidNumber(value)) return false;

  const number = Number(value);

  return number >= min && number <= max;
};

export const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

export const isValidDateRange = (fromDate, toDate) => {
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    return false;
  }

  return new Date(fromDate) <= new Date(toDate);
};

export const isValidUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const isValidGstNumber = (value) => {
  if (!value) return false;

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(
    String(value).trim()
  );
};

export const isValidPincode = (value) => {
  if (!value) return false;

  return /^[1-9][0-9]{5}$/.test(String(value).trim());
};

/* =========================
   String Validators
========================= */

export const minLength = (value, length) => {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length >= length;
};

export const maxLength = (value, length) => {
  if (value === null || value === undefined) {
    return true;
  }

  return String(value).trim().length <= length;
};

export const isLengthBetween = (value, min, max) => {
  if (value === null || value === undefined) {
    return false;
  }

  const length = String(value).trim().length;

  return length >= min && length <= max;
};

export const isValidName = (value) => {
  if (!value) return false;

  return /^[A-Za-zÀ-ÖØ-öø-ÿ' .-]{2,100}$/.test(
    String(value).trim()
  );
};

export const isValidCode = (value) => {
  if (!value) return false;

  return /^[A-Za-z0-9_-]+$/.test(String(value).trim());
};

/* =========================
   Authentication Validators
========================= */

export const validateLogin = (values = {}) => {
  const errors = {};

  if (!isRequired(values.identifier)) {
    errors.identifier = "Email or username is required.";
  }

  if (!isRequired(values.password)) {
    errors.password = "Password is required.";
  }

  return errors;
};

export const validateForgotPassword = (values = {}) => {
  const errors = {};

  if (!isRequired(values.email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
};

export const validateResetPassword = (values = {}) => {
  const errors = {};

  if (!isRequired(values.password)) {
    errors.password = "Password is required.";
  } else if (!isValidPassword(values.password)) {
    errors.password =
      "Password must contain at least 8 characters, including uppercase, lowercase and a number.";
  }

  if (!isRequired(values.confirmPassword)) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};

export const isValidPassword = (value) => {
  if (!value) return false;

  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
    String(value)
  );
};

/* =========================
   Lead Validators
========================= */

export const validateLead = (values = {}) => {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = "Customer name is required.";
  } else if (!isLengthBetween(values.name, 2, 100)) {
    errors.name = "Customer name must be between 2 and 100 characters.";
  }

  if (!isRequired(values.phone)) {
    errors.phone = "Mobile number is required.";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Please enter a valid mobile number.";
  }

  if (values.email && !isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.companyName && !maxLength(values.companyName, 150)) {
    errors.companyName =
      "Company name cannot exceed 150 characters.";
  }

  if (values.address && !maxLength(values.address, 500)) {
    errors.address = "Address cannot exceed 500 characters.";
  }

  if (!isRequired(values.source)) {
    errors.source = "Lead source is required.";
  }

  if (values.priority && !Object.values(LEAD_PRIORITY).includes(values.priority)) {
    errors.priority = "Please select a valid priority.";
  }

  return errors;
};

/* =========================
   Employee Validators
========================= */

export const validateEmployee = (values = {}) => {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = "Employee name is required.";
  } else if (!isLengthBetween(values.name, 2, 100)) {
    errors.name = "Employee name must be between 2 and 100 characters.";
  }

  if (!isRequired(values.email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.mobile && !isValidPhone(values.mobile)) {
    errors.mobile = "Please enter a valid mobile number.";
  }

  if (!isRequired(values.department)) {
    errors.department = "Department is required.";
  }

  if (!isRequired(values.designation)) {
    errors.designation = "Designation is required.";
  }

  if (!isRequired(values.joiningDate)) {
    errors.joiningDate = "Joining date is required.";
  } else if (!isValidDate(values.joiningDate)) {
    errors.joiningDate = "Please enter a valid joining date.";
  }

  if (!isRequired(values.role)) {
    errors.role = "Role is required.";
  } else if (!Object.values(ROLES).includes(values.role)) {
    errors.role = "Please select a valid role.";
  }

  return errors;
};

/* =========================
   Solar Requirement
========================= */

export const validateSolarRequirement = (values = {}) => {
  const errors = {};

  if (
    values.requiredCapacity !== undefined &&
    values.requiredCapacity !== ""
  ) {
    if (!isPositiveNumber(values.requiredCapacity)) {
      errors.requiredCapacity =
        "Required capacity must be greater than zero.";
    }
  }

  if (
    values.monthlyBill !== undefined &&
    values.monthlyBill !== ""
  ) {
    if (!isNonNegativeNumber(values.monthlyBill)) {
      errors.monthlyBill =
        "Monthly electricity bill must be a valid amount.";
    }
  }

  if (
    values.monthlyUnits !== undefined &&
    values.monthlyUnits !== ""
  ) {
    if (!isNonNegativeNumber(values.monthlyUnits)) {
      errors.monthlyUnits =
        "Monthly units must be a valid number.";
    }
  }

  if (!isRequired(values.systemType)) {
    errors.systemType = "System type is required.";
  }

  if (!isRequired(values.siteAddress)) {
    errors.siteAddress = "Site address is required.";
  }

  return errors;
};

/* =========================
   System Configuration
========================= */

export const validateSystemConfiguration = (values = {}) => {
  const errors = {};

  if (
    values.systemCapacity !== undefined &&
    values.systemCapacity !== ""
  ) {
    if (!isPositiveNumber(values.systemCapacity)) {
      errors.systemCapacity =
        "System capacity must be greater than zero.";
    }
  }

  if (
    values.totalCapacity !== undefined &&
    values.totalCapacity !== ""
  ) {
    if (!isNonNegativeNumber(values.totalCapacity)) {
      errors.totalCapacity =
        "Total capacity must be a valid number.";
    }
  }

  if (
    values.subtotal !== undefined &&
    values.subtotal !== ""
  ) {
    if (!isNonNegativeNumber(values.subtotal)) {
      errors.subtotal = "Subtotal must be a valid amount.";
    }
  }

  if (
    values.discount !== undefined &&
    values.discount !== ""
  ) {
    if (!isNonNegativeNumber(values.discount)) {
      errors.discount = "Discount must be a valid amount.";
    }
  }

  if (
    values.tax !== undefined &&
    values.tax !== ""
  ) {
    if (!isNonNegativeNumber(values.tax)) {
      errors.tax = "Tax must be a valid amount.";
    }
  }

  return errors;
};

/* =========================
   Quotation Validators
========================= */

export const validateQuotation = (values = {}) => {
  const errors = {};

  if (!isRequired(values.customerId) && !isRequired(values.leadId)) {
    errors.customerId =
      "Customer or lead information is required.";
  }

  if (
    values.validityDate &&
    !isValidDate(values.validityDate)
  ) {
    errors.validityDate = "Please enter a valid validity date.";
  }

  if (
    values.validUntil &&
    !isValidDate(values.validUntil)
  ) {
    errors.validUntil = "Please enter a valid expiry date.";
  }

  if (
    values.validityDate &&
    values.validUntil &&
    !isValidDateRange(values.validityDate, values.validUntil)
  ) {
    errors.validUntil =
      "Expiry date must be after the quotation date.";
  }

  if (
    values.items !== undefined &&
    (!Array.isArray(values.items) || values.items.length === 0)
  ) {
    errors.items = "At least one quotation item is required.";
  }

  return errors;
};

/* =========================
   Customer Validators
========================= */

export const validateCustomer = (values = {}) => {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = "Customer name is required.";
  } else if (!isLengthBetween(values.name, 2, 100)) {
    errors.name = "Customer name must be between 2 and 100 characters.";
  }

  if (!isRequired(values.mobile) && !isRequired(values.phone)) {
    errors.mobile = "Mobile number is required.";
  }

  const phone = values.mobile || values.phone;

  if (phone && !isValidPhone(phone)) {
    errors.mobile = "Please enter a valid mobile number.";
  }

  if (values.email && !isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (
    values.billingAddress &&
    !maxLength(values.billingAddress, 500)
  ) {
    errors.billingAddress =
      "Billing address cannot exceed 500 characters.";
  }

  if (
    values.siteAddress &&
    !maxLength(values.siteAddress, 500)
  ) {
    errors.siteAddress =
      "Site address cannot exceed 500 characters.";
  }

  return errors;
};

/* =========================
   Invoice Validators
========================= */

export const validateInvoice = (values = {}) => {
  const errors = {};

  if (!isRequired(values.customerId)) {
    errors.customerId = "Customer is required.";
  }

  if (
    values.invoiceDate &&
    !isValidDate(values.invoiceDate)
  ) {
    errors.invoiceDate = "Please enter a valid invoice date.";
  }

  if (
    values.dueDate &&
    !isValidDate(values.dueDate)
  ) {
    errors.dueDate = "Please enter a valid due date.";
  }

  if (
    values.invoiceDate &&
    values.dueDate &&
    !isValidDateRange(values.invoiceDate, values.dueDate)
  ) {
    errors.dueDate =
      "Due date must be on or after the invoice date.";
  }

  if (
    values.items !== undefined &&
    (!Array.isArray(values.items) || values.items.length === 0)
  ) {
    errors.items = "At least one invoice item is required.";
  }

  return errors;
};

/* =========================
   Task Validators
========================= */

export const validateTask = (values = {}) => {
  const errors = {};

  if (!isRequired(values.title)) {
    errors.title = "Task title is required.";
  } else if (!isLengthBetween(values.title, 2, 200)) {
    errors.title = "Task title must be between 2 and 200 characters.";
  }

  if (values.description && !maxLength(values.description, 2000)) {
    errors.description =
      "Description cannot exceed 2000 characters.";
  }

  if (!isRequired(values.assignedTo)) {
    errors.assignedTo = "Assigned employee is required.";
  }

  if (!isRequired(values.dueDate)) {
    errors.dueDate = "Due date is required.";
  } else if (!isValidDate(values.dueDate)) {
    errors.dueDate = "Please enter a valid due date.";
  }

  return errors;
};

/* =========================
   Attendance Validators
========================= */

export const validateAttendance = (values = {}) => {
  const errors = {};

  if (!isRequired(values.employeeId)) {
    errors.employeeId = "Employee is required.";
  }

  if (!isRequired(values.date)) {
    errors.date = "Attendance date is required.";
  } else if (!isValidDate(values.date)) {
    errors.date = "Please enter a valid attendance date.";
  }

  if (!isRequired(values.status)) {
    errors.status = "Attendance status is required.";
  }

  return errors;
};

/* =========================
   Leave Validators
========================= */

export const validateLeave = (values = {}) => {
  const errors = {};

  if (!isRequired(values.leaveType)) {
    errors.leaveType = "Leave type is required.";
  }

  if (!isRequired(values.fromDate)) {
    errors.fromDate = "Start date is required.";
  } else if (!isValidDate(values.fromDate)) {
    errors.fromDate = "Please enter a valid start date.";
  }

  if (!isRequired(values.toDate)) {
    errors.toDate = "End date is required.";
  } else if (!isValidDate(values.toDate)) {
    errors.toDate = "Please enter a valid end date.";
  }

  if (
    values.fromDate &&
    values.toDate &&
    !isValidDateRange(values.fromDate, values.toDate)
  ) {
    errors.toDate = "End date must be on or after the start date.";
  }

  if (!isRequired(values.reason)) {
    errors.reason = "Leave reason is required.";
  } else if (!maxLength(values.reason, 1000)) {
    errors.reason = "Leave reason cannot exceed 1000 characters.";
  }

  return errors;
};

/* =========================
   Settings Validators
========================= */

export const validateCompanySettings = (values = {}) => {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = "Company name is required.";
  }

  if (values.email && !isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.phone && !isValidPhone(values.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (values.gstin && !isValidGstNumber(values.gstin)) {
    errors.gstin = "Please enter a valid GSTIN.";
  }

  return errors;
};

export const validateBankSettings = (values = {}) => {
  const errors = {};

  if (!isRequired(values.accountName)) {
    errors.accountName = "Account name is required.";
  }

  if (!isRequired(values.accountNumber)) {
    errors.accountNumber = "Account number is required.";
  }

  if (!isRequired(values.ifscCode)) {
    errors.ifscCode = "IFSC code is required.";
  } else if (
    !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(
      String(values.ifscCode).trim()
    )
  ) {
    errors.ifscCode = "Please enter a valid IFSC code.";
  }

  return errors;
};

/* =========================
   Generic Form Helpers
========================= */

export const hasValidationErrors = (errors = {}) =>
  Object.keys(errors).length > 0;

export const getFirstValidationError = (errors = {}) => {
  const firstKey = Object.keys(errors)[0];

  return firstKey ? errors[firstKey] : "";
};

export const validateForm = (validator, values = {}) => {
  if (typeof validator !== "function") {
    return {};
  }

  return validator(values);
};

export default {
  isRequired,
  isValidEmail,
  isValidPhone,
  isValidIndianMobile,
  isValidNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  isInteger,
  isPositiveInteger,
  isWithinRange,
  isValidDate,
  isValidDateRange,
  isValidUrl,
  isValidGstNumber,
  isValidPincode,
  minLength,
  maxLength,
  isLengthBetween,
  isValidName,
  isValidCode,
  isValidPassword,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateLead,
  validateEmployee,
  validateSolarRequirement,
  validateSystemConfiguration,
  validateQuotation,
  validateCustomer,
  validateInvoice,
  validateTask,
  validateAttendance,
  validateLeave,
  validateCompanySettings,
  validateBankSettings,
  hasValidationErrors,
  getFirstValidationError,
  validateForm,
};