const Lead = require("../models/Lead");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");
const Task = require("../models/Task");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");

const buildDateFilter = (query = {}) => {
  const filter = {};

  if (query.startDate || query.from) {
    filter.$gte = new Date(
      query.startDate || query.from
    );
  }

  if (query.endDate || query.to) {
    const endDate = new Date(
      query.endDate || query.to
    );

    endDate.setHours(23, 59, 59, 999);
    filter.$lte = endDate;
  }

  return Object.keys(filter).length ? filter : null;
};

const addCommonFilters = (filter, query = {}) => {
  const dateFilter = buildDateFilter(query);

  if (dateFilter) {
    filter.createdAt = dateFilter;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }

  if (query.employeeId) {
    filter.employee = query.employeeId;
  }

  return filter;
};

const getOverallReport = async (query = {}) => {
  const [
    totalLeads,
    wonLeads,
    lostLeads,
    totalQuotations,
    acceptedQuotations,
    totalCustomers,
    totalInvoices,
    issuedInvoices,
    pendingTasks,
    totalEmployees,
  ] = await Promise.all([
    Lead.countDocuments(addCommonFilters({}, query)),
    Lead.countDocuments({
      ...addCommonFilters({}, query),
      status: "Won",
    }),
    Lead.countDocuments({
      ...addCommonFilters({}, query),
      status: "Lost",
    }),
    Quotation.countDocuments(
      addCommonFilters({}, query)
    ),
    Quotation.countDocuments({
      ...addCommonFilters({}, query),
      status: "Accepted",
    }),
    require("../models/Customer").countDocuments(
      addCommonFilters({}, query)
    ),
    Invoice.countDocuments(
      addCommonFilters({}, query)
    ),
    Invoice.countDocuments({
      ...addCommonFilters({}, query),
      status: "Issued",
    }),
    Task.countDocuments({
      ...addCommonFilters({}, query),
      status: {
        $in: ["Pending", "In Progress"],
      },
    }),
    Employee.countDocuments(
      addCommonFilters({}, query)
    ),
  ]);

  const conversionRate = totalLeads
    ? Number(((wonLeads / totalLeads) * 100).toFixed(2))
    : 0;

  return {
    totalLeads,
    wonLeads,
    lostLeads,
    conversionRate,
    totalQuotations,
    acceptedQuotations,
    totalCustomers,
    totalInvoices,
    issuedInvoices,
    pendingTasks,
    totalEmployees,
  };
};

const getLeadReport = async (query = {}) => {
  const filter = addCommonFilters({}, query);

  const [total, byStatus, bySource, byEmployee] =
    await Promise.all([
      Lead.countDocuments(filter),

      Lead.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Lead.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$leadSource",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Lead.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$assignedTo",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

  const won = await Lead.countDocuments({
    ...filter,
    status: "Won",
  });

  const lost = await Lead.countDocuments({
    ...filter,
    status: "Lost",
  });

  return {
    total,
    won,
    lost,
    conversionRate: total
      ? Number(((won / total) * 100).toFixed(2))
      : 0,
    byStatus,
    bySource,
    byEmployee,
  };
};

const getQuotationReport = async (query = {}) => {
  const filter = addCommonFilters({}, query);

  const [total, byStatus, totals] = await Promise.all([
    Quotation.countDocuments(filter),

    Quotation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Quotation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          subtotal: { $sum: "$subtotal" },
          discount: { $sum: "$totalDiscount" },
          tax: { $sum: "$totalTax" },
          grandTotal: { $sum: "$grandTotal" },
        },
      },
    ]),
  ]);

  return {
    total,
    byStatus,
    totals: totals[0] || {
      subtotal: 0,
      discount: 0,
      tax: 0,
      grandTotal: 0,
    },
  };
};

const getInvoiceReport = async (query = {}) => {
  const filter = addCommonFilters({}, query);

  const [total, byStatus, totals] = await Promise.all([
    Invoice.countDocuments(filter),

    Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          subtotal: { $sum: "$subtotal" },
          discount: { $sum: "$totalDiscount" },
          tax: { $sum: "$totalTax" },
          grandTotal: { $sum: "$grandTotal" },
        },
      },
    ]),
  ]);

  return {
    total,
    byStatus,
    totals: totals[0] || {
      subtotal: 0,
      discount: 0,
      tax: 0,
      grandTotal: 0,
    },
  };
};

const getTaskReport = async (query = {}) => {
  const filter = addCommonFilters({}, query);

  const [total, byStatus, byPriority] =
    await Promise.all([
      Task.countDocuments(filter),

      Task.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Task.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

  const overdue = await Task.countDocuments({
    ...filter,
    dueDate: { $lt: new Date() },
    status: {
      $nin: ["Completed", "Cancelled"],
    },
  });

  return {
    total,
    overdue,
    byStatus,
    byPriority,
  };
};

const getAttendanceReport = async (query = {}) => {
  const filter = addCommonFilters({}, query);

  const [total, byStatus] = await Promise.all([
    Attendance.countDocuments(filter),

    Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    total,
    byStatus,
  };
};

const getLeaveReport = async (query = {}) => {
  const filter = addCommonFilters({}, query);

  const [total, byStatus, byType] = await Promise.all([
    LeaveRequest.countDocuments(filter),

    LeaveRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    LeaveRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    total,
    byStatus,
    byType,
  };
};

const getEmployeeReport = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.department) {
    filter.department = query.department;
  }

  if (query.role) {
    filter.role = query.role;
  }

  const [total, byDepartment, byStatus] =
    await Promise.all([
      Employee.countDocuments(filter),

      Employee.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Employee.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

  return {
    total,
    byDepartment,
    byStatus,
  };
};

const getSalesPerformanceReport = async (
  query = {}
) => {
  const filter = addCommonFilters({}, query);

  const data = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$assignedTo",
        totalLeads: { $sum: 1 },
        wonLeads: {
          $sum: {
            $cond: [
              { $eq: ["$status", "Won"] },
              1,
              0,
            ],
          },
        },
        lostLeads: {
          $sum: {
            $cond: [
              { $eq: ["$status", "Lost"] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        conversionRate: {
          $cond: [
            { $gt: ["$totalLeads", 0] },
            {
              $multiply: [
                {
                  $divide: [
                    "$wonLeads",
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
    {
      $sort: {
        wonLeads: -1,
        totalLeads: -1,
      },
    },
  ]);

  return data;
};

module.exports = {
  getOverallReport,
  getLeadReport,
  getQuotationReport,
  getInvoiceReport,
  getTaskReport,
  getAttendanceReport,
  getLeaveReport,
  getEmployeeReport,
  getSalesPerformanceReport,
};