const SolarRequirement = require("../models/SolarRequirement");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const { SYSTEM_TYPE } = require("../config/constants");

const createSolarRequirement = async (data, createdBy) => {
  if (!data.lead && !data.customer) {
    const error = new Error("Lead or customer is required");
    error.statusCode = 400;
    throw error;
  }

  if (data.lead) {
    const lead = await Lead.findById(data.lead);

    if (!lead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.customer) {
    const customer = await Customer.findById(data.customer);

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }
  }

  const requirement = await SolarRequirement.create({
    lead: data.lead,
    customer: data.customer,
    requiredKw: data.requiredKw,
    monthlyBill: data.monthlyBill,
    monthlyUnits: data.monthlyUnits,
    roofType: data.roofType,
    roofArea: data.roofArea,
    siteAddress: data.siteAddress,
    location: data.location,
    connectionType: data.connectionType,
    sanctionedLoad: data.sanctionedLoad,
    systemType: data.systemType,
    batteryRequired: data.batteryRequired || false,
    batteryCapacity: data.batteryCapacity,
    siteSurveyRequired:
      data.siteSurveyRequired !== undefined
        ? data.siteSurveyRequired
        : true,
    siteSurveyCompleted: data.siteSurveyCompleted || false,
    photos: data.photos || [],
    documents: data.documents || [],
    notes: data.notes,
    createdBy,
  });

  return SolarRequirement.findById(requirement._id)
    .populate(
      "lead",
      "leadId customerName companyName mobile email status"
    )
    .populate(
      "customer",
      "customerId name companyName mobile email status"
    )
    .populate("createdBy", "username email role");
};

const getRequirements = async ({
  page = 1,
  limit = 10,
  search = "",
  lead,
  customer,
  systemType,
  batteryRequired,
  siteSurveyRequired,
  siteSurveyCompleted,
}) => {
  const filter = {};

  if (lead) filter.lead = lead;
  if (customer) filter.customer = customer;
  if (systemType) filter.systemType = systemType;

  if (batteryRequired !== undefined) {
    filter.batteryRequired =
      batteryRequired === true || batteryRequired === "true";
  }

  if (siteSurveyRequired !== undefined) {
    filter.siteSurveyRequired =
      siteSurveyRequired === true || siteSurveyRequired === "true";
  }

  if (siteSurveyCompleted !== undefined) {
    filter.siteSurveyCompleted =
      siteSurveyCompleted === true || siteSurveyCompleted === "true";
  }

  if (search) {
    const matchingLeads = await Lead.find({
      $or: [
        { leadId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const matchingCustomers = await Customer.find({
      $or: [
        { customerId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const leadIds = matchingLeads.map((item) => item._id);
    const customerIds = matchingCustomers.map((item) => item._id);

    filter.$or = [
      { lead: { $in: leadIds } },
      { customer: { $in: customerIds } },
      { siteAddress: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [requirements, total] = await Promise.all([
    SolarRequirement.find(filter)
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "customer",
        "customerId name companyName mobile email status"
      )
      .populate("createdBy", "username email role")
      .populate("updatedBy", "username email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    SolarRequirement.countDocuments(filter),
  ]);

  return {
    requirements,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getRequirementById = async (requirementId) => {
  const requirement = await SolarRequirement.findById(requirementId)
    .populate(
      "lead",
      "leadId customerName companyName mobile email status"
    )
    .populate(
      "customer",
      "customerId name companyName mobile email status"
    )
    .populate("createdBy", "username email role")
    .populate("updatedBy", "username email role");

  if (!requirement) {
    const error = new Error("Solar requirement not found");
    error.statusCode = 404;
    throw error;
  }

  return requirement;
};

const updateRequirement = async (
  requirementId,
  data,
  updatedBy
) => {
  const requirement = await SolarRequirement.findById(requirementId);

  if (!requirement) {
    const error = new Error("Solar requirement not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.lead !== undefined) {
    const lead = await Lead.findById(data.lead);

    if (!lead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }

    requirement.lead = data.lead;
  }

  if (data.customer !== undefined) {
    const customer = await Customer.findById(data.customer);

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }

    requirement.customer = data.customer;
  }

  const allowedFields = [
    "requiredKw",
    "monthlyBill",
    "monthlyUnits",
    "roofType",
    "roofArea",
    "siteAddress",
    "location",
    "connectionType",
    "sanctionedLoad",
    "systemType",
    "batteryRequired",
    "batteryCapacity",
    "siteSurveyRequired",
    "siteSurveyCompleted",
    "photos",
    "documents",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      requirement[field] = data[field];
    }
  });

  requirement.updatedBy = updatedBy;

  await requirement.save();

  return getRequirementById(requirement._id);
};

const updateSurveyStatus = async (
  requirementId,
  completed,
  updatedBy
) => {
  const requirement = await SolarRequirement.findById(requirementId);

  if (!requirement) {
    const error = new Error("Solar requirement not found");
    error.statusCode = 404;
    throw error;
  }

  requirement.siteSurveyCompleted =
    completed === true || completed === "true";

  requirement.updatedBy = updatedBy;

  await requirement.save();

  return getRequirementById(requirement._id);
};

const addPhoto = async (
  requirementId,
  photo,
  updatedBy
) => {
  const requirement = await SolarRequirement.findById(requirementId);

  if (!requirement) {
    const error = new Error("Solar requirement not found");
    error.statusCode = 404;
    throw error;
  }

  requirement.photos.push(photo);
  requirement.updatedBy = updatedBy;

  await requirement.save();

  return getRequirementById(requirement._id);
};

const addDocument = async (
  requirementId,
  document,
  updatedBy
) => {
  const requirement = await SolarRequirement.findById(requirementId);

  if (!requirement) {
    const error = new Error("Solar requirement not found");
    error.statusCode = 404;
    throw error;
  }

  requirement.documents.push(document);
  requirement.updatedBy = updatedBy;

  await requirement.save();

  return getRequirementById(requirement._id);
};

const deleteRequirement = async (
  requirementId,
  updatedBy
) => {
  const requirement = await SolarRequirement.findById(requirementId);

  if (!requirement) {
    const error = new Error("Solar requirement not found");
    error.statusCode = 404;
    throw error;
  }

  // Requirement historical record hai, isliye hard delete nahi.
  requirement.notes = `${
    requirement.notes ? `${requirement.notes}\n` : ""
  }Requirement deactivated.`;

  requirement.updatedBy = updatedBy;

  await requirement.save();

  return {
    message: "Solar requirement archived successfully",
  };
};

const getRequirementsByLead = async (leadId) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  return SolarRequirement.find({ lead: leadId })
    .populate(
      "customer",
      "customerId name companyName mobile email status"
    )
    .sort({ createdAt: -1 })
    .lean();
};

const getRequirementsByCustomer = async (customerId) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return SolarRequirement.find({ customer: customerId })
    .populate(
      "lead",
      "leadId customerName companyName mobile email status"
    )
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  createSolarRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  updateSurveyStatus,
  addPhoto,
  addDocument,
  deleteRequirement,
  getRequirementsByLead,
  getRequirementsByCustomer,
};