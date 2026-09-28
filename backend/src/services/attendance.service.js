const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { ATTENDANCE_STATUS } = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const getDateOnly = (date = new Date()) => {
  const value = new Date(date);

  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate()
  );
};

const calculateTotalHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (end <= start) {
    return 0;
  }

  return Number(
    ((end - start) / (1000 * 60 * 60)).toFixed(2)
  );
};

/*
|--------------------------------------------------------------------------
| Employee Helpers
|--------------------------------------------------------------------------
*/

/*
 * Accepts either:
 *
 * 1. Employee._id
 * 2. User._id
 *
 * This is important because:
 * - Admin/HR manual operations may send Employee._id
 * - Employee self actions send req.user.userId
 */
const findEmployee = async (employeeId) => {
  if (!employeeId) {
    const error = new Error("Employee ID is required");
    error.statusCode = 400;
    throw error;
  }

  let employee = null;

  // First try Employee._id
  try {
    employee = await Employee.findById(employeeId);
  } catch (error) {
    // Ignore invalid Employee ObjectId and try User mapping below.
    employee = null;
  }

  // If not found, try User._id -> Employee.user
  if (!employee) {
    try {
      employee = await Employee.findOne({
        user: employeeId,
      });
    } catch (error) {
      employee = null;
    }
  }

  if (!employee) {
    const error = new Error("Employee profile not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

const validateEmployee = async (employeeId) => {
  return findEmployee(employeeId);
};

/*
|--------------------------------------------------------------------------
| Create Attendance
|--------------------------------------------------------------------------
*/

const createAttendance = async (data, createdBy) => {
  const employee = await validateEmployee(data.employee);

  const attendanceDate = getDateOnly(
    data.attendanceDate || new Date()
  );

  const existing = await Attendance.findOne({
    employee: employee._id,
    attendanceDate,
  });

  if (existing) {
    const error = new Error(
      "Attendance already exists for this employee and date"
    );
    error.statusCode = 409;
    throw error;
  }

  const attendance = await Attendance.create({
    employee: employee._id,
    attendanceDate,
    status:
      data.status || ATTENDANCE_STATUS.PRESENT,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    totalHours: calculateTotalHours(
      data.checkIn,
      data.checkOut
    ),
    lateMinutes: Number(data.lateMinutes) || 0,
    overtimeHours: Number(data.overtimeHours) || 0,
    remarks: data.remarks,
    createdBy,
  });

  return getAttendanceById(attendance._id);
};

/*
|--------------------------------------------------------------------------
| Check-In
|--------------------------------------------------------------------------
*/

const checkIn = async (
  employeeId,
  data = {},
  createdBy
) => {
  const employee = await validateEmployee(employeeId);

  const attendanceDate = getDateOnly(
    data.attendanceDate || new Date()
  );

  let attendance = await Attendance.findOne({
    employee: employee._id,
    attendanceDate,
  });

  if (attendance && attendance.checkIn) {
    const error = new Error(
      "Employee has already checked in today"
    );
    error.statusCode = 409;
    throw error;
  }

  if (!attendance) {
    attendance = new Attendance({
      employee: employee._id,
      attendanceDate,
      status:
        data.status ||
        ATTENDANCE_STATUS.PRESENT,
      createdBy,
    });
  }

  attendance.checkIn =
    data.checkIn || new Date();

  attendance.lateMinutes =
    Number(data.lateMinutes) || 0;

  attendance.remarks =
    data.remarks || attendance.remarks;

  attendance.updatedBy = createdBy;

  await attendance.save();

  return getAttendanceById(attendance._id);
};

/*
|--------------------------------------------------------------------------
| Check-Out
|--------------------------------------------------------------------------
*/

const checkOut = async (
  employeeId,
  data = {},
  updatedBy
) => {
  const employee = await validateEmployee(employeeId);

  const attendanceDate = getDateOnly(
    data.attendanceDate || new Date()
  );

  const attendance = await Attendance.findOne({
    employee: employee._id,
    attendanceDate,
  });

  if (!attendance) {
    const error = new Error(
      "Today's attendance record not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (!attendance.checkIn) {
    const error = new Error(
      "Employee has not checked in"
    );
    error.statusCode = 400;
    throw error;
  }

  if (attendance.checkOut) {
    const error = new Error(
      "Employee has already checked out"
    );
    error.statusCode = 409;
    throw error;
  }

  attendance.checkOut =
    data.checkOut || new Date();

  attendance.totalHours =
    calculateTotalHours(
      attendance.checkIn,
      attendance.checkOut
    );

  if (data.overtimeHours !== undefined) {
    attendance.overtimeHours =
      Number(data.overtimeHours) || 0;
  }

  if (data.remarks !== undefined) {
    attendance.remarks = data.remarks;
  }

  attendance.updatedBy = updatedBy;

  await attendance.save();

  return getAttendanceById(attendance._id);
};

/*
|--------------------------------------------------------------------------
| Get All Attendance
|--------------------------------------------------------------------------
*/

const getAttendances = async ({
  page = 1,
  limit = 10,
  employee,
  status,
  dateFrom,
  dateTo,
  startDate,
  endDate,
  search = "",
} = {}) => {
  const filter = {};

  const employeeFilter =
    employee || undefined;

  if (employeeFilter) {
    const employeeRecord =
      await validateEmployee(employeeFilter);

    filter.employee = employeeRecord._id;
  }

  if (status) {
    filter.status = status;
  }

  const fromDate =
    dateFrom || startDate;

  const toDate =
    dateTo || endDate;

  if (fromDate || toDate) {
    filter.attendanceDate = {};

    if (fromDate) {
      filter.attendanceDate.$gte =
        getDateOnly(fromDate);
    }

    if (toDate) {
      filter.attendanceDate.$lte =
        getDateOnly(toDate);
    }
  }

  if (search) {
    const employees = await Employee.find({
      $or: [
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }).select("_id");

    filter.employee = {
      $in: employees.map(
        (item) => item._id
      ),
    };
  }

  const pageNumber = Math.max(
    Number(page),
    1
  );

  const limitNumber = Math.max(
    Number(limit),
    1
  );

  const skip =
    (pageNumber - 1) * limitNumber;

  const [
    attendances,
    total,
  ] = await Promise.all([
    Attendance.find(filter)
      .populate(
        "employee",
        "employeeId name email mobile department designation status"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      )
      .sort({
        attendanceDate: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Attendance.countDocuments(filter),
  ]);

  return {
    attendances,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

/*
|--------------------------------------------------------------------------
| Get Attendance By ID
|--------------------------------------------------------------------------
*/

const getAttendanceById = async (
  attendanceId
) => {
  const attendance =
    await Attendance.findById(
      attendanceId
    )
      .populate(
        "employee",
        "employeeId name email mobile department designation status"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      );

  if (!attendance) {
    const error = new Error(
      "Attendance not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return attendance;
};

/*
|--------------------------------------------------------------------------
| Get Employee Attendance
|--------------------------------------------------------------------------
*/

const getEmployeeAttendance = async (
  employeeId,
  {
    dateFrom,
    dateTo,
    startDate,
    endDate,
    page = 1,
    limit = 31,
  } = {}
) => {
  const employee =
    await validateEmployee(employeeId);

  const filter = {
    employee: employee._id,
  };

  const fromDate =
    dateFrom || startDate;

  const toDate =
    dateTo || endDate;

  if (fromDate || toDate) {
    filter.attendanceDate = {};

    if (fromDate) {
      filter.attendanceDate.$gte =
        getDateOnly(fromDate);
    }

    if (toDate) {
      filter.attendanceDate.$lte =
        getDateOnly(toDate);
    }
  }

  const pageNumber = Math.max(
    Number(page),
    1
  );

  const limitNumber = Math.max(
    Number(limit),
    1
  );

  const skip =
    (pageNumber - 1) * limitNumber;

  const [
    attendances,
    total,
  ] = await Promise.all([
    Attendance.find(filter)
      .sort({
        attendanceDate: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Attendance.countDocuments(filter),
  ]);

  return {
    attendances,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

/*
|--------------------------------------------------------------------------
| Get My Attendance
|--------------------------------------------------------------------------
|
| Employee dashboard sends User._id.
| Resolve User._id -> Employee._id first.
|
|--------------------------------------------------------------------------
*/

const getMyAttendance = async (
  userId,
  options = {}
) => {
  const employee =
    await validateEmployee(userId);

  return getEmployeeAttendance(
    employee._id,
    options
  );
};

/*
|--------------------------------------------------------------------------
| Update Attendance
|--------------------------------------------------------------------------
*/

const updateAttendance = async (
  attendanceId,
  data,
  updatedBy
) => {
  const attendance =
    await Attendance.findById(
      attendanceId
    );

  if (!attendance) {
    const error = new Error(
      "Attendance not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (data.employee) {
    const employee =
      await validateEmployee(
        data.employee
      );

    attendance.employee =
      employee._id;
  }

  if (data.attendanceDate) {
    attendance.attendanceDate =
      getDateOnly(
        data.attendanceDate
      );
  }

  if (data.status !== undefined) {
    if (
      !Object.values(
        ATTENDANCE_STATUS
      ).includes(data.status)
    ) {
      const error = new Error(
        "Invalid attendance status"
      );
      error.statusCode = 400;
      throw error;
    }

    attendance.status =
      data.status;
  }

  if (data.checkIn !== undefined) {
    attendance.checkIn =
      data.checkIn;
  }

  if (data.checkOut !== undefined) {
    attendance.checkOut =
      data.checkOut;
  }

  if (
    data.checkIn !== undefined ||
    data.checkOut !== undefined
  ) {
    attendance.totalHours =
      calculateTotalHours(
        attendance.checkIn,
        attendance.checkOut
      );
  }

  if (data.lateMinutes !== undefined) {
    attendance.lateMinutes =
      Number(data.lateMinutes) || 0;
  }

  if (data.overtimeHours !== undefined) {
    attendance.overtimeHours =
      Number(data.overtimeHours) || 0;
  }

  if (data.remarks !== undefined) {
    attendance.remarks =
      data.remarks;
  }

  attendance.updatedBy =
    updatedBy;

  await attendance.save();

  return getAttendanceById(
    attendance._id
  );
};

/*
|--------------------------------------------------------------------------
| Get Today Attendance
|--------------------------------------------------------------------------
*/

const getTodayAttendance = async (
  employeeId
) => {
  const employee =
    await validateEmployee(
      employeeId
    );

  const today =
    getDateOnly();

  return Attendance.findOne({
    employee: employee._id,
    attendanceDate: today,
  })
    .populate(
      "employee",
      "employeeId name email department designation status"
    )
    .lean();
};

/*
|--------------------------------------------------------------------------
| Attendance Stats
|--------------------------------------------------------------------------
*/

const getAttendanceStats = async ({
  employee,
  dateFrom,
  dateTo,
  startDate,
  endDate,
} = {}) => {
  const match = {};

  if (employee) {
    const employeeRecord =
      await validateEmployee(
        employee
      );

    match.employee =
      employeeRecord._id;
  }

  const fromDate =
    dateFrom || startDate;

  const toDate =
    dateTo || endDate;

  if (fromDate || toDate) {
    match.attendanceDate = {};

    if (fromDate) {
      match.attendanceDate.$gte =
        getDateOnly(fromDate);
    }

    if (toDate) {
      match.attendanceDate.$lte =
        getDateOnly(toDate);
    }
  }

  const [
    statusStats,
    hoursStats,
  ] = await Promise.all([
    Attendance.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    Attendance.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,
          totalHours: {
            $sum: "$totalHours",
          },
          overtimeHours: {
            $sum: "$overtimeHours",
          },
          lateMinutes: {
            $sum: "$lateMinutes",
          },
        },
      },
    ]),
  ]);

  return {
    byStatus: statusStats,
    totals: hoursStats[0] || {
      totalHours: 0,
      overtimeHours: 0,
      lateMinutes: 0,
    },
  };
};

/*
|--------------------------------------------------------------------------
| Mark Absent
|--------------------------------------------------------------------------
*/

const markAbsent = async (
  employeeId,
  attendanceDate,
  createdBy,
  remarks
) => {
  const employee =
    await validateEmployee(
      employeeId
    );

  const date =
    getDateOnly(attendanceDate);

  const existing =
    await Attendance.findOne({
      employee: employee._id,
      attendanceDate: date,
    });

  if (existing) {
    const error = new Error(
      "Attendance already exists for this date"
    );
    error.statusCode = 409;
    throw error;
  }

  const attendance =
    await Attendance.create({
      employee: employee._id,
      attendanceDate: date,
      status:
        ATTENDANCE_STATUS.ABSENT,
      remarks,
      createdBy,
    });

  return getAttendanceById(
    attendance._id
  );
};

/*
|--------------------------------------------------------------------------
| Delete Attendance
|--------------------------------------------------------------------------
*/

const deleteAttendance = async (
  attendanceId
) => {
  const attendance =
    await Attendance.findById(
      attendanceId
    );

  if (!attendance) {
    const error = new Error(
      "Attendance not found"
    );
    error.statusCode = 404;
    throw error;
  }

  await attendance.deleteOne();

  return {
    message:
      "Attendance record deleted successfully",
  };
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  createAttendance,

  checkInEmployee: checkIn,
  checkOutEmployee: checkOut,

  getAttendances,
  getAttendanceById,
  getEmployeeAttendance,

  getMyAttendance,

  updateAttendance,

  getTodayAttendance,

  getAttendanceByDate:
    getTodayAttendance,

  getAttendanceSummary:
    getAttendanceStats,

  getAttendanceStats,
  markAbsent,
  deleteAttendance,

  calculateTotalHours,
};