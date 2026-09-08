const {
  LEAD_STATUS,
  LEAD_PRIORITY,
} = require("../config/constants");

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateLead = (req, res, next) => {
  const {
    leadId,
    customerName,
    companyName,
    mobile,
    email,
    address,
    location,
    leadSource,
    requirementSummary,
    status,
    priority,
    assignedTo,
    followUpDate,
    notes,
  } = req.body;

  const errors = [];

  // Lead ID
  if (!leadId || typeof leadId !== "string") {
    errors.push("Lead ID is required");
  }

  // Customer Name
  if (!customerName || typeof customerName !== "string") {
    errors.push("Customer name is required");
  } else if (customerName.trim().length < 2) {
    errors.push("Customer name must be at least 2 characters");
  }

  // Company Name
  if (
    companyName !== undefined &&
    companyName !== null &&
    companyName !== "" &&
    typeof companyName !== "string"
  ) {
    errors.push("Company name must be a string");
  }

  // Mobile
  if (!mobile || typeof mobile !== "string") {
    errors.push("Mobile number is required");
  } else if (mobile.trim().length < 7) {
    errors.push("Please provide a valid mobile number");
  }

  // Email
  if (email !== undefined && email !== null && email !== "") {
    if (typeof email !== "string") {
      errors.push("Email must be a string");
    } else if (!isValidEmail(email)) {
      errors.push("Please provide a valid email");
    }
  }

  // Address
  if (
    address !== undefined &&
    address !== null &&
    address !== "" &&
    typeof address !== "string"
  ) {
    errors.push("Address must be a string");
  }

  // Location
  if (
    location !== undefined &&
    location !== null &&
    location !== "" &&
    typeof location !== "string"
  ) {
    errors.push("Location must be a string");
  }

  // Lead Source
  if (!leadSource || typeof leadSource !== "string") {
    errors.push("Lead source is required");
  }

  // Requirement Summary
  if (
    requirementSummary !== undefined &&
    requirementSummary !== null &&
    requirementSummary !== "" &&
    typeof requirementSummary !== "string"
  ) {
    errors.push("Requirement summary must be a string");
  }

  // Status
  if (status !== undefined && status !== null && status !== "") {
    if (
      typeof status !== "string" ||
      !Object.values(LEAD_STATUS).includes(status)
    ) {
      errors.push(
        `Invalid lead status. Allowed statuses: ${Object.values(
          LEAD_STATUS
        ).join(", ")}`
      );
    }
  }

  // Priority
  if (priority !== undefined && priority !== null && priority !== "") {
    if (
      typeof priority !== "string" ||
      !Object.values(LEAD_PRIORITY).includes(priority)
    ) {
      errors.push(
        `Invalid lead priority. Allowed priorities: ${Object.values(
          LEAD_PRIORITY
        ).join(", ")}`
      );
    }
  }

  // Assigned Employee
  if (
    assignedTo !== undefined &&
    assignedTo !== null &&
    assignedTo !== "" &&
    typeof assignedTo !== "string"
  ) {
    errors.push("Assigned employee must be a valid employee ID");
  }

  // Follow-up Date
  if (
    followUpDate !== undefined &&
    followUpDate !== null &&
    followUpDate !== ""
  ) {
    if (Number.isNaN(new Date(followUpDate).getTime())) {
      errors.push("Follow-up date is invalid");
    }
  }

  // Notes
  if (
    notes !== undefined &&
    notes !== null &&
    notes !== "" &&
    typeof notes !== "string"
  ) {
    errors.push("Notes must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Lead validation failed",
      errors,
    });
  }

  next();
};

const validateLeadUpdate = (req, res, next) => {
  const {
    customerName,
    companyName,
    mobile,
    email,
    address,
    location,
    leadSource,
    requirementSummary,
    status,
    priority,
    assignedTo,
    followUpDate,
    notes,
  } = req.body;

  const errors = [];

  // Customer Name
  if (customerName !== undefined) {
    if (
      typeof customerName !== "string" ||
      customerName.trim().length < 2
    ) {
      errors.push("Customer name must be at least 2 characters");
    }
  }

  // Company Name
  if (
    companyName !== undefined &&
    companyName !== null &&
    companyName !== "" &&
    typeof companyName !== "string"
  ) {
    errors.push("Company name must be a string");
  }

  // Mobile
  if (mobile !== undefined) {
    if (
      typeof mobile !== "string" ||
      mobile.trim().length < 7
    ) {
      errors.push("Please provide a valid mobile number");
    }
  }

  // Email
  if (email !== undefined && email !== null && email !== "") {
    if (typeof email !== "string") {
      errors.push("Email must be a string");
    } else if (!isValidEmail(email)) {
      errors.push("Please provide a valid email");
    }
  }

  // Address
  if (
    address !== undefined &&
    address !== null &&
    address !== "" &&
    typeof address !== "string"
  ) {
    errors.push("Address must be a string");
  }

  // Location
  if (
    location !== undefined &&
    location !== null &&
    location !== "" &&
    typeof location !== "string"
  ) {
    errors.push("Location must be a string");
  }

  // Lead Source
  if (
    leadSource !== undefined &&
    (typeof leadSource !== "string" || !leadSource.trim())
  ) {
    errors.push("Lead source must be a valid string");
  }

  // Requirement Summary
  if (
    requirementSummary !== undefined &&
    requirementSummary !== null &&
    requirementSummary !== "" &&
    typeof requirementSummary !== "string"
  ) {
    errors.push("Requirement summary must be a string");
  }

  // Status
  if (status !== undefined) {
    if (
      typeof status !== "string" ||
      !Object.values(LEAD_STATUS).includes(status)
    ) {
      errors.push(
        `Invalid lead status. Allowed statuses: ${Object.values(
          LEAD_STATUS
        ).join(", ")}`
      );
    }
  }

  // Priority
  if (priority !== undefined) {
    if (
      typeof priority !== "string" ||
      !Object.values(LEAD_PRIORITY).includes(priority)
    ) {
      errors.push(
        `Invalid lead priority. Allowed priorities: ${Object.values(
          LEAD_PRIORITY
        ).join(", ")}`
      );
    }
  }

  // Assigned Employee
  if (
    assignedTo !== undefined &&
    assignedTo !== null &&
    assignedTo !== "" &&
    typeof assignedTo !== "string"
  ) {
    errors.push("Assigned employee must be a valid employee ID");
  }

  // Follow-up Date
  if (
    followUpDate !== undefined &&
    followUpDate !== null &&
    followUpDate !== ""
  ) {
    if (Number.isNaN(new Date(followUpDate).getTime())) {
      errors.push("Follow-up date is invalid");
    }
  }

  // Notes
  if (
    notes !== undefined &&
    notes !== null &&
    notes !== "" &&
    typeof notes !== "string"
  ) {
    errors.push("Notes must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Lead update validation failed",
      errors,
    });
  }

  next();
};

const validateLeadStatus = (req, res, next) => {
  const { status, closedReason } = req.body;
  const errors = [];

  if (!status || typeof status !== "string") {
    errors.push("Lead status is required");
  } else if (!Object.values(LEAD_STATUS).includes(status)) {
    errors.push(
      `Invalid lead status. Allowed statuses: ${Object.values(
        LEAD_STATUS
      ).join(", ")}`
    );
  }

  if (
    closedReason !== undefined &&
    closedReason !== null &&
    closedReason !== "" &&
    typeof closedReason !== "string"
  ) {
    errors.push("Closed reason must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Lead status validation failed",
      errors,
    });
  }

  next();
};

const validateLeadAssignment = (req, res, next) => {
  const { assignedTo } = req.body;
  const errors = [];

  if (!assignedTo || typeof assignedTo !== "string") {
    errors.push("Assigned employee is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Lead assignment validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateLead,
  validateLeadUpdate,
  validateLeadStatus,
  validateLeadAssignment,
};