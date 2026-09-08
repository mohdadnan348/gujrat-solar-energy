const Lead = require("../models/Lead");
const LeadActivity = require("../models/LeadActivity");
const SolarRequirement = require("../models/SolarRequirement");
const SystemConfiguration = require("../models/SystemConfiguration");
const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Task = require("../models/Task");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");

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
    : new Date(new Date().setHours(0, 0, 0, 0));

  const end = to
    ? new Date(to)
    : new Date();

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

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (end < start) {
    const error = new Error(
      "To date cannot be before from date"
    );
    error.statusCode = 400;
    throw error;
  }

  return { start, end };
};

const getLeadReport = async ({
  from,
  to,
  assignedTo,
  leadSource,
  status,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const match = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (assignedTo) {
    match.assignedTo = assignedTo;
  }

  if (leadSource) {
    match.leadSource = leadSource;
  }

  if (status) {
    match.status = status;
  }

  const [
    summary,
    statusBreakdown,
    sourceBreakdown,
    priorityBreakdown,
    employeePerformance,
    dailyLeads,
  ] = await Promise.all([
    Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    LEAD_STATUS.CONVERTED,
                  ],
                },
                1,
                0,
              ],
            },
          },
          lostLeads: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    LEAD_STATUS.LOST,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalLeads: 1,
          convertedLeads: 1,
          lostLeads: 1,
          conversionRate: {
            $cond: [
              { $gt: ["$totalLeads", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      "$convertedLeads",
                      "$totalLeads",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]),

    Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$leadSource",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$assignedTo",
          totalLeads: { $sum: 1 },
          converted: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    LEAD_STATUS.CONVERTED,
                  ],
                },
                1,
                0,
              ],
            },
          },
          lost: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    LEAD_STATUS.LOST,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $unwind: {
          path: "$employee",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          employeeId: "$employee.employeeId",
          employeeName: "$employee.name",
          totalLeads: 1,
          converted: 1,
          lost: 1,
          conversionRate: {
            $cond: [
              { $gt: ["$totalLeads", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      "$converted",
                      "$totalLeads",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { totalLeads: -1 } },
    ]),

    Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    period: { from: start, to: end },
    summary: summary[0] || {
      totalLeads: 0,
      convertedLeads: 0,
      lostLeads: 0,
      conversionRate: 0,
    },
    statusBreakdown,
    sourceBreakdown,
    priorityBreakdown,
    employeePerformance,
    dailyLeads,
  };
};

const getSalesReport = async ({
  from,
  to,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const quotationMatch = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  const invoiceMatch = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  const [
    quotationSummary,
    quotationStatus,
    invoiceSummary,
    invoiceStatus,
  ] = await Promise.all([
    Quotation.aggregate([
      { $match: quotationMatch },
      {
        $group: {
          _id: null,
          totalQuotations: { $sum: 1 },
          acceptedQuotations: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    QUOTATION_STATUS.ACCEPTED,
                  ],
                },
                1,
                0,
              ],
            },
          },
          quotedValue: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuotations: 1,
          acceptedQuotations: 1,
          quotedValue: 1,
          acceptanceRate: {
            $cond: [
              { $gt: ["$totalQuotations", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      "$acceptedQuotations",
                      "$totalQuotations",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]),

    Quotation.aggregate([
      { $match: quotationMatch },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          value: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },
        },
      },
      { $sort: { value: -1 } },
    ]),

    Invoice.aggregate([
      { $match: invoiceMatch },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          invoicedValue: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },
          taxableValue: {
            $sum: {
              $ifNull: ["$taxableAmount", 0],
            },
          },
          taxValue: {
            $sum: {
              $ifNull: ["$totalTax", 0],
            },
          },
        },
      },
    ]),

    Invoice.aggregate([
      { $match: invoiceMatch },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          value: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },
        },
      },
      { $sort: { value: -1 } },
    ]),
  ]);

  return {
    period: { from: start, to: end },
    quotations: {
      summary: quotationSummary[0] || {
        totalQuotations: 0,
        acceptedQuotations: 0,
        quotedValue: 0,
        acceptanceRate: 0,
      },
      statusBreakdown: quotationStatus,
    },
    invoices: {
      summary: invoiceSummary[0] || {
        totalInvoices: 0,
        invoicedValue: 0,
        taxableValue: 0,
        taxValue: 0,
      },
      statusBreakdown: invoiceStatus,
    },
  };
};

const getOperationsReport = async ({
  from,
  to,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const [
    taskStats,
    attendanceStats,
    leaveStats,
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
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Attendance.aggregate([
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
          count: { $sum: 1 },
          totalHours: {
            $sum: {
              $ifNull: ["$totalHours", 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),

    LeaveRequest.aggregate([
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
          count: { $sum: 1 },
          totalDays: {
            $sum: {
              $ifNull: ["$totalDays", 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    period: { from: start, to: end },
    tasks: taskStats,
    attendance: attendanceStats,
    leaves: leaveStats,
  };
};

const getEmployeePerformanceReport = async ({
  from,
  to,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const employees = await Employee.find({
    status: "Active",
  })
    .select(
      "employeeId name department designation"
    )
    .sort({ name: 1 })
    .lean();

  const employeeIds = employees.map(
    (employee) => employee._id
  );

  const [
    leadStats,
    taskStats,
    attendanceStats,
  ] = await Promise.all([
    Lead.aggregate([
      {
        $match: {
          assignedTo: {
            $in: employeeIds,
          },
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    LEAD_STATUS.CONVERTED,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    Task.aggregate([
      {
        $match: {
          assignedTo: {
            $in: employeeIds,
          },
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    TASK_STATUS.COMPLETED,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    Attendance.aggregate([
      {
        $match: {
          employee: {
            $in: employeeIds,
          },
          attendanceDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$employee",
          presentDays: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    ATTENDANCE_STATUS.PRESENT,
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalHours: {
            $sum: {
              $ifNull: ["$totalHours", 0],
            },
          },
        },
      },
    ]),
  ]);

  const leadMap = new Map(
    leadStats.map((item) => [
      String(item._id),
      item,
    ])
  );

  const taskMap = new Map(
    taskStats.map((item) => [
      String(item._id),
      item,
    ])
  );

  const attendanceMap = new Map(
    attendanceStats.map((item) => [
      String(item._id),
      item,
    ])
  );

  return employees.map((employee) => {
    const key = String(employee._id);

    const leads =
      leadMap.get(key) || {};

    const tasks =
      taskMap.get(key) || {};

    const attendance =
      attendanceMap.get(key) || {};

    return {
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        designation: employee.designation,
      },

      leads: {
        total: leads.totalLeads || 0,
        converted: leads.convertedLeads || 0,
      },

      tasks: {
        total: tasks.totalTasks || 0,
        completed: tasks.completedTasks || 0,
      },

      attendance: {
        presentDays:
          attendance.presentDays || 0,
        totalHours:
          attendance.totalHours || 0,
      },
    };
  });
};

const getSolarReport = async ({
  from,
  to,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const [
    requirementStats,
    systemStats,
    capacityStats,
  ] = await Promise.all([
    SolarRequirement.aggregate([
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
          _id: "$systemType",
          count: { $sum: 1 },
          totalRequiredKw: {
            $sum: {
              $ifNull: ["$requiredKw", 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),

    SystemConfiguration.aggregate([
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
          _id: "$systemType",
          count: { $sum: 1 },
          totalCapacityKw: {
            $sum: {
              $ifNull: ["$systemCapacityKw", 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),

    SystemConfiguration.aggregate([
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
          _id: null,
          totalCapacityKw: {
            $sum: {
              $ifNull: ["$systemCapacityKw", 0],
            },
          },
          totalSystemCost: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },
        },
      },
    ]),
  ]);

  return {
    period: { from: start, to: end },
    requirements: requirementStats,
    configurations: systemStats,
    totals: capacityStats[0] || {
      totalCapacityKw: 0,
      totalSystemCost: 0,
    },
  };
};

const getActivityReport = async ({
  from,
  to,
} = {}) => {
  const { start, end } = getDateRange(from, to);

  const activities =
    await LeadActivity.aggregate([
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
          _id: "$activityType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

  return {
    period: { from: start, to: end },
    activities,
  };
};

const getFullReport = async (
  options = {}
) => {
  const [
    leadReport,
    salesReport,
    operationsReport,
    employeePerformance,
    solarReport,
    activityReport,
  ] = await Promise.all([
    getLeadReport(options),
    getSalesReport(options),
    getOperationsReport(options),
    getEmployeePerformanceReport(options),
    getSolarReport(options),
    getActivityReport(options),
  ]);

  return {
    generatedAt: new Date(),

    leads: leadReport,

    sales: salesReport,

    operations: operationsReport,

    employeePerformance,

    solar: solarReport,

    activities: activityReport,
  };
};

module.exports = {
  getDateRange,
  getLeadReport,
  getSalesReport,
  getOperationsReport,
  getEmployeePerformanceReport,
  getSolarReport,
  getActivityReport,
  getFullReport,
};