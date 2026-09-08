const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { ATTENDANCE_STATUS } = require("../config/constants");

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

const validateEmployee = async (employeeId) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

const createAttendance = async (data, createdBy) => {
  await validateEmployee(data.employee);

  const attendanceDate = getDateOnly(
    data.attendanceDate || new Date()
  );

  const existing = await Attendance.findOne({
    employee: data.employee,
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
    employee: data.employee,
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

const checkIn = async (
  employeeId,
  data = {},
  createdBy
) => {
  await validateEmployee(employeeId);

  const attendanceDate = getDateOnly(
    data.attendanceDate || new Date()
  );

  let attendance = await Attendance.findOne({
    employee: employeeId,
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
      employee: employeeId,
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

const checkOut = async (
  employeeId,
  data = {},
  updatedBy
) => {
  await validateEmployee(employeeId);

  const attendanceDate = getDateOnly(
    data.attendanceDate || new Date()
  );

  const attendance = await Attendance.findOne({
    employee: employeeId,
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

const getAttendances = async ({
  page = 1,
  limit = 10,
  employee,
  status,
  dateFrom,
  dateTo,
  search = "",
}) => {
  const filter = {};

  if (employee) {
    filter.employee = employee;
  }

  if (status) {
    filter.status = status;
  }

  if (dateFrom || dateTo) {
    filter.attendanceDate = {};

    if (dateFrom) {
      filter.attendanceDate.$gte =
        getDateOnly(dateFrom);
    }

    if (dateTo) {
      filter.attendanceDate.$lte =
        getDateOnly(dateTo);
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
      $in: employees.map((item) => item._id),
    };
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [attendances, total] = await Promise.all([
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
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getAttendanceById = async (attendanceId) => {
  const attendance = await Attendance.findById(
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
    const error = new Error("Attendance not found");
    error.statusCode = 404;
    throw error;
  }

  return attendance;
};

const getEmployeeAttendance = async (
  employeeId,
  {
    dateFrom,
    dateTo,
    page = 1,
    limit = 31,
  } = {}
) => {
  await validateEmployee(employeeId);

  const filter = {
    employee: employeeId,
  };

  if (dateFrom || dateTo) {
    filter.attendanceDate = {};

    if (dateFrom) {
      filter.attendanceDate.$gte =
        getDateOnly(dateFrom);
    }

    if (dateTo) {
      filter.attendanceDate.$lte =
        getDateOnly(dateTo);
    }
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [attendances, total] = await Promise.all([
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
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const updateAttendance = async (
  attendanceId,
  data,
  updatedBy
) => {
  const attendance =
    await Attendance.findById(attendanceId);

  if (!attendance) {
    const error = new Error("Attendance not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.employee) {
    await validateEmployee(data.employee);
    attendance.employee = data.employee;
  }

  if (data.attendanceDate) {
    attendance.attendanceDate =
      getDateOnly(data.attendanceDate);
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

    attendance.status = data.status;
  }

  if (data.checkIn !== undefined) {
    attendance.checkIn = data.checkIn;
  }

  if (data.checkOut !== undefined) {
    attendance.checkOut = data.checkOut;
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
    attendance.remarks = data.remarks;
  }

  attendance.updatedBy = updatedBy;

  await attendance.save();

  return getAttendanceById(attendance._id);
};

const getTodayAttendance = async (
  employeeId
) => {
  await validateEmployee(employeeId);

  const today = getDateOnly();

  return Attendance.findOne({
    employee: employeeId,
    attendanceDate: today,
  })
    .populate(
      "employee",
      "employeeId name email department designation status"
    )
    .lean();
};

const getAttendanceStats = async ({
  employee,
  dateFrom,
  dateTo,
} = {}) => {
  const match = {};

  if (employee) {
    match.employee = employee;
  }

  if (dateFrom || dateTo) {
    match.attendanceDate = {};

    if (dateFrom) {
      match.attendanceDate.$gte =
        getDateOnly(dateFrom);
    }

    if (dateTo) {
      match.attendanceDate.$lte =
        getDateOnly(dateTo);
    }
  }

  const [statusStats, hoursStats] =
    await Promise.all([
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

const markAbsent = async (
  employeeId,
  attendanceDate,
  createdBy,
  remarks
) => {
  await validateEmployee(employeeId);

  const date = getDateOnly(attendanceDate);

  const existing = await Attendance.findOne({
    employee: employeeId,
    attendanceDate: date,
  });

  if (existing) {
    const error = new Error(
      "Attendance already exists for this date"
    );
    error.statusCode = 409;
    throw error;
  }

  const attendance = await Attendance.create({
    employee: employeeId,
    attendanceDate: date,
    status: ATTENDANCE_STATUS.ABSENT,
    remarks,
    createdBy,
  });

  return getAttendanceById(attendance._id);
};

const deleteAttendance = async (
  attendanceId
) => {
  const attendance =
    await Attendance.findById(attendanceId);

  if (!attendance) {
    const error = new Error("Attendance not found");
    error.statusCode = 404;
    throw error;
  }

  await attendance.deleteOne();

  return {
    message:
      "Attendance record deleted successfully",
  };
};

module.exports = {
  createAttendance,
  checkIn,
  checkOut,
  getAttendances,
  getAttendanceById,
  getEmployeeAttendance,
  updateAttendance,
  getTodayAttendance,
  getAttendanceStats,
  markAbsent,
  deleteAttendance,
  calculateTotalHours,
};