const attendanceService = require("../services/attendance.service");

const createAttendance = async (req, res, next) => {
  try {
    const attendance =
      await attendanceService.createAttendance(
        req.body,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const attendance =
      await attendanceService.getAttendanceById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendances = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee,
      status,
      startDate,
      endDate,
    } = req.query;

    const result =
      await attendanceService.getAttendances({
        page,
        limit,
        employee,
        status,
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Attendance records fetched successfully",
      data: result.attendances,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeAttendance = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
    } = req.query;

    const result =
      await attendanceService.getEmployeeAttendance(
        req.params.employeeId,
        {
          page,
          limit,
          status,
          startDate,
          endDate,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Employee attendance fetched successfully",
      data: result.attendances,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
    } = req.query;

    const result =
      await attendanceService.getMyAttendance(
        req.user.userId,
        {
          page,
          limit,
          status,
          startDate,
          endDate,
        }
      );

    return res.status(200).json({
      success: true,
      message: "My attendance fetched successfully",
      data: result.attendances,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByDate = async (
  req,
  res,
  next
) => {
  try {
    const attendance =
      await attendanceService.getAttendanceByDate(
        req.params.employeeId,
        req.params.date
      );

    return res.status(200).json({
      success: true,
      message:
        "Attendance for date fetched successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (
  req,
  res,
  next
) => {
  try {
    const attendance =
      await attendanceService.updateAttendance(
        req.params.id,
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const {
      employee,
      attendanceDate,
    } = req.body;

    const employeeId =
      employee || req.user.userId;

    const attendance =
      await attendanceService.checkInEmployee(
        employeeId,
        req.user.userId,
        attendanceDate
      );

    return res.status(200).json({
      success: true,
      message: "Employee checked in successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const {
      employee,
      attendanceDate,
    } = req.body;

    const employeeId =
      employee || req.user.userId;

    const attendance =
      await attendanceService.checkOutEmployee(
        employeeId,
        req.user.userId,
        attendanceDate
      );

    return res.status(200).json({
      success: true,
      message: "Employee checked out successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceSummary = async (
  req,
  res,
  next
) => {
  try {
    const {
      employee,
      startDate,
      endDate,
    } = req.query;

    const employeeId =
      employee || undefined;

    const summary =
      await attendanceService.getAttendanceSummary({
        employee: employeeId,
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message:
        "Attendance summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttendance,
  getAttendance,
  getAttendances,
  getEmployeeAttendance,
  getMyAttendance,
  getAttendanceByDate,
  updateAttendance,
  checkIn,
  checkOut,
  getAttendanceSummary,
};