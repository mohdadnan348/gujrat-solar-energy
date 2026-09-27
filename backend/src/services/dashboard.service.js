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
  TASK_STATUS,
  LEAVE_STATUS,
} = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Date Range
|--------------------------------------------------------------------------
*/

const getDateRange = (from, to) => {
  const start = from
    ? new Date(from)
    : new Date(new Date().setHours(0, 0, 0, 0));

  const end = to ? new Date(to) : new Date();

  if (Number.isNaN(start.getTime())) {
    const error = new Error("Invalid from date");
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(end.getTime())) {
    const error = new Error("Invalid to date");
    error.statusCode = 400;
    throw error;
  }

  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

/*
|--------------------------------------------------------------------------
| Employee Scope
|--------------------------------------------------------------------------
|
| User._id:
|   req.user.userId
|
| Lead:
|   assignedTo -> Employee._id
|
| Task:
|   assignedTo -> User._id
|
| Customer:
|   createdBy -> User._id
|
| Quotation:
|   createdBy -> User._id
|
| Invoice:
|   createdBy -> User._id
|
| Attendance:
|   employee -> User._id
|
| Leave:
|   employee -> User._id
|
|--------------------------------------------------------------------------
*/

const getEmployeeScope = async (userId) => {
  if (!userId) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  const employee = await Employee.findOne({
    user: userId,
  })
    .select("_id employeeId name email status")
    .lean();

  if (!employee) {
    const error = new Error("Employee profile not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId,
    employeeId: employee._id,
    employee,
  };
};

/*
|--------------------------------------------------------------------------
| Dashboard Stats
|--------------------------------------------------------------------------
*/

const getDashboardStats = async ({
  from,
  to,
  userId = null,
  role = null,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const dateFilter = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  const isEmployee = role === "EMPLOYEE";

  let employeeScope = null;

  if (isEmployee) {
    employeeScope = await getEmployeeScope(userId);
  }

  const leadFilter = isEmployee
    ? {
        assignedTo: employeeScope.employeeId,
      }
    : {};

  const customerFilter = isEmployee
    ? {
        createdBy: employeeScope.userId,
      }
    : {};

  const quotationFilter = isEmployee
    ? {
        createdBy: employeeScope.userId,
      }
    : {};

  const invoiceFilter = isEmployee
    ? {
        createdBy: employeeScope.userId,
      }
    : {};

  /*
   * IMPORTANT:
   * Task.assignedTo references User, not Employee.
   */
  const taskFilter = isEmployee
    ? {
        assignedTo: employeeScope.userId,
      }
    : {};

  const attendanceFilter = isEmployee
    ? {
        employee: employeeScope.userId,
      }
    : {};

  const leaveFilter = isEmployee
    ? {
        employee: employeeScope.userId,
      }
    : {};

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
    isEmployee
      ? User.countDocuments({
          _id: employeeScope.userId,
          status: "Active",
        })
      : User.countDocuments({
          status: "Active",
        }),

    isEmployee
      ? Employee.countDocuments({
          _id: employeeScope.employeeId,
          status: "Active",
        })
      : Employee.countDocuments({
          status: "Active",
        }),

    Lead.countDocuments(leadFilter),

    Lead.countDocuments({
      ...leadFilter,
      ...dateFilter,
    }),

    Customer.countDocuments(customerFilter),

    Customer.countDocuments({
      ...customerFilter,
      ...dateFilter,
    }),

    Quotation.countDocuments(quotationFilter),

    Quotation.countDocuments({
      ...quotationFilter,
      ...dateFilter,
    }),

    Invoice.countDocuments(invoiceFilter),

    Invoice.countDocuments({
      ...invoiceFilter,
      ...dateFilter,
    }),

    Task.countDocuments({
      ...taskFilter,
      status: {
        $nin: [
          TASK_STATUS.COMPLETED,
          TASK_STATUS.CANCELLED,
        ],
      },
    }),

    Task.countDocuments({
      ...taskFilter,
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
      ...leaveFilter,
      status: LEAVE_STATUS.PENDING,
    }),

    Attendance.countDocuments({
      ...attendanceFilter,
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

/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/

const getDashboardSummary = async ({
  startDate,
  endDate,
  userId = null,
  role = null,
} = {}) => {
  return getDashboardStats({
    from: startDate,
    to: endDate,
    userId,
    role,
  });
};

/*
|--------------------------------------------------------------------------
| Lead Stats
|--------------------------------------------------------------------------
*/

const getLeadStats = async ({
  from,
  to,
  userId = null,
  role = null,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const isEmployee = role === "EMPLOYEE";

  const leadFilter = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (isEmployee) {
    const employeeScope =
      await getEmployeeScope(userId);

    leadFilter.assignedTo =
      employeeScope.employeeId;
  }

  const [
    statusStats,
    sourceStats,
    priorityStats,
  ] = await Promise.all([
    Lead.aggregate([
      {
        $match: leadFilter,
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
        $match: leadFilter,
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
        $match: leadFilter,
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

const getLeadStatusSummary = async ({
  startDate,
  endDate,
  userId = null,
  role = null,
} = {}) => {
  const stats = await getLeadStats({
    from: startDate,
    to: endDate,
    userId,
    role,
  });

  return stats.status;
};

/*
|--------------------------------------------------------------------------
| Quotation Stats
|--------------------------------------------------------------------------
*/

const getQuotationStats = async ({
  from,
  to,
  userId = null,
  role = null,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const match = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (role === "EMPLOYEE") {
    match.createdBy = userId;
  }

  return Quotation.aggregate([
    {
      $match: match,
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
};

const getQuotationSummary = async ({
  startDate,
  endDate,
  userId = null,
  role = null,
} = {}) => {
  return getQuotationStats({
    from: startDate,
    to: endDate,
    userId,
    role,
  });
};

/*
|--------------------------------------------------------------------------
| Invoice Stats
|--------------------------------------------------------------------------
*/

const getInvoiceStats = async ({
  from,
  to,
  userId = null,
  role = null,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const match = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (role === "EMPLOYEE") {
    match.createdBy = userId;
  }

  return Invoice.aggregate([
    {
      $match: match,
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
};

const getInvoiceSummary = async ({
  startDate,
  endDate,
  userId = null,
  role = null,
} = {}) => {
  return getInvoiceStats({
    from: startDate,
    to: endDate,
    userId,
    role,
  });
};

/*
|--------------------------------------------------------------------------
| Task Stats
|--------------------------------------------------------------------------
*/

const getTaskStats = async ({
  from,
  to,
  userId = null,
  role = null,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const taskScope = {};

  /*
   * Task.assignedTo -> User._id
   */
  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    taskScope.assignedTo =
      employeeScope.userId;
  }

  const [
    statusStats,
    priorityStats,
    overdue,
  ] = await Promise.all([
    Task.aggregate([
      {
        $match: {
          ...taskScope,
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
          ...taskScope,
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
      ...taskScope,
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

const getTaskSummary = async ({
  startDate,
  endDate,
  userId = null,
  role = null,
} = {}) => {
  return getTaskStats({
    from: startDate,
    to: endDate,
    userId,
    role,
  });
};

/*
|--------------------------------------------------------------------------
| Employee Performance
|--------------------------------------------------------------------------
|
| Employee performance is intentionally restricted at route level.
| This method remains available for Admin / Manager / HR.
|
| Lead:
|   Employee._id
|
| Task:
|   User._id
|
|--------------------------------------------------------------------------
*/

const getEmployeePerformance = async ({
  startDate,
  endDate,
} = {}) => {
  const { start, end } = getDateRange(
    startDate,
    endDate
  );

  const employees = await Employee.find({
    status: "Active",
  })
    .select(
      "_id employeeId name email user"
    )
    .lean();

  const performance = await Promise.all(
    employees.map(async (employee) => {
      const [
        assignedLeads,
        completedTasks,
        pendingTasks,
      ] = await Promise.all([
        Lead.countDocuments({
          assignedTo: employee._id,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }),

        Task.countDocuments({
          assignedTo: employee.user,
          status: TASK_STATUS.COMPLETED,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }),

        Task.countDocuments({
          assignedTo: employee.user,
          status: {
            $nin: [
              TASK_STATUS.COMPLETED,
              TASK_STATUS.CANCELLED,
            ],
          },
          createdAt: {
            $gte: start,
            $lte: end,
          },
        }),
      ]);

      return {
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        leads: assignedLeads,
        completedTasks,
        pendingTasks,
      };
    })
  );

  return performance;
};

/*
|--------------------------------------------------------------------------
| Attendance Stats
|--------------------------------------------------------------------------
*/

const getAttendanceStats = async ({
  from,
  to,
  userId = null,
  role = null,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const match = {
    attendanceDate: {
      $gte: start,
      $lte: end,
    },
  };

  if (role === "EMPLOYEE") {
    match.employee = userId;
  }

  return Attendance.aggregate([
    {
      $match: match,
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
};

/*
|--------------------------------------------------------------------------
| Leave Stats
|--------------------------------------------------------------------------
*/

const getLeaveStats = async ({
  from,
  to,
  userId = null,
  role = null,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const match = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (role === "EMPLOYEE") {
    match.employee = userId;
  }

  return LeaveRequest.aggregate([
    {
      $match: match,
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
};

/*
|--------------------------------------------------------------------------
| Recent Leads
|--------------------------------------------------------------------------
*/

const getRecentLeads = async (
  limit = 10,
  userId = null,
  role = null
) => {
  const filter = {};

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    filter.assignedTo =
      employeeScope.employeeId;
  }

  return Lead.find(filter)
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

/*
|--------------------------------------------------------------------------
| Recent Quotations
|--------------------------------------------------------------------------
*/

const getRecentQuotations = async (
  limit = 10,
  userId = null,
  role = null
) => {
  const filter = {};

  if (role === "EMPLOYEE") {
    filter.createdBy = userId;
  }

  return Quotation.find(filter)
    .populate(
      "lead",
      "leadId customerName mobile"
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

/*
|--------------------------------------------------------------------------
| Recent Invoices
|--------------------------------------------------------------------------
*/

const getRecentInvoices = async (
  limit = 10,
  userId = null,
  role = null
) => {
  const filter = {};

  if (role === "EMPLOYEE") {
    filter.createdBy = userId;
  }

  return Invoice.find(filter)
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

/*
|--------------------------------------------------------------------------
| Upcoming Tasks
|--------------------------------------------------------------------------
*/

const getUpcomingTasks = async (
  limit = 10,
  userId = null,
  role = null
) => {
  const filter = {
    status: {
      $nin: [
        TASK_STATUS.COMPLETED,
        TASK_STATUS.CANCELLED,
      ],
    },
  };

  /*
   * Task.assignedTo -> User._id
   */
  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    filter.assignedTo =
      employeeScope.userId;
  }

  return Task.find(filter)
    .populate(
      "assignedTo",
      "username email role"
    )
    .populate(
      "lead",
      "leadId customerName mobile"
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

/*
|--------------------------------------------------------------------------
| Complete Dashboard
|--------------------------------------------------------------------------
*/

const getDashboard = async ({
  startDate,
  endDate,
  userId = null,
  role = null,
} = {}) => {
  const options = {
    from: startDate,
    to: endDate,
    userId,
    role,
  };

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

    getRecentLeads(
      10,
      userId,
      role
    ),

    getRecentQuotations(
      10,
      userId,
      role
    ),

    getRecentInvoices(
      10,
      userId,
      role
    ),

    getUpcomingTasks(
      10,
      userId,
      role
    ),
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

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  getDashboardStats,
  getDashboardSummary,

  getLeadStats,
  getLeadStatusSummary,

  getQuotationStats,
  getQuotationSummary,

  getInvoiceStats,
  getInvoiceSummary,

  getTaskStats,
  getTaskSummary,

  getAttendanceStats,
  getLeaveStats,

  getEmployeePerformance,

  getRecentLeads,
  getRecentQuotations,
  getRecentInvoices,
  getUpcomingTasks,

  getDashboard,
};