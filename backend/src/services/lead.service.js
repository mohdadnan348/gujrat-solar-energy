const Lead = require("../models/Lead");
const LeadActivity = require("../models/LeadActivity");
const Customer = require("../models/Customer");
const { generateId } = require("../utils/generateId");
const {
  LEAD_STATUS,
  LEAD_PRIORITY,
  LEAD_SOURCES,
} = require("../config/constants");

const buildFilter = ({ search, status, priority, leadSource, assignedTo }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { leadId: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (leadSource) filter.leadSource = leadSource;
  if (assignedTo) filter.assignedTo = assignedTo;

  return filter;
};

const createLead = async (data, createdBy) => {
  const leadId = await generateId(Lead, "leadId", "LD");

  const lead = await Lead.create({
    leadId,
    customerName: data.customerName,
    companyName: data.companyName,
    mobile: data.mobile,
    alternateMobile: data.alternateMobile,
    email: data.email,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    leadSource: data.leadSource || LEAD_SOURCES.WEBSITE,
    requirement: data.requirement,
    status: data.status || LEAD_STATUS.NEW,
    priority: data.priority || LEAD_PRIORITY.MEDIUM,
    assignedTo: data.assignedTo,
    followUpDate: data.followUpDate,
    notes: data.notes,
    createdBy,
  });

  await LeadActivity.create({
    lead: lead._id,
    activityType: "LEAD_CREATED",
    title: "Lead created",
    description: "New lead created in the system",
    createdBy,
    assignedTo: lead.assignedTo,
  });

  return Lead.findById(lead._id)
    .populate("assignedTo", "employeeId name email department designation")
    .populate("createdBy", "username email role");
};

const getLeads = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  priority,
  leadSource,
  assignedTo,
}) => {
  const filter = buildFilter({
    search,
    status,
    priority,
    leadSource,
    assignedTo,
  });

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("assignedTo", "employeeId name email department designation")
      .populate("convertedCustomer", "customerId name companyName mobile")
      .populate("createdBy", "username email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Lead.countDocuments(filter),
  ]);

  return {
    leads,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getLeadById = async (id) => {
  const lead = await Lead.findById(id)
    .populate("assignedTo", "employeeId name email department designation")
    .populate("convertedCustomer", "customerId name companyName mobile email")
    .populate("createdBy", "username email role")
    .populate("updatedBy", "username email role");

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  return lead;
};

const getLeadByLeadId = async (leadId) => {
  const lead = await Lead.findOne({ leadId })
    .populate("assignedTo", "employeeId name email department designation")
    .populate("convertedCustomer", "customerId name companyName mobile email")
    .populate("createdBy", "username email role");

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  return lead;
};

const updateLead = async (id, data, updatedBy) => {
  const lead = await Lead.findById(id);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = lead.status;
  const oldAssignedTo = lead.assignedTo
    ? String(lead.assignedTo)
    : null;

  const allowedFields = [
    "customerName",
    "companyName",
    "mobile",
    "alternateMobile",
    "email",
    "address",
    "city",
    "state",
    "pincode",
    "leadSource",
    "requirement",
    "status",
    "priority",
    "assignedTo",
    "followUpDate",
    "notes",
    "lostReason",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      lead[field] = data[field];
    }
  });

  lead.updatedBy = updatedBy;

  await lead.save();

  if (data.status && data.status !== oldStatus) {
    await LeadActivity.create({
      lead: lead._id,
      activityType: "STATUS_CHANGE",
      title: "Lead status changed",
      description: `${oldStatus} → ${data.status}`,
      status: data.status,
      createdBy: updatedBy,
      assignedTo: lead.assignedTo,
    });
  }

  if (
    data.assignedTo !== undefined &&
    String(data.assignedTo || "") !== String(oldAssignedTo || "")
  ) {
    await LeadActivity.create({
      lead: lead._id,
      activityType: "ASSIGNMENT",
      title: "Lead assigned",
      description: "Lead assignment updated",
      createdBy: updatedBy,
      assignedTo: lead.assignedTo,
    });
  }

  return getLeadById(lead._id);
};

const updateLeadStatus = async (id, status, lostReason, updatedBy) => {
  if (!Object.values(LEAD_STATUS).includes(status)) {
    const error = new Error("Invalid lead status");
    error.statusCode = 400;
    throw error;
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = lead.status;

  lead.status = status;

  if (status === LEAD_STATUS.LOST) {
    lead.lostReason = lostReason || lead.lostReason;
  } else {
    lead.lostReason = undefined;
  }

  lead.updatedBy = updatedBy;

  await lead.save();

  if (oldStatus !== status) {
    await LeadActivity.create({
      lead: lead._id,
      activityType: "STATUS_CHANGE",
      title: "Lead status changed",
      description: `${oldStatus} → ${status}`,
      status,
      createdBy: updatedBy,
      assignedTo: lead.assignedTo,
    });
  }

  return getLeadById(lead._id);
};

const assignLead = async (id, assignedTo, updatedBy) => {
  const lead = await Lead.findById(id);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  lead.assignedTo = assignedTo;
  lead.updatedBy = updatedBy;

  await lead.save();

  await LeadActivity.create({
    lead: lead._id,
    activityType: "ASSIGNMENT",
    title: "Lead assigned",
    description: "Lead assigned to an employee",
    createdBy: updatedBy,
    assignedTo,
  });

  return getLeadById(lead._id);
};

const convertLeadToCustomer = async (id, data, createdBy) => {
  const lead = await Lead.findById(id);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  if (lead.convertedCustomer) {
    const error = new Error("Lead is already converted to customer");
    error.statusCode = 409;
    throw error;
  }

  const customerId = await generateId(Customer, "customerId", "CUS");

  const customer = await Customer.create({
    customerId,
    lead: lead._id,
    name: data.name || lead.customerName,
    companyName:
      data.companyName !== undefined
        ? data.companyName
        : lead.companyName,
    mobile: data.mobile || lead.mobile,
    alternateMobile:
      data.alternateMobile || lead.alternateMobile,
    email: data.email || lead.email,
    address: data.address || lead.address,
    city: data.city || lead.city,
    state: data.state || lead.state,
    pincode: data.pincode || lead.pincode,
    gstNumber: data.gstNumber,
    panNumber: data.panNumber,
    customerType: data.customerType || "Individual",
    siteAddress: data.siteAddress,
    notes: data.notes,
    createdBy,
  });

  lead.convertedCustomer = customer._id;
  lead.status = LEAD_STATUS.CONVERTED;
  lead.updatedBy = createdBy;

  await lead.save();

  await LeadActivity.create({
    lead: lead._id,
    activityType: "CONVERSION",
    title: "Lead converted to customer",
    description: `Customer ${customer.customerId} created`,
    status: LEAD_STATUS.CONVERTED,
    createdBy,
    assignedTo: lead.assignedTo,
  });

  return {
    lead: await getLeadById(lead._id),
    customer,
  };
};

const deleteLead = async (id, updatedBy) => {
  const lead = await Lead.findById(id);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  // Historical records preserve karne ke liye hard delete nahi.
  lead.status = LEAD_STATUS.LOST;
  lead.lostReason = "Lead deactivated";
  lead.updatedBy = updatedBy;

  await lead.save();

  await LeadActivity.create({
    lead: lead._id,
    activityType: "STATUS_CHANGE",
    title: "Lead deactivated",
    description: "Lead marked as lost/deactivated",
    status: LEAD_STATUS.LOST,
    createdBy: updatedBy,
    assignedTo: lead.assignedTo,
  });

  return {
    message: "Lead deactivated successfully",
  };
};

const getLeadStats = async () => {
  const [statusStats, priorityStats, sourceStats] = await Promise.all([
    Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Lead.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Lead.aggregate([
      {
        $group: {
          _id: "$leadSource",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    byStatus: statusStats,
    byPriority: priorityStats,
    bySource: sourceStats,
  };
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  getLeadByLeadId,
  updateLead,
  updateLeadStatus,
  assignLead,
  convertLeadToCustomer,
  deleteLead,
  getLeadStats,
};