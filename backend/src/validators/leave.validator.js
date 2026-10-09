const mongoose = require("mongoose");
const { LEAVE_STATUS } = require("../config/constants");

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const validateDateRange = (startDate, endDate) => {
  if (
    startDate &&
    endDate &&
    new Date(endDate) < new Date(startDate)
  ) {
    return false;
  }

  return true;
};

/* -----------------------------------------
   Leave type validation

   Accepts:
   - MongoDB ObjectId  : "68a3f2c1b4e5d6a7b8c9d0e1"
   - String code/name  : "SICK", "CASUAL", "Sick Leave"

   Service will resolve the string to its _id.
----------------------------------------- */

const isValidLeaveTypeValue = (value) => {
  if (!value) return false;

  if (typeof value !== "string") return false;

  const trimmed = value.trim();

  if (!trimmed) return false;

  // ObjectId OR non-empty string (code / name)
  return true;
};

/* -----------------------------------------
   Case-insensitive leave status check
----------------------------------------- */

const isValidLeaveStatus = (value) => {
  if (value === undefined || value === null || value === "") {
    return true; // optional field
  }

  const normalized = String(value).trim().toLowerCase();

  return Object.values(LEAVE_STATUS).some(
    (status) => String(status).trim().toLowerCase() === normalized
  );
};

/* -----------------------------------------
   Create validator
----------------------------------------- */

const validateLeave = (req, res, next) => {
  const {
    employee,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
    status,
    notes,
  } = req.body;

  if (!employee) {
    return res.status(400).json({
      success: false,
      message: "Employee is required",
    });
  }

  if (!isValidObjectId(employee)) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });
  }

  if (!leaveType) {
    return res.status(400).json({
      success: false,
      message: "Leave type is required",
    });
  }

  /* ✅ Accept both ObjectId AND string code/name */
  if (!isValidLeaveTypeValue(leaveType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid leave type",
    });
  }

  if (!startDate) {
    return res.status(400).json({
      success: false,
      message: "Start date is required",
    });
  }

  if (!isValidDate(startDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid start date",
    });
  }

  if (!endDate) {
    return res.status(400).json({
      success: false,
      message: "End date is required",
    });
  }

  if (!isValidDate(endDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid end date",
    });
  }

  if (!validateDateRange(startDate, endDate)) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be before start date",
    });
  }

  if (totalDays === undefined || totalDays === null) {
    return res.status(400).json({
      success: false,
      message: "Total leave days are required",
    });
  }

  if (typeof totalDays !== "number" || totalDays < 0.5) {
    return res.status(400).json({
      success: false,
      message: "Total leave days must be at least 0.5",
    });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: "Leave reason is required",
    });
  }

  if (!isValidLeaveStatus(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid leave status",
    });
  }

  if (notes !== undefined && typeof notes !== "string") {
    return res.status(400).json({
      success: false,
      message: "Notes must be a string",
    });
  }

  return next();
};

/* -----------------------------------------
   Update validator
----------------------------------------- */

const validateLeaveUpdate = (req, res, next) => {
  const {
    employee,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
    status,
    rejectionReason,
    cancellationReason,
    notes,
  } = req.body;

  if (employee !== undefined && !isValidObjectId(employee)) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });
  }

  /* ✅ Accept both ObjectId AND string code/name */
  if (
    leaveType !== undefined &&
    leaveType !== null &&
    leaveType !== "" &&
    !isValidLeaveTypeValue(leaveType)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid leave type",
    });
  }

  if (startDate !== undefined && !isValidDate(startDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid start date",
    });
  }

  if (endDate !== undefined && !isValidDate(endDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid end date",
    });
  }

  if (startDate && endDate && !validateDateRange(startDate, endDate)) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be before start date",
    });
  }

  if (
    totalDays !== undefined &&
    (typeof totalDays !== "number" || totalDays < 0.5)
  ) {
    return res.status(400).json({
      success: false,
      message: "Total leave days must be at least 0.5",
    });
  }

  if (reason !== undefined) {
    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Leave reason cannot be empty",
      });
    }
  }

  if (!isValidLeaveStatus(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid leave status",
    });
  }

  if (
    rejectionReason !== undefined &&
    typeof rejectionReason !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason must be a string",
    });
  }

  if (
    cancellationReason !== undefined &&
    typeof cancellationReason !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Cancellation reason must be a string",
    });
  }

  if (notes !== undefined && typeof notes !== "string") {
    return res.status(400).json({
      success: false,
      message: "Notes must be a string",
    });
  }

  return next();
};

/* -----------------------------------------
   Action validator
----------------------------------------- */

const validateLeaveAction = (req, res, next) => {
  const { reason } = req.body;

  if (reason !== undefined && typeof reason !== "string") {
    return res.status(400).json({
      success: false,
      message: "Reason must be a string",
    });
  }

  return next();
};

module.exports = {
  validateLeave,
  validateLeaveUpdate,
  validateLeaveAction,
};