const mongoose = require("mongoose");
const { ATTENDANCE_STATUS } = require("../config/constants");

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const validateAttendance = (req, res, next) => {
  const {
    employee,
    attendanceDate,
    status,
    checkIn,
    checkOut,
    totalHours,
    lateMinutes,
    overtimeHours,
    remarks,
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

  if (!attendanceDate) {
    return res.status(400).json({
      success: false,
      message: "Attendance date is required",
    });
  }

  if (!isValidDate(attendanceDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid attendance date",
    });
  }

  if (
    status !== undefined &&
    !Object.values(ATTENDANCE_STATUS).includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid attendance status",
    });
  }

  if (checkIn !== undefined && checkIn !== null) {
    if (!isValidDate(checkIn)) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-in time",
      });
    }
  }

  if (checkOut !== undefined && checkOut !== null) {
    if (!isValidDate(checkOut)) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-out time",
      });
    }
  }

  if (totalHours !== undefined) {
    if (
      typeof totalHours !== "number" ||
      totalHours < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Total hours must be a non-negative number",
      });
    }
  }

  if (lateMinutes !== undefined) {
    if (
      typeof lateMinutes !== "number" ||
      lateMinutes < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Late minutes must be a non-negative number",
      });
    }
  }

  if (overtimeHours !== undefined) {
    if (
      typeof overtimeHours !== "number" ||
      overtimeHours < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Overtime hours must be a non-negative number",
      });
    }
  }

  if (
    remarks !== undefined &&
    typeof remarks !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Remarks must be a string",
    });
  }

  return next();
};

const validateAttendanceUpdate = (
  req,
  res,
  next
) => {
  const {
    employee,
    attendanceDate,
    status,
    checkIn,
    checkOut,
    totalHours,
    lateMinutes,
    overtimeHours,
    remarks,
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
    attendanceDate !== undefined &&
    !isValidDate(attendanceDate)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid attendance date",
    });
  }

  if (
    status !== undefined &&
    !Object.values(ATTENDANCE_STATUS).includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid attendance status",
    });
  }

  if (
    checkIn !== undefined &&
    checkIn !== null &&
    !isValidDate(checkIn)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid check-in time",
    });
  }

  if (
    checkOut !== undefined &&
    checkOut !== null &&
    !isValidDate(checkOut)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid check-out time",
    });
  }

  if (
    totalHours !== undefined &&
    (typeof totalHours !== "number" ||
      totalHours < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Total hours must be a non-negative number",
    });
  }

  if (
    lateMinutes !== undefined &&
    (typeof lateMinutes !== "number" ||
      lateMinutes < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Late minutes must be a non-negative number",
    });
  }

  if (
    overtimeHours !== undefined &&
    (typeof overtimeHours !== "number" ||
      overtimeHours < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Overtime hours must be a non-negative number",
    });
  }

  if (
    remarks !== undefined &&
    typeof remarks !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Remarks must be a string",
    });
  }

  return next();
};

module.exports = {
  validateAttendance,
  validateAttendanceUpdate,
};