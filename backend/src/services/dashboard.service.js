const User = require("../models/User");
const Employee = require("../models/Employee");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");
const Task = require("../models/Task");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");

const {
  LEAD_STATUS,
  QUOTATION_STATUS,
  INVOICE_STATUS,
  TASK_STATUS,
  ATTENDANCE_STATUS,
  LEAVE_STATUS,
} = require("../config/constants");

const getDateRange = (from, to) => {
  const start = from
    ? new Date(from)
    : new Date(
        new Date().setHours(0, 0, 0, 0)
      );

  const end = to
    ? new Date(to)
    : new Date();

  if (Number.isNaN(start.getTime())) {
    const error = new Error(
      "Invalid from date"
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(end.getTime())) {
    const error = new Error(
      "Invalid to date"
    );
    error.statusCode = 400;
    throw error;
  }

  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

const getDashboardStats = async ({
  from,
  to,
} = {}) => {
  const { start, end } =
    getDateRange(from, to);

  const dateFilter = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  const [
    totalUsers,
    activeEmployees,
    totalLeads,
    newLeads,
    totalCustomers,
    newCustomers,
    totalQuotations,
    quotationsInPeriod,
    totalInvoices,
    invoicesInPeriod,
    pendingTasks,
    overdueTasks,
    pendingLeaves,
    todayAttendance,
  ] = await Promise.all([
    User.countDocuments({
      status: "Active",
    }),

    Employee.countDocuments({
      status: "Active",
    }),

    Lead.countDocuments(),

    Lead.countDocuments(dateFilter),

    Customer.countDocuments(),

    Customer.countDocuments(dateFilter),

    Quotation.countDocuments(),

    Quotation.countDocuments(
      dateFilter
    ),

    Invoice.countDocuments(),

    Invoice.countDocuments(
      dateFilter
    ),

    Task.countDocuments({
      status: {
        $nin: [
          TASK_STATUS.COMPLETED,
          TASK_STATUS.CANCELLED,
        ],
      },
    }),

    Task.countDocuments({
      dueDate: {
        $lt: new Date(),
      },
      status: {
        $nin: [
          TASK_STATUS.COMPLETED,
          TASK_STATUS.CANCELLED,
        ],
      },
    }),

    LeaveRequest.countDocuments({
      status: LEAVE_STATUS.PENDING,
    }),

    Attendance.countDocuments({
      attendanceDate: {
        $gte: new Date(
          new Date().setHours(0, 0, 0, 0)
        ),
        $lte: new Date(
          new Date().setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    }),
  ]);

  return {
    period: {
      from: start,
      to: end,
    },

    users: {
      total: totalUsers,
      activeEmployees,
    },

    leads: {
      total: totalLeads,
      new: newLeads,
    },

    customers: {
      total: totalCustomers,
      new: newCustomers,
    },

    quotations: {
      total: totalQuotations,
      inPeriod: quotationsInPeriod,
    },

    invoices: {
      total: totalInvoices,
      inPeriod: invoicesInPeriod,
    },

    tasks: {
      pending: pendingTasks,
      overdue: overdueTasks,
    },

    leaves: {
      pending: pendingLeaves,
    },

    attendance: {
      today: todayAttendance,
    },
  };
};

const getLeadStats = async ({
  from,
  to,
} = {}) => {
  const { start, end } =
    getDateRange(from, to);

  const dateFilter = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  const [
    statusStats,
    sourceStats,
    priorityStats,
  ] = await Promise.all([
    Lead.aggregate([
      {
        $match: dateFilter,
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

    Lead.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: "$leadSource",
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

    Lead.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: "$priority",
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
  ]);

  return {
    status: statusStats,
    source: sourceStats,
    priority: priorityStats,
  };
};

const getQuotationStats = async ({
  from,
  to,
} = {}) => {
  const { start, end } =
    getDateRange(from, to);

  const stats =
    await Quotation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
          totalAmount: {
            $sum: "$grandTotal",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  return stats;
};

const getInvoiceStats = async ({
  from,
  to,
} = {}) => {
  const { start, end } =
    getDateRange(from, to);

  const stats =
    await Invoice.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
          totalAmount: {
            $sum: "$grandTotal",
          },
          taxableAmount: {
            $sum: "$taxableAmount",
          },
          taxAmount: {
            $sum: "$totalTax",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  return stats;
};

const getTaskStats = async ({
  from,
  to,
} = {}) => {
  const { start, end } =
    getDateRange(from, to);

  const [
    statusStats,
    priorityStats,
    overdue,
  ] = await Promise.all([
    Task.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
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

    Task.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$priority",
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

    Task.countDocuments({
      dueDate: {
        $lt: new Date(),
      },
      status: {
        $nin: [
          TASK_STATUS.COMPLETED,
          TASK_STATUS.CANCELLED,
        ],
      },
    }),
  ]);

  return {
    status: statusStats,
    priority: priorityStats,
    overdue,
  };
};

const getAttendanceStats = async ({
  from,
  to,
} = {}) => {
  const { start, end } =
    getDateRange(from, to);

  const stats =
    await Attendance.aggregate([
      {
        $match: {
          attendanceDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
          totalHours: {
            $sum: {
              $ifNull: [
                "$totalHours",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  return stats;
};

const getLeaveStats = async ({
  from,
  to,
} = {}) => {
  const { start, end } =
    getDateRange(from, to);

  const stats =
    await LeaveRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$status",
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
          count: -1,
        },
      },
    ]);

  return stats;
};

const getRecentLeads = async (
  limit = 10
) => {
  return Lead.find()
    .populate(
      "assignedTo",
      "employeeId name email"
    )
    .populate(
      "createdBy",
      "username email role"
    )
    .sort({
      createdAt: -1,
    })
    .limit(Number(limit))
    .lean();
};

const getRecentQuotations = async (
  limit = 10
) => {
  return Quotation.find()
    .populate(
      "lead",
      "leadId name mobile"
    )
    .populate(
      "customer",
      "customerId name companyName mobile"
    )
    .sort({
      createdAt: -1,
    })
    .limit(Number(limit))
    .lean();
};

const getRecentInvoices = async (
  limit = 10
) => {
  return Invoice.find()
    .populate(
      "customer",
      "customerId name companyName mobile"
    )
    .populate(
      "quotation",
      "quotationNumber"
    )
    .sort({
      createdAt: -1,
    })
    .limit(Number(limit))
    .lean();
};

const getUpcomingTasks = async (
  limit = 10
) => {
  return Task.find({
    status: {
      $nin: [
        TASK_STATUS.COMPLETED,
        TASK_STATUS.CANCELLED,
      ],
    },
  })
    .populate(
      "assignedTo",
      "employeeId name email"
    )
    .populate(
      "lead",
      "leadId name mobile"
    )
    .populate(
      "customer",
      "customerId name companyName mobile"
    )
    .sort({
      dueDate: 1,
    })
    .limit(Number(limit))
    .lean();
};

const getDashboard = async (
  options = {}
) => {
  const [
    stats,
    leadStats,
    quotationStats,
    invoiceStats,
    taskStats,
    attendanceStats,
    leaveStats,
    recentLeads,
    recentQuotations,
    recentInvoices,
    upcomingTasks,
  ] = await Promise.all([
    getDashboardStats(options),
    getLeadStats(options),
    getQuotationStats(options),
    getInvoiceStats(options),
    getTaskStats(options),
    getAttendanceStats(options),
    getLeaveStats(options),
    getRecentLeads(),
    getRecentQuotations(),
    getRecentInvoices(),
    getUpcomingTasks(),
  ]);

  return {
    stats,
    analytics: {
      leads: leadStats,
      quotations: quotationStats,
      invoices: invoiceStats,
      tasks: taskStats,
      attendance: attendanceStats,
      leaves: leaveStats,
    },
    recent: {
      leads: recentLeads,
      quotations: recentQuotations,
      invoices: recentInvoices,
      tasks: upcomingTasks,
    },
  };
};

module.exports = {
  getDashboardStats,
  getLeadStats,
  getQuotationStats,
  getInvoiceStats,
  getTaskStats,
  getAttendanceStats,
  getLeaveStats,
  getRecentLeads,
  getRecentQuotations,
  getRecentInvoices,
  getUpcomingTasks,
  getDashboard,
};