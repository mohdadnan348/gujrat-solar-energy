const mongoose = require("mongoose");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveType = require("../models/LeaveType");
const Employee = require("../models/Employee");
const User = require("../models/User");

const { LEAVE_STATUS } = require("../config/constants");

const getDateOnly = (date) => {
  const value = new Date(date);

  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate()
  );
};

const calculateTotalDays = (startDate, endDate) => {
  const start = getDateOnly(startDate);
  const end = getDateOnly(endDate);

  if (end < start) {
    return 0;
  }

  const difference = end.getTime() - start.getTime();

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
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

/* -----------------------------------------
   Validate Leave Type

   Accepts BOTH:
   - ObjectId       : "68a3f2c1b4e5d6a7b8c9d0e1"
   - String name    : "SICK", "Sick Leave", "sick"
   - String code    : "CASUAL", "EARNED"

   Returns the LeaveType document.
----------------------------------------- */

const validateLeaveType = async (leaveTypeInput, createdBy) => {
  if (!leaveTypeInput) {
    const error = new Error("Leave type is required");
    error.statusCode = 400;
    throw error;
  }

  let leaveType = null;

  /* -----------------------------------------
     1. Try to find by ObjectId
  ----------------------------------------- */

  if (
    typeof leaveTypeInput === "string" &&
    /^[a-fA-F0-9]{24}$/.test(leaveTypeInput)
  ) {
    leaveType = await LeaveType.findById(leaveTypeInput);
  }

  /* -----------------------------------------
     2. Fallback: find by code or name (case-insensitive)
  ----------------------------------------- */

  if (!leaveType && typeof leaveTypeInput === "string") {
    const normalized = leaveTypeInput.trim();

    leaveType = await LeaveType.findOne({
      $or: [
        { code: { $regex: `^${normalized}$`, $options: "i" } },
        { name: { $regex: `^${normalized}$`, $options: "i" } },
      ],
    });
  }

  /* -----------------------------------------
     3. Backward-compatible bootstrap for the two
        leave types already used by the UI.
        This prevents a fresh database from breaking
        leave requests before the seeder is run.
  ----------------------------------------- */
  if (!leaveType && typeof leaveTypeInput === "string") {
    const normalized = leaveTypeInput.trim().toUpperCase();
    const defaults = {
      CASUAL: { name: "Casual Leave", code: "CASUAL", description: "Casual leave request" },
      "CASUAL LEAVE": { name: "Casual Leave", code: "CASUAL", description: "Casual leave request" },
      SICK: { name: "Sick Leave", code: "SICK", description: "Sick leave request" },
      "SICK LEAVE": { name: "Sick Leave", code: "SICK", description: "Sick leave request" },
      ANNUAL: { name: "Annual Leave", code: "ANNUAL", description: "Annual leave request" },
      "ANNUAL LEAVE": { name: "Annual Leave", code: "ANNUAL", description: "Annual leave request" },
      EMERGENCY: { name: "Emergency Leave", code: "EMERGENCY", description: "Emergency leave request" },
      "EMERGENCY LEAVE": { name: "Emergency Leave", code: "EMERGENCY", description: "Emergency leave request" },
      OTHER: { name: "Other", code: "OTHER", description: "Other leave request" },
    };
    const defaultType = defaults[normalized];
    if (defaultType && createdBy) {
      leaveType = await LeaveType.findOneAndUpdate(
        { code: defaultType.code },
        { $setOnInsert: { ...defaultType, totalDays: 0, isPaid: true, isActive: true, createdBy } },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
      );
    }
  }

  if (!leaveType) {
    const error = new Error("Leave type not found. Refresh leave types and select an active type.");
    error.statusCode = 404;
    throw error;
  }

  if (!leaveType.isActive) {
    const error = new Error("Leave type is inactive");
    error.statusCode = 400;
    throw error;
  }

  return leaveType;
};

const validateUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const checkDateOverlap = async ({
  employee,
  startDate,
  endDate,
  excludeId,
}) => {
  const filter = {
    employee,
    status: {
      $nin: [LEAVE_STATUS.REJECTED, LEAVE_STATUS.CANCELLED],
    },
    startDate: {
      $lte: getDateOnly(endDate),
    },
    endDate: {
      $gte: getDateOnly(startDate),
    },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return LeaveRequest.exists(filter);
};

const getActiveLeaveTypes = async (createdBy) => {
  // Idempotently add missing defaults without overwriting company policy.
  if (createdBy) {
    for (const type of [
      { name: "Casual Leave", code: "CASUAL", description: "Casual leave request" },
      { name: "Sick Leave", code: "SICK", description: "Sick leave request" },
    ]) {
      await LeaveType.updateOne(
        { code: type.code },
        { $setOnInsert: { ...type, totalDays: 0, isPaid: true, isActive: true, createdBy } },
        { upsert: true, runValidators: true }
      );
    }
  }
  return LeaveType.find({ isActive: true })
    .select("_id name code description totalDays isPaid isActive")
    .sort({ name: 1 })
    .lean();
};

/* -----------------------------------------
   Create Leave Request
----------------------------------------- */

const createLeaveRequest = async (data, createdBy) => {
  await validateEmployee(data.employee);

  /* ✅ Validate + resolve leave type */
  const leaveTypeDoc = await validateLeaveType(data.leaveType, createdBy);

  if (!data.startDate || !data.endDate) {
    const error = new Error("Start date and end date are required");
    error.statusCode = 400;
    throw error;
  }

  const startDate = getDateOnly(data.startDate);
  const endDate = getDateOnly(data.endDate);

  if (endDate < startDate) {
    const error = new Error("End date cannot be before start date");
    error.statusCode = 400;
    throw error;
  }

  const overlapping = await checkDateOverlap({
    employee: data.employee,
    startDate,
    endDate,
  });

  if (overlapping) {
    const error = new Error(
      "Employee already has a leave request for this date range"
    );
    error.statusCode = 409;
    throw error;
  }

  const totalDays = calculateTotalDays(startDate, endDate);

  const requestedStatus = String(data.status || LEAVE_STATUS.PENDING).trim().toUpperCase();
  const normalizedStatus = Object.values(LEAVE_STATUS).find((value) => String(value).toUpperCase() === requestedStatus);
  if (!normalizedStatus) {
    const error = new Error("Invalid leave status");
    error.statusCode = 400;
    throw error;
  }
  const leaveRequest = await LeaveRequest.create({
    employee: data.employee,
    leaveType: leaveTypeDoc._id,
    startDate,
    endDate,
    totalDays,
    reason: data.reason,
    status: normalizedStatus,
    notes: data.notes,
    createdBy,
  });

  return getLeaveRequestById(leaveRequest._id);
};

/* -----------------------------------------
   Get Leave Requests (with filters)
----------------------------------------- */

const getLeaveRequests = async ({
  page = 1,
  limit = 10,
  employee,
  leaveType,
  status,
  dateFrom,
  dateTo,
  search = "",
}) => {
  const filter = {};

  if (employee) {
    filter.employee = Array.isArray(employee) ? { $in: employee } : employee;
  }

  /* ✅ leaveType filter bhi flexible banao */
  if (leaveType) {
    // Agar ObjectId hai toh direct, warna resolve karo
    if (/^[a-fA-F0-9]{24}$/.test(leaveType)) {
      filter.leaveType = leaveType;
    } else {
      const leaveTypeDoc = await LeaveType.findOne({
        $or: [
          { code: { $regex: `^${leaveType}$`, $options: "i" } },
          { name: { $regex: `^${leaveType}$`, $options: "i" } },
        ],
      }).select("_id");

      if (leaveTypeDoc) {
        filter.leaveType = leaveTypeDoc._id;
      } else {
        // No match — return empty result
        filter.leaveType = null;
      }
    }
  }

  if (status) {
    filter.status = status;
  }

  if (dateFrom || dateTo) {
    filter.$and = [];

    if (dateFrom) {
      filter.$and.push({
        endDate: { $gte: getDateOnly(dateFrom) },
      });
    }

    if (dateTo) {
      filter.$and.push({
        startDate: { $lte: getDateOnly(dateTo) },
      });
    }
  }

  if (search) {
    const employees = await Employee.find({
      $or: [
        { employeeId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const searchedIds = employees.map((item) => String(item._id));
    if (Array.isArray(employee)) {
      const allowed = new Set(employee.map(String));
      filter.employee = { $in: searchedIds.filter((id) => allowed.has(id)) };
    } else {
      filter.employee = { $in: employees.map((item) => item._id) };
    }
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [leaveRequests, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate(
        "employee",
        "employeeId name email department designation status"
      )
      .populate(
        "leaveType",
        "name code totalDays isPaid isActive"
      )
      .populate("approvedBy", "username email role")
      .populate("rejectedBy", "username email role")
      .populate("createdBy", "username email role")
      .populate("updatedBy", "username email role")
      .sort({ startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    LeaveRequest.countDocuments(filter),
  ]);

  return {
    leaveRequests,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

/* -----------------------------------------
   Get By ID
----------------------------------------- */

const getLeaveRequestById = async (leaveRequestId) => {
  const leaveRequest = await LeaveRequest.findById(leaveRequestId)
    .populate(
      "employee",
      "employeeId name email mobile department designation status"
    )
    .populate(
      "leaveType",
      "name code description totalDays isPaid isActive"
    )
    .populate("approvedBy", "username email role")
    .populate("rejectedBy", "username email role")
    .populate("createdBy", "username email role")
    .populate("updatedBy", "username email role");

  if (!leaveRequest) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  return leaveRequest;
};

/* -----------------------------------------
   Update Leave Request
----------------------------------------- */

const updateLeaveRequest = async (leaveRequestId, data, updatedBy) => {
  const leaveRequest = await LeaveRequest.findById(leaveRequestId);

  if (!leaveRequest) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    [
      LEAVE_STATUS.APPROVED,
      LEAVE_STATUS.REJECTED,
      LEAVE_STATUS.CANCELLED,
    ].includes(leaveRequest.status)
  ) {
    const error = new Error("Processed leave request cannot be edited");
    error.statusCode = 400;
    throw error;
  }

  const employee = data.employee || leaveRequest.employee;

  await validateEmployee(employee);

  /* ✅ Leave type resolve karo agar bheja gaya hai */
  let leaveType = leaveRequest.leaveType;

  if (data.leaveType) {
    const leaveTypeDoc = await validateLeaveType(data.leaveType);
    leaveType = leaveTypeDoc._id;
  }

  const startDate = getDateOnly(data.startDate || leaveRequest.startDate);
  const endDate = getDateOnly(data.endDate || leaveRequest.endDate);

  if (endDate < startDate) {
    const error = new Error("End date cannot be before start date");
    error.statusCode = 400;
    throw error;
  }

  const overlapping = await checkDateOverlap({
    employee,
    startDate,
    endDate,
    excludeId: leaveRequestId,
  });

  if (overlapping) {
    const error = new Error(
      "Employee already has another leave request for this date range"
    );
    error.statusCode = 409;
    throw error;
  }

  leaveRequest.employee = employee;
  leaveRequest.leaveType = leaveType;
  leaveRequest.startDate = startDate;
  leaveRequest.endDate = endDate;
  leaveRequest.totalDays = calculateTotalDays(startDate, endDate);

  if (data.reason !== undefined) {
    leaveRequest.reason = data.reason;
  }


  if (data.notes !== undefined) {
    leaveRequest.notes = data.notes;
  }

  leaveRequest.updatedBy = updatedBy;

  await leaveRequest.save();

  return getLeaveRequestById(leaveRequest._id);
};

/* -----------------------------------------
   Approve / Reject / Cancel
----------------------------------------- */

const approveLeave = async (leaveRequestId, approvedBy) => {
  await validateUser(approvedBy);

  const leaveRequest = await LeaveRequest.findById(leaveRequestId);

  if (!leaveRequest) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
    const error = new Error("Only pending leave requests can be approved");
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status = LEAVE_STATUS.APPROVED;
  leaveRequest.approvedBy = approvedBy;
  leaveRequest.approvedAt = new Date();
  leaveRequest.rejectedBy = undefined;
  leaveRequest.rejectedAt = undefined;
  leaveRequest.rejectionReason = undefined;
  leaveRequest.updatedBy = approvedBy;

  await leaveRequest.save();

  return getLeaveRequestById(leaveRequest._id);
};

const rejectLeave = async (
  leaveRequestId,
  rejectedBy,
  rejectionReason
) => {
  await validateUser(rejectedBy);

  const leaveRequest = await LeaveRequest.findById(leaveRequestId);

  if (!leaveRequest) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
    const error = new Error("Only pending leave requests can be rejected");
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status = LEAVE_STATUS.REJECTED;
  leaveRequest.rejectedBy = rejectedBy;
  leaveRequest.rejectedAt = new Date();
  leaveRequest.rejectionReason = rejectionReason;
  leaveRequest.updatedBy = rejectedBy;

  await leaveRequest.save();

  return getLeaveRequestById(leaveRequest._id);
};

const cancelLeave = async (
  leaveRequestId,
  cancelledBy,
  cancellationReason
) => {
  await validateUser(cancelledBy);

  const leaveRequest = await LeaveRequest.findById(leaveRequestId);

  if (!leaveRequest) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    [LEAVE_STATUS.REJECTED, LEAVE_STATUS.CANCELLED].includes(
      leaveRequest.status
    )
  ) {
    const error = new Error("This leave request cannot be cancelled");
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status = LEAVE_STATUS.CANCELLED;
  leaveRequest.cancelledAt = new Date();
  leaveRequest.cancellationReason = cancellationReason;
  leaveRequest.updatedBy = cancelledBy;

  await leaveRequest.save();

  return getLeaveRequestById(leaveRequest._id);
};

/* -----------------------------------------
   Employee Leave Requests
----------------------------------------- */

const getEmployeeLeaveRequests = async (employeeId, options = {}) => {
  await validateEmployee(employeeId);

  const filter = { employee: employeeId };

  if (options.status) {
    filter.status = options.status;
  }

  if (options.dateFrom || options.dateTo) {
    filter.$and = [];

    if (options.dateFrom) {
      filter.$and.push({
        endDate: { $gte: getDateOnly(options.dateFrom) },
      });
    }

    if (options.dateTo) {
      filter.$and.push({
        startDate: { $lte: getDateOnly(options.dateTo) },
      });
    }
  }

  return LeaveRequest.find(filter)
    .populate("leaveType", "name code totalDays isPaid")
    .populate("approvedBy", "username email role")
    .populate("rejectedBy", "username email role")
    .sort({ startDate: -1 })
    .lean();
};

/* -----------------------------------------
   Leave Stats
----------------------------------------- */

const getLeaveStats = async ({ employee, dateFrom, dateTo } = {}) => {
  const match = {};

  if (employee) {
    match.employee = employee;
  }

  if (dateFrom || dateTo) {
    match.$and = [];

    if (dateFrom) {
      match.$and.push({
        endDate: { $gte: getDateOnly(dateFrom) },
      });
    }

    if (dateTo) {
      match.$and.push({
        startDate: { $lte: getDateOnly(dateTo) },
      });
    }
  }

  const [statusStats, typeStats, totalDaysStats] = await Promise.all([
    LeaveRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    LeaveRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
      { $sort: { totalDays: -1 } },
    ]),

    LeaveRequest.aggregate([
      {
        $match: {
          ...match,
          status: LEAVE_STATUS.APPROVED,
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: "$totalDays" },
        },
      },
    ]),
  ]);

  return {
    byStatus: statusStats,
    byLeaveType: typeStats,
    approvedLeaveDays: totalDaysStats[0]?.totalDays || 0,
  };
};

/* -----------------------------------------
   Pending Requests
----------------------------------------- */

const getPendingRequests = async (limit = 50) => {
  return LeaveRequest.find({
    status: LEAVE_STATUS.PENDING,
  })
    .populate(
      "employee",
      "employeeId name email department designation"
    )
    .populate("leaveType", "name code totalDays isPaid")
    .sort({ createdAt: 1 })
    .limit(Number(limit))
    .lean();
};

/* -----------------------------------------
   Delete Leave Request
----------------------------------------- */

const deleteLeaveRequest = async (leaveRequestId, updatedBy) => {
  const leaveRequest = await LeaveRequest.findById(leaveRequestId);

  if (!leaveRequest) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  if (leaveRequest.status === LEAVE_STATUS.APPROVED) {
    const error = new Error("Approved leave request cannot be deleted");
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status = LEAVE_STATUS.CANCELLED;
  leaveRequest.cancelledAt = new Date();
  leaveRequest.cancellationReason = "Leave request deactivated";
  leaveRequest.updatedBy = updatedBy;

  await leaveRequest.save();

  return { message: "Leave request cancelled successfully" };
};

const getLeaveBalanceForEmployee = async (employeeId, year = new Date().getFullYear()) => {
  await validateEmployee(employeeId);
  const numericYear = Number(year);
  if (!Number.isInteger(numericYear) || numericYear < 2000 || numericYear > 2100) {
    const error = new Error("Invalid year"); error.statusCode = 400; throw error;
  }
  const from = new Date(numericYear, 0, 1);
  const to = new Date(numericYear, 11, 31, 23, 59, 59, 999);
  const [types, usage] = await Promise.all([
    LeaveType.find({ isActive: true }).select("_id name code totalDays isPaid").lean(),
    LeaveRequest.aggregate([
      { $match: { employee: new mongoose.Types.ObjectId(employeeId), startDate: { $lte: to }, endDate: { $gte: from }, status: { $in: [LEAVE_STATUS.APPROVED, LEAVE_STATUS.PENDING] } } },
      { $group: { _id: { leaveType: "$leaveType", status: "$status" }, days: { $sum: "$totalDays" } } },
    ]),
  ]);
  const balances = types.map((type) => {
    const approved = usage.find((item) => String(item._id.leaveType) === String(type._id) && item._id.status === LEAVE_STATUS.APPROVED)?.days || 0;
    const pending = usage.find((item) => String(item._id.leaveType) === String(type._id) && item._id.status === LEAVE_STATUS.PENDING)?.days || 0;
    return { leaveType: type, allocatedDays: type.totalDays, usedDays: approved, pendingDays: pending, remainingDays: Math.max(0, type.totalDays - approved) };
  });
  return { year: numericYear, employee: employeeId, balances };
};

const getMyLeaveRequests = async (userId, options = {}) => {
  // Resolve logged-in User ID to Employee ID
  const employee = await Employee.findOne({
    user: userId,
  })
    .select("_id")
    .lean();

  if (!employee) {
    const error = new Error("Employee profile not found");
    error.statusCode = 404;
    throw error;
  }

  const pageNumber = Math.max(Number(options.page) || 1, 1);
  const limitNumber = Math.max(Number(options.limit) || 10, 1);

  const filter = {
    employee: employee._id,
  };

  // Optional year filter
  if (options.year) {
    const year = Number(options.year);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      const error = new Error("Invalid year");
      error.statusCode = 400;
      throw error;
    }

    filter.startDate = {
      $lte: new Date(year, 11, 31, 23, 59, 59, 999),
    };

    filter.endDate = {
      $gte: new Date(year, 0, 1),
    };
  }

  if (options.status) {
    filter.status = options.status;
  }

  if (options.leaveType) {
    filter.leaveType = options.leaveType;
  }

  if (options.startDate || options.endDate) {
    filter.$and = [];

    if (options.startDate) {
      filter.$and.push({
        endDate: {
          $gte: getDateOnly(options.startDate),
        },
      });
    }

    if (options.endDate) {
      filter.$and.push({
        startDate: {
          $lte: getDateOnly(options.endDate),
        },
      });
    }
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [leaveRequests, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate("leaveType", "name code totalDays isPaid")
      .populate("approvedBy", "username email role")
      .populate("rejectedBy", "username email role")
      .sort({ startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    LeaveRequest.countDocuments(filter),
  ]);

  return {
    leaveRequests,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};
module.exports = {
  getActiveLeaveTypes,
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,

  // Controller compatibility
  approveLeaveRequest: approveLeave,
  rejectLeaveRequest: rejectLeave,
  cancelLeaveRequest: cancelLeave,
  getMyLeaveRequests,
  getLeaveBalanceForEmployee,

  approveLeave,
  rejectLeave,
  cancelLeave,
  getEmployeeLeaveRequests,
  getLeaveStats,
  getPendingRequests,
  deleteLeaveRequest,
  calculateTotalDays,
};