const attendanceService = require("../services/attendance.service");

/*
|--------------------------------------------------------------------------
| Create Attendance
|--------------------------------------------------------------------------
*/

const createAttendance = async (
  req,
  res,
  next
) => {
  try {
    const attendance =
      await attendanceService.createAttendance(
        req.body,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Attendance
|--------------------------------------------------------------------------
*/

const getAttendance = async (
  req,
  res,
  next
) => {
  try {
    const attendance =
      await attendanceService.getAttendanceById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get All Attendance
|--------------------------------------------------------------------------
*/

const getAttendances = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee,
      status,
      startDate,
      endDate,
      dateFrom,
      dateTo,
      search = "",
    } = req.query;

    const result =
      await attendanceService.getAttendances({
        page,
        limit,
        employee,
        status,
        startDate,
        endDate,
        dateFrom,
        dateTo,
        search,
      });

    return res.status(200).json({
      success: true,
      message:
        "Attendance records fetched successfully",
      data: result.attendances,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Employee Attendance
|--------------------------------------------------------------------------
*/

const getEmployeeAttendance = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 31,
      status,
      startDate,
      endDate,
      dateFrom,
      dateTo,
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
          dateFrom,
          dateTo,
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

/*
|--------------------------------------------------------------------------
| Get My Attendance
|--------------------------------------------------------------------------
|
| Employee uses User._id.
| Service converts User._id -> Employee._id.
|
|--------------------------------------------------------------------------
*/

const getMyAttendance = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 31,
      status,
      startDate,
      endDate,
      dateFrom,
      dateTo,
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
          dateFrom,
          dateTo,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "My attendance fetched successfully",
      data: result.attendances,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Attendance By Employee / Date
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Update Attendance
|--------------------------------------------------------------------------
*/

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
      message:
        "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Check-In
|--------------------------------------------------------------------------
|
| Employee:
|   employeeId = logged-in User._id
|
| Admin / Manager / HR:
|   employee can be passed explicitly.
|
|--------------------------------------------------------------------------
*/

const checkIn = async (
  req,
  res,
  next
) => {
  try {
    const {
      employee,
      attendanceDate,
      checkIn,
      lateMinutes,
      remarks,
      status,
    } = req.body;

    /*
     * Never allow an Employee to check-in
     * another employee.
     */
    const isEmployee =
      String(req.user?.role || "").toUpperCase() ===
      "EMPLOYEE";

    const employeeId =
      isEmployee
        ? req.user.userId
        : employee || req.user.userId;

    const attendance =
      await attendanceService.checkInEmployee(
        employeeId,
        {
          attendanceDate,
          checkIn,
          lateMinutes,
          remarks,
          status,
        },
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Employee checked in successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Check-Out
|--------------------------------------------------------------------------
*/

const checkOut = async (
  req,
  res,
  next
) => {
  try {
    const {
      employee,
      attendanceDate,
      checkOut,
      overtimeHours,
      remarks,
    } = req.body;

    /*
     * Never allow an Employee to check-out
     * another employee.
     */
    const isEmployee =
      String(req.user?.role || "").toUpperCase() ===
      "EMPLOYEE";

    const employeeId =
      isEmployee
        ? req.user.userId
        : employee || req.user.userId;

    const attendance =
      await attendanceService.checkOutEmployee(
        employeeId,
        {
          attendanceDate,
          checkOut,
          overtimeHours,
          remarks,
        },
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Employee checked out successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Attendance Summary
|--------------------------------------------------------------------------
|
| Employee:
|   Only own attendance summary.
|
| Admin / Manager / HR:
|   Can request a specific employee summary.
|
|--------------------------------------------------------------------------
*/

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
      dateFrom,
      dateTo,
    } = req.query;

    const isEmployee =
      String(req.user?.role || "").toUpperCase() ===
      "EMPLOYEE";

    /*
     * Employee can only see own summary.
     */
    const employeeId = isEmployee
      ? req.user.userId
      : employee || undefined;

    const summary =
      await attendanceService.getAttendanceSummary({
        employee: employeeId,
        startDate: startDate || dateFrom,
        endDate: endDate || dateTo,
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

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

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