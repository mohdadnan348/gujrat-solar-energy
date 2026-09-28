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
| User._id
|    ↓
| Employee.user
|    ↓
| Employee._id
|
| Lead.assignedTo -> Employee._id
| Task.assignedTo -> Employee._id
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
    .select(
      "_id employeeId name email department designation status user"
    )
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
| Employee Business Scope
|--------------------------------------------------------------------------
|
| Employee can work with:
|
| 1. Leads created by employee
| 2. Leads assigned to employee
|
| From those leads:
| 3. Customers
| 4. Quotations
| 5. Invoices
|
|--------------------------------------------------------------------------
*/

const getEmployeeBusinessScope = async (
  userId,
  employeeId
) => {
  const leadConditions = [
    {
      createdBy: userId,
    },
    {
      assignedTo: employeeId,
    },
  ];

  const leads = await Lead.find({
    $or: leadConditions,
  })
    .select("_id")
    .lean();

  const leadIds = leads.map((lead) => lead._id);

  /*
  |--------------------------------------------------------------------------
  | Customers
  |--------------------------------------------------------------------------
  */

  const customerConditions = [
    {
      createdBy: userId,
    },
  ];

  if (leadIds.length > 0) {
    customerConditions.push({
      lead: {
        $in: leadIds,
      },
    });
  }

  const customers = await Customer.find({
    $or: customerConditions,
  })
    .select("_id")
    .lean();

  const customerIds = customers.map(
    (customer) => customer._id
  );

  /*
  |--------------------------------------------------------------------------
  | Quotations
  |--------------------------------------------------------------------------
  */

  const quotationConditions = [
    {
      createdBy: userId,
    },
  ];

  if (leadIds.length > 0) {
    quotationConditions.push({
      lead: {
        $in: leadIds,
      },
    });
  }

  if (customerIds.length > 0) {
    quotationConditions.push({
      customer: {
        $in: customerIds,
      },
    });
  }

  const quotations = await Quotation.find({
    $or: quotationConditions,
  })
    .select("_id")
    .lean();

  const quotationIds = quotations.map(
    (quotation) => quotation._id
  );

  return {
    leadIds,
    customerIds,
    quotationIds,
  };
};

/*
|--------------------------------------------------------------------------
| Employee Lead Filter
|--------------------------------------------------------------------------
*/

const getEmployeeLeadFilter = (
  userId,
  employeeId
) => {
  return {
    $or: [
      {
        createdBy: userId,
      },
      {
        assignedTo: employeeId,
      },
    ],
  };
};

/*
|--------------------------------------------------------------------------
| Employee Customer Filter
|--------------------------------------------------------------------------
*/

const getEmployeeCustomerFilter = async (
  userId,
  employeeId
) => {
  const { leadIds } =
    await getEmployeeBusinessScope(
      userId,
      employeeId
    );

  const conditions = [
    {
      createdBy: userId,
    },
  ];

  if (leadIds.length > 0) {
    conditions.push({
      lead: {
        $in: leadIds,
      },
    });
  }

  return {
    $or: conditions,
  };
};

/*
|--------------------------------------------------------------------------
| Employee Quotation Filter
|--------------------------------------------------------------------------
*/

const getEmployeeQuotationFilter = async (
  userId,
  employeeId
) => {
  const {
    leadIds,
    customerIds,
  } = await getEmployeeBusinessScope(
    userId,
    employeeId
  );

  const conditions = [
    {
      createdBy: userId,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Employee's own/assigned leads
  |--------------------------------------------------------------------------
  */

  if (leadIds.length > 0) {
    conditions.push({
      lead: {
        $in: leadIds,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Employee's customers
  |--------------------------------------------------------------------------
  */

  if (customerIds.length > 0) {
    conditions.push({
      customer: {
        $in: customerIds,
      },
    });
  }

  return {
    $or: conditions,
  };
};

/*
|--------------------------------------------------------------------------
| Employee Invoice Filter
|--------------------------------------------------------------------------
*/

const getEmployeeInvoiceFilter = async (
  userId,
  employeeId
) => {
  const {
    quotationIds,
    customerIds,
  } = await getEmployeeBusinessScope(
    userId,
    employeeId
  );

  const conditions = [
    {
      createdBy: userId,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Invoice linked with employee quotations
  |--------------------------------------------------------------------------
  */

  if (quotationIds.length > 0) {
    conditions.push({
      quotation: {
        $in: quotationIds,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Invoice linked with employee customers
  |--------------------------------------------------------------------------
  */

  if (customerIds.length > 0) {
    conditions.push({
      customer: {
        $in: customerIds,
      },
    });
  }

  return {
    $or: conditions,
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
  const { start, end } =
    getDateRange(from, to);

  const dateFilter = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  const isEmployee =
    role === "EMPLOYEE";

  let employeeScope = null;

  if (isEmployee) {
    employeeScope =
      await getEmployeeScope(userId);
  }

  /*
  |--------------------------------------------------------------------------
  | Lead
  |--------------------------------------------------------------------------
  */

  const leadFilter = isEmployee
    ? getEmployeeLeadFilter(
        employeeScope.userId,
        employeeScope.employeeId
      )
    : {};

  /*
  |--------------------------------------------------------------------------
  | Customer
  |--------------------------------------------------------------------------
  */

  const customerFilter = isEmployee
    ? await getEmployeeCustomerFilter(
        employeeScope.userId,
        employeeScope.employeeId
      )
    : {};

  /*
  |--------------------------------------------------------------------------
  | Quotation
  |--------------------------------------------------------------------------
  */

  const quotationFilter = isEmployee
    ? await getEmployeeQuotationFilter(
        employeeScope.userId,
        employeeScope.employeeId
      )
    : {};

  /*
  |--------------------------------------------------------------------------
  | Invoice
  |--------------------------------------------------------------------------
  */

  const invoiceFilter = isEmployee
    ? await getEmployeeInvoiceFilter(
        employeeScope.userId,
        employeeScope.employeeId
      )
    : {};

  /*
  |--------------------------------------------------------------------------
  | Task
  |--------------------------------------------------------------------------
  */

  const taskFilter = isEmployee
    ? {
        assignedTo:
          employeeScope.employeeId,
      }
    : {};

  /*
  |--------------------------------------------------------------------------
  | Attendance
  |--------------------------------------------------------------------------
  */

  const attendanceFilter = isEmployee
    ? {
        employee:
          employeeScope.userId,
      }
    : {};

  /*
  |--------------------------------------------------------------------------
  | Leave
  |--------------------------------------------------------------------------
  */

  const leaveFilter = isEmployee
    ? {
        employee:
          employeeScope.userId,
      }
    : {};

  /*
  |--------------------------------------------------------------------------
  | Counts
  |--------------------------------------------------------------------------
  */

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

    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,

    pendingLeaves,
    todayAttendance,
  ] = await Promise.all([
    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    isEmployee
      ? User.countDocuments({
          _id: employeeScope.userId,
          status: "Active",
        })
      : User.countDocuments({
          status: "Active",
        }),

    /*
    |--------------------------------------------------------------------------
    | Employees
    |--------------------------------------------------------------------------
    */

    isEmployee
      ? Employee.countDocuments({
          _id: employeeScope.employeeId,
          status: "Active",
        })
      : Employee.countDocuments({
          status: "Active",
        }),

    /*
    |--------------------------------------------------------------------------
    | Leads
    |--------------------------------------------------------------------------
    */

    Lead.countDocuments(
      leadFilter
    ),

    Lead.countDocuments({
      ...leadFilter,
      ...dateFilter,
    }),

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Customer.countDocuments(
      customerFilter
    ),

    Customer.countDocuments({
      ...customerFilter,
      ...dateFilter,
    }),

    /*
    |--------------------------------------------------------------------------
    | Quotations
    |--------------------------------------------------------------------------
    */

    Quotation.countDocuments(
      quotationFilter
    ),

    Quotation.countDocuments({
      ...quotationFilter,
      ...dateFilter,
    }),

    /*
    |--------------------------------------------------------------------------
    | Invoices
    |--------------------------------------------------------------------------
    */

    Invoice.countDocuments(
      invoiceFilter
    ),

    Invoice.countDocuments({
      ...invoiceFilter,
      ...dateFilter,
    }),

    /*
    |--------------------------------------------------------------------------
    | Tasks
    |--------------------------------------------------------------------------
    */

    Task.countDocuments(
      taskFilter
    ),

    Task.countDocuments({
      ...taskFilter,
      status:
        TASK_STATUS.COMPLETED,
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

    /*
    |--------------------------------------------------------------------------
    | Leaves
    |--------------------------------------------------------------------------
    */

    LeaveRequest.countDocuments({
      ...leaveFilter,
      status:
        LEAVE_STATUS.PENDING,
    }),

    /*
    |--------------------------------------------------------------------------
    | Attendance
    |--------------------------------------------------------------------------
    */

    Attendance.countDocuments({
      ...attendanceFilter,
      attendanceDate: {
        $gte: new Date(
          new Date().setHours(
            0,
            0,
            0,
            0
          )
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
      my: totalLeads,
      new: newLeads,
    },

    customers: {
      total: totalCustomers,
      new: newCustomers,
    },

    quotations: {
      total: totalQuotations,
      inPeriod:
        quotationsInPeriod,
    },

    invoices: {
      total: totalInvoices,
      inPeriod:
        invoicesInPeriod,
    },

    tasks: {
      total: totalTasks,
      my: totalTasks,
      pending: pendingTasks,
      completed:
        completedTasks,
      overdue: overdueTasks,
    },

    leaves: {
      pending:
        pendingLeaves,
    },

    attendance: {
      today:
        todayAttendance,
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
  const { start, end } =
    getDateRange(from, to);

  const leadFilter = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    leadFilter.$or =
      getEmployeeLeadFilter(
        employeeScope.userId,
        employeeScope.employeeId
      ).$or;
  }

  const [
    statusStats,
    sourceStats,
    priorityStats,
  ] = await Promise.all([
    Lead.aggregate([
      {
        $match:
          leadFilter,
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
        $match:
          leadFilter,
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
        $match:
          leadFilter,
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
  const stats =
    await getLeadStats({
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
  const { start, end } =
    getDateRange(from, to);

  const match = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    const quotationFilter =
      await getEmployeeQuotationFilter(
        employeeScope.userId,
        employeeScope.employeeId
      );

    Object.assign(
      match,
      quotationFilter
    );
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
  const { start, end } =
    getDateRange(from, to);

  const match = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    const invoiceFilter =
      await getEmployeeInvoiceFilter(
        employeeScope.userId,
        employeeScope.employeeId
      );

    Object.assign(
      match,
      invoiceFilter
    );
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
          $sum:
            "$taxableAmount",
        },
        taxAmount: {
          $sum:
            "$totalTax",
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
  const { start, end } =
    getDateRange(from, to);

  const taskScope = {};

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    taskScope.assignedTo =
      employeeScope.employeeId;
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
*/

const getEmployeePerformance = async ({
  startDate,
  endDate,
} = {}) => {
  const { start, end } =
    getDateRange(
      startDate,
      endDate
    );

  const employees =
    await Employee.find({
      status: "Active",
    })
      .select(
        "_id employeeId name email user"
      )
      .lean();

  const performance =
    await Promise.all(
      employees.map(
        async (employee) => {
          const [
            assignedLeads,
            completedTasks,
            pendingTasks,
          ] = await Promise.all([
            Lead.countDocuments({
              assignedTo:
                employee._id,
              createdAt: {
                $gte: start,
                $lte: end,
              },
            }),

            Task.countDocuments({
              assignedTo:
                employee._id,
              status:
                TASK_STATUS.COMPLETED,
              createdAt: {
                $gte: start,
                $lte: end,
              },
            }),

            Task.countDocuments({
              assignedTo:
                employee._id,
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
            employeeId:
              employee.employeeId,
            name:
              employee.name,
            email:
              employee.email,
            leads:
              assignedLeads,
            completedTasks,
            pendingTasks,
          };
        }
      )
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
  const { start, end } =
    getDateRange(
      from,
      to
    );

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
  const { start, end } =
    getDateRange(
      from,
      to
    );

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
  let filter = {};

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    filter =
      getEmployeeLeadFilter(
        employeeScope.userId,
        employeeScope.employeeId
      );
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
  let filter = {};

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    filter =
      await getEmployeeQuotationFilter(
        employeeScope.userId,
        employeeScope.employeeId
      );
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
    .populate(
      "systemConfiguration",
      "configurationNumber systemCapacity capacityUnit systemType status"
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
  let filter = {};

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    filter =
      await getEmployeeInvoiceFilter(
        employeeScope.userId,
        employeeScope.employeeId
      );
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
| Recent Tasks
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Dashboard section is "Recent Tasks", not "Upcoming Tasks".
|
| Therefore:
| - Pending tasks included
| - In Progress tasks included
| - Completed tasks included
| - Cancelled tasks excluded
|
|--------------------------------------------------------------------------
*/

const getRecentTasks = async (
  limit = 10,
  userId = null,
  role = null
) => {
  const filter = {
    status: {
      $ne:
        TASK_STATUS.CANCELLED,
    },
  };

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    filter.assignedTo =
      employeeScope.employeeId;
  }

  return Task.find(filter)
    .populate(
      "assignedTo",
      "employeeId name email department designation status user"
    )
    .populate(
      "lead",
      "leadId customerName mobile"
    )
    .populate(
      "customer",
      "customerId name companyName mobile"
    )
    .populate(
      "quotation",
      "quotationNumber status grandTotal"
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
|
| This method is kept separately because other parts of the system
| may use it for actual upcoming work.
|
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

  if (role === "EMPLOYEE") {
    const employeeScope =
      await getEmployeeScope(userId);

    filter.assignedTo =
      employeeScope.employeeId;
  }

  return Task.find(filter)
    .populate(
      "assignedTo",
      "employeeId name email department designation status user"
    )
    .populate(
      "lead",
      "leadId customerName mobile"
    )
    .populate(
      "customer",
      "customerId name companyName mobile"
    )
    .populate(
      "quotation",
      "quotationNumber status grandTotal"
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
    recentTasks,
    upcomingTasks,
  ] = await Promise.all([
    getDashboardStats(
      options
    ),

    getLeadStats(
      options
    ),

    getQuotationStats(
      options
    ),

    getInvoiceStats(
      options
    ),

    getTaskStats(
      options
    ),

    getAttendanceStats(
      options
    ),

    getLeaveStats(
      options
    ),

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

    getRecentTasks(
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
      leads:
        leadStats,

      quotations:
        quotationStats,

      invoices:
        invoiceStats,

      tasks:
        taskStats,

      attendance:
        attendanceStats,

      leaves:
        leaveStats,
    },

    recent: {
      leads:
        recentLeads,

      quotations:
        recentQuotations,

      invoices:
        recentInvoices,

      tasks:
        recentTasks,

      upcomingTasks:
        upcomingTasks,
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
  getRecentTasks,
  getUpcomingTasks,

  getDashboard,
};