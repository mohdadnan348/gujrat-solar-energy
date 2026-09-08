const LeaveRequest = require("../models/LeaveRequest");
const LeaveType = require("../models/LeaveType");
const Employee = require("../models/Employee");
const User = require("../models/User");

const {
  LEAVE_STATUS,
} = require("../config/constants");

const getDateOnly = (date) => {
  const value = new Date(date);

  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate()
  );
};

const calculateTotalDays = (
  startDate,
  endDate
) => {
  const start = getDateOnly(startDate);
  const end = getDateOnly(endDate);

  if (end < start) {
    return 0;
  }

  const difference =
    end.getTime() - start.getTime();

  return (
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
};

const validateEmployee = async (
  employeeId
) => {
  const employee =
    await Employee.findById(employeeId);

  if (!employee) {
    const error = new Error(
      "Employee not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

const validateLeaveType = async (
  leaveTypeId
) => {
  const leaveType =
    await LeaveType.findById(
      leaveTypeId
    );

  if (!leaveType) {
    const error = new Error(
      "Leave type not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (!leaveType.isActive) {
    const error = new Error(
      "Leave type is inactive"
    );
    error.statusCode = 400;
    throw error;
  }

  return leaveType;
};

const validateUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error(
      "User not found"
    );
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
      $nin: [
        LEAVE_STATUS.REJECTED,
        LEAVE_STATUS.CANCELLED,
      ],
    },
    startDate: {
      $lte: getDateOnly(endDate),
    },
    endDate: {
      $gte: getDateOnly(startDate),
    },
  };

  if (excludeId) {
    filter._id = {
      $ne: excludeId,
    };
  }

  return LeaveRequest.exists(filter);
};

const createLeaveRequest = async (
  data,
  createdBy
) => {
  await validateEmployee(
    data.employee
  );

  await validateLeaveType(
    data.leaveType
  );

  if (!data.startDate || !data.endDate) {
    const error = new Error(
      "Start date and end date are required"
    );
    error.statusCode = 400;
    throw error;
  }

  const startDate = getDateOnly(
    data.startDate
  );

  const endDate = getDateOnly(
    data.endDate
  );

  if (endDate < startDate) {
    const error = new Error(
      "End date cannot be before start date"
    );
    error.statusCode = 400;
    throw error;
  }

  const overlapping =
    await checkDateOverlap({
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

  const totalDays = calculateTotalDays(
    startDate,
    endDate
  );

  const leaveRequest =
    await LeaveRequest.create({
      employee: data.employee,
      leaveType: data.leaveType,
      startDate,
      endDate,
      totalDays,
      reason: data.reason,
      status:
        data.status ||
        LEAVE_STATUS.PENDING,
      notes: data.notes,
      createdBy,
    });

  return getLeaveRequestById(
    leaveRequest._id
  );
};

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
    filter.employee = employee;
  }

  if (leaveType) {
    filter.leaveType = leaveType;
  }

  if (status) {
    filter.status = status;
  }

  if (dateFrom || dateTo) {
    filter.$and = [];

    if (dateFrom) {
      filter.$and.push({
        endDate: {
          $gte: getDateOnly(dateFrom),
        },
      });
    }

    if (dateTo) {
      filter.$and.push({
        startDate: {
          $lte: getDateOnly(dateTo),
        },
      });
    }
  }

  if (search) {
    const employees =
      await Employee.find({
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
    (pageNumber - 1) *
    limitNumber;

  const [
    leaveRequests,
    total,
  ] = await Promise.all([
    LeaveRequest.find(filter)
      .populate(
        "employee",
        "employeeId name email department designation status"
      )
      .populate(
        "leaveType",
        "name code totalDays isPaid isActive"
      )
      .populate(
        "approvedBy",
        "username email role"
      )
      .populate(
        "rejectedBy",
        "username email role"
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
        startDate: -1,
        createdAt: -1,
      })
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
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

const getLeaveRequestById = async (
  leaveRequestId
) => {
  const leaveRequest =
    await LeaveRequest.findById(
      leaveRequestId
    )
      .populate(
        "employee",
        "employeeId name email mobile department designation status"
      )
      .populate(
        "leaveType",
        "name code description totalDays isPaid isActive"
      )
      .populate(
        "approvedBy",
        "username email role"
      )
      .populate(
        "rejectedBy",
        "username email role"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      );

  if (!leaveRequest) {
    const error = new Error(
      "Leave request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return leaveRequest;
};

const updateLeaveRequest = async (
  leaveRequestId,
  data,
  updatedBy
) => {
  const leaveRequest =
    await LeaveRequest.findById(
      leaveRequestId
    );

  if (!leaveRequest) {
    const error = new Error(
      "Leave request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    [
      LEAVE_STATUS.APPROVED,
      LEAVE_STATUS.REJECTED,
      LEAVE_STATUS.CANCELLED,
    ].includes(
      leaveRequest.status
    )
  ) {
    const error = new Error(
      "Processed leave request cannot be edited"
    );
    error.statusCode = 400;
    throw error;
  }

  const employee =
    data.employee ||
    leaveRequest.employee;

  const leaveType =
    data.leaveType ||
    leaveRequest.leaveType;

  await validateEmployee(employee);
  await validateLeaveType(leaveType);

  const startDate = getDateOnly(
    data.startDate ||
      leaveRequest.startDate
  );

  const endDate = getDateOnly(
    data.endDate ||
      leaveRequest.endDate
  );

  if (endDate < startDate) {
    const error = new Error(
      "End date cannot be before start date"
    );
    error.statusCode = 400;
    throw error;
  }

  const overlapping =
    await checkDateOverlap({
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

  leaveRequest.employee =
    employee;

  leaveRequest.leaveType =
    leaveType;

  leaveRequest.startDate =
    startDate;

  leaveRequest.endDate =
    endDate;

  leaveRequest.totalDays =
    calculateTotalDays(
      startDate,
      endDate
    );

  if (data.reason !== undefined) {
    leaveRequest.reason =
      data.reason;
  }

  if (data.status !== undefined) {
    if (
      !Object.values(
        LEAVE_STATUS
      ).includes(data.status)
    ) {
      const error = new Error(
        "Invalid leave status"
      );
      error.statusCode = 400;
      throw error;
    }

    leaveRequest.status =
      data.status;
  }

  if (data.notes !== undefined) {
    leaveRequest.notes =
      data.notes;
  }

  leaveRequest.updatedBy =
    updatedBy;

  await leaveRequest.save();

  return getLeaveRequestById(
    leaveRequest._id
  );
};

const approveLeave = async (
  leaveRequestId,
  approvedBy
) => {
  await validateUser(approvedBy);

  const leaveRequest =
    await LeaveRequest.findById(
      leaveRequestId
    );

  if (!leaveRequest) {
    const error = new Error(
      "Leave request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    leaveRequest.status !==
    LEAVE_STATUS.PENDING
  ) {
    const error = new Error(
      "Only pending leave requests can be approved"
    );
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status =
    LEAVE_STATUS.APPROVED;

  leaveRequest.approvedBy =
    approvedBy;

  leaveRequest.approvedAt =
    new Date();

  leaveRequest.rejectedBy =
    undefined;

  leaveRequest.rejectedAt =
    undefined;

  leaveRequest.rejectionReason =
    undefined;

  leaveRequest.updatedBy =
    approvedBy;

  await leaveRequest.save();

  return getLeaveRequestById(
    leaveRequest._id
  );
};

const rejectLeave = async (
  leaveRequestId,
  rejectedBy,
  rejectionReason
) => {
  await validateUser(rejectedBy);

  const leaveRequest =
    await LeaveRequest.findById(
      leaveRequestId
    );

  if (!leaveRequest) {
    const error = new Error(
      "Leave request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    leaveRequest.status !==
    LEAVE_STATUS.PENDING
  ) {
    const error = new Error(
      "Only pending leave requests can be rejected"
    );
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status =
    LEAVE_STATUS.REJECTED;

  leaveRequest.rejectedBy =
    rejectedBy;

  leaveRequest.rejectedAt =
    new Date();

  leaveRequest.rejectionReason =
    rejectionReason;

  leaveRequest.updatedBy =
    rejectedBy;

  await leaveRequest.save();

  return getLeaveRequestById(
    leaveRequest._id
  );
};

const cancelLeave = async (
  leaveRequestId,
  cancelledBy,
  cancellationReason
) => {
  await validateUser(cancelledBy);

  const leaveRequest =
    await LeaveRequest.findById(
      leaveRequestId
    );

  if (!leaveRequest) {
    const error = new Error(
      "Leave request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    [
      LEAVE_STATUS.REJECTED,
      LEAVE_STATUS.CANCELLED,
    ].includes(
      leaveRequest.status
    )
  ) {
    const error = new Error(
      "This leave request cannot be cancelled"
    );
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status =
    LEAVE_STATUS.CANCELLED;

  leaveRequest.cancelledAt =
    new Date();

  leaveRequest.cancellationReason =
    cancellationReason;

  leaveRequest.updatedBy =
    cancelledBy;

  await leaveRequest.save();

  return getLeaveRequestById(
    leaveRequest._id
  );
};

const getEmployeeLeaveRequests =
  async (
    employeeId,
    options = {}
  ) => {
    await validateEmployee(
      employeeId
    );

    const filter = {
      employee: employeeId,
    };

    if (options.status) {
      filter.status =
        options.status;
    }

    if (
      options.dateFrom ||
      options.dateTo
    ) {
      filter.$and = [];

      if (options.dateFrom) {
        filter.$and.push({
          endDate: {
            $gte: getDateOnly(
              options.dateFrom
            ),
          },
        });
      }

      if (options.dateTo) {
        filter.$and.push({
          startDate: {
            $lte: getDateOnly(
              options.dateTo
            ),
          },
        });
      }
    }

    return LeaveRequest.find(
      filter
    )
      .populate(
        "leaveType",
        "name code totalDays isPaid"
      )
      .populate(
        "approvedBy",
        "username email role"
      )
      .populate(
        "rejectedBy",
        "username email role"
      )
      .sort({
        startDate: -1,
      })
      .lean();
  };

const getLeaveStats = async ({
  employee,
  dateFrom,
  dateTo,
} = {}) => {
  const match = {};

  if (employee) {
    match.employee =
      employee;
  }

  if (dateFrom || dateTo) {
    match.$and = [];

    if (dateFrom) {
      match.$and.push({
        endDate: {
          $gte: getDateOnly(
            dateFrom
          ),
        },
      });
    }

    if (dateTo) {
      match.$and.push({
        startDate: {
          $lte: getDateOnly(
            dateTo
          ),
        },
      });
    }
  }

  const [
    statusStats,
    typeStats,
    totalDaysStats,
  ] = await Promise.all([
    LeaveRequest.aggregate([
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

    LeaveRequest.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$leaveType",
          count: {
            $sum: 1,
          },
          totalDays: {
            $sum: "$totalDays",
          },
        },
      },
      {
        $sort: {
          totalDays: -1,
        },
      },
    ]),

    LeaveRequest.aggregate([
      {
        $match: {
          ...match,
          status:
            LEAVE_STATUS.APPROVED,
        },
      },
      {
        $group: {
          _id: null,
          totalDays: {
            $sum: "$totalDays",
          },
        },
      },
    ]),
  ]);

  return {
    byStatus: statusStats,
    byLeaveType: typeStats,
    approvedLeaveDays:
      totalDaysStats[0]?.totalDays ||
      0,
  };
};

const getPendingRequests = async (
  limit = 50
) => {
  return LeaveRequest.find({
    status: LEAVE_STATUS.PENDING,
  })
    .populate(
      "employee",
      "employeeId name email department designation"
    )
    .populate(
      "leaveType",
      "name code totalDays isPaid"
    )
    .sort({
      createdAt: 1,
    })
    .limit(Number(limit))
    .lean();
};

const deleteLeaveRequest = async (
  leaveRequestId,
  updatedBy
) => {
  const leaveRequest =
    await LeaveRequest.findById(
      leaveRequestId
    );

  if (!leaveRequest) {
    const error = new Error(
      "Leave request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    leaveRequest.status ===
    LEAVE_STATUS.APPROVED
  ) {
    const error = new Error(
      "Approved leave request cannot be deleted"
    );
    error.statusCode = 400;
    throw error;
  }

  leaveRequest.status =
    LEAVE_STATUS.CANCELLED;

  leaveRequest.cancelledAt =
    new Date();

  leaveRequest.cancellationReason =
    "Leave request deactivated";

  leaveRequest.updatedBy =
    updatedBy;

  await leaveRequest.save();

  return {
    message:
      "Leave request cancelled successfully",
  };
};

module.exports = {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getEmployeeLeaveRequests,
  getLeaveStats,
  getPendingRequests,
  deleteLeaveRequest,
  calculateTotalDays,
};