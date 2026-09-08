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

  if (!isValidObjectId(leaveType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid leave type ID",
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

  if (
    totalDays === undefined ||
    totalDays === null
  ) {
    return res.status(400).json({
      success: false,
      message: "Total leave days are required",
    });
  }

  if (
    typeof totalDays !== "number" ||
    totalDays < 0.5
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Total leave days must be at least 0.5",
    });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: "Leave reason is required",
    });
  }

  if (
    status !== undefined &&
    !Object.values(LEAVE_STATUS).includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid leave status",
    });
  }

  if (
    notes !== undefined &&
    typeof notes !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Notes must be a string",
    });
  }

  return next();
};

const validateLeaveUpdate = (
  req,
  res,
  next
) => {
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

  if (
    employee !== undefined &&
    !isValidObjectId(employee)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });
  }

  if (
    leaveType !== undefined &&
    !isValidObjectId(leaveType)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid leave type ID",
    });
  }

  if (
    startDate !== undefined &&
    !isValidDate(startDate)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid start date",
    });
  }

  if (
    endDate !== undefined &&
    !isValidDate(endDate)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid end date",
    });
  }

  if (
    startDate &&
    endDate &&
    !validateDateRange(
      startDate,
      endDate
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be before start date",
    });
  }

  if (
    totalDays !== undefined &&
    (typeof totalDays !== "number" ||
      totalDays < 0.5)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Total leave days must be at least 0.5",
    });
  }

  if (reason !== undefined) {
    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Leave reason cannot be empty",
      });
    }
  }

  if (
    status !== undefined &&
    !Object.values(LEAVE_STATUS).includes(status)
  ) {
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
      message:
        "Rejection reason must be a string",
    });
  }

  if (
    cancellationReason !== undefined &&
    typeof cancellationReason !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Cancellation reason must be a string",
    });
  }

  if (
    notes !== undefined &&
    typeof notes !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Notes must be a string",
    });
  }

  return next();
};

const validateLeaveAction = (
  req,
  res,
  next
) => {
  const { reason } = req.body;

  if (
    reason !== undefined &&
    typeof reason !== "string"
  ) {
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