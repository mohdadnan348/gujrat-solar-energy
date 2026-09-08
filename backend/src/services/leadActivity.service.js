const LeadActivity = require("../models/LeadActivity");
const Lead = require("../models/Lead");

const createActivity = async (data, createdBy) => {
  const lead = await Lead.findById(data.lead);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  const activity = await LeadActivity.create({
    lead: data.lead,
    activityType: data.activityType,
    title: data.title,
    description: data.description,
    status: data.status,
    followUpDate: data.followUpDate,
    assignedTo: data.assignedTo || lead.assignedTo,
    createdBy,
  });

  return LeadActivity.findById(activity._id)
    .populate("lead", "leadId customerName companyName mobile status")
    .populate("assignedTo", "employeeId name email department designation")
    .populate("createdBy", "username email role");
};

const getActivities = async ({
  leadId,
  page = 1,
  limit = 20,
  activityType,
  status,
}) => {
  const filter = {};

  if (leadId) {
    filter.lead = leadId;
  }

  if (activityType) {
    filter.activityType = activityType;
  }

  if (status) {
    filter.status = status;
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [activities, total] = await Promise.all([
    LeadActivity.find(filter)
      .populate("lead", "leadId customerName companyName mobile status")
      .populate(
        "assignedTo",
        "employeeId name email department designation"
      )
      .populate("createdBy", "username email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    LeadActivity.countDocuments(filter),
  ]);

  return {
    activities,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getActivityById = async (activityId) => {
  const activity = await LeadActivity.findById(activityId)
    .populate("lead", "leadId customerName companyName mobile status")
    .populate(
      "assignedTo",
      "employeeId name email department designation"
    )
    .populate("createdBy", "username email role");

  if (!activity) {
    const error = new Error("Lead activity not found");
    error.statusCode = 404;
    throw error;
  }

  return activity;
};

const getLeadTimeline = async (leadId) => {
  const lead = await Lead.findById(leadId)
    .select("leadId customerName companyName mobile status");

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  const activities = await LeadActivity.find({
    lead: leadId,
  })
    .populate(
      "assignedTo",
      "employeeId name email department designation"
    )
    .populate("createdBy", "username email role")
    .sort({ createdAt: -1 })
    .lean();

  return {
    lead,
    activities,
  };
};

const updateActivity = async (activityId, data) => {
  const activity = await LeadActivity.findById(activityId);

  if (!activity) {
    const error = new Error("Lead activity not found");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "activityType",
    "title",
    "description",
    "status",
    "followUpDate",
    "assignedTo",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      activity[field] = data[field];
    }
  });

  await activity.save();

  return getActivityById(activity._id);
};

const deleteActivity = async (activityId) => {
  const activity = await LeadActivity.findById(activityId);

  if (!activity) {
    const error = new Error("Lead activity not found");
    error.statusCode = 404;
    throw error;
  }

  await activity.deleteOne();

  return {
    message: "Lead activity deleted successfully",
  };
};

const getUpcomingFollowUps = async ({
  fromDate = new Date(),
  toDate,
  assignedTo,
}) => {
  const filter = {
    followUpDate: {
      $gte: new Date(fromDate),
    },
  };

  if (toDate) {
    filter.followUpDate.$lte = new Date(toDate);
  }

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  return LeadActivity.find(filter)
    .populate("lead", "leadId customerName companyName mobile status")
    .populate(
      "assignedTo",
      "employeeId name email department designation"
    )
    .sort({ followUpDate: 1 })
    .lean();
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  getLeadTimeline,
  updateActivity,
  deleteActivity,
  getUpcomingFollowUps,
};