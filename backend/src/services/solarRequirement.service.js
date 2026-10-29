const SolarRequirement = require("../models/SolarRequirement");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

const {
  SYSTEM_TYPE,
} = require("../config/constants");

const {
  SOLAR_REQUIREMENT_STATUS,
} = require("../models/SolarRequirement");

/* =========================================================
   CREATE
========================================================= */

const createSolarRequirement = async (
  data,
  createdBy
) => {
  if (!data.lead && !data.customer) {
    const error = new Error(
      "Lead or customer is required"
    );

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
    const customer =
      await Customer.findById(data.customer);

    if (!customer) {
      const error = new Error(
        "Customer not found"
      );

      error.statusCode = 404;
      throw error;
    }
  }

  const requirement =
    await SolarRequirement.create({
      lead: data.lead,
      customer: data.customer,

      status:
        data.status ||
        SOLAR_REQUIREMENT_STATUS.PENDING,

      requiredKw:
        data.requiredKw ?? data.requiredCapacity ?? data.systemCapacity,
      monthlyBill:
        data.monthlyBill ?? data.monthlyElectricityBill,
      monthlyUnits:
        data.monthlyUnits ?? data.monthlyConsumption ?? data.monthlyUnitsConsumed,

      roofType: data.roofType ?? data.roof,
      roofArea: data.roofArea ?? data.roofAreaSqFt ?? data.roofAreaSqft,

      siteAddress:
        data.siteAddress ?? data.installationSiteAddress ?? data.installationAddress,
      location:
        data.location ?? data.installationCity ?? data.city,

      connectionType:
        data.connectionType ?? data.connectionPhase ?? data.phase,
      sanctionedLoad:
        data.sanctionedLoad ?? data.sanctionedLoadKw,

      systemType: data.systemType,

      batteryRequired:
        data.batteryRequired !== undefined
          ? data.batteryRequired === true || String(data.batteryRequired).toLowerCase() === "true" || String(data.batteryRequired).toLowerCase() === "yes"
          : false,

      batteryCapacity:
        data.batteryCapacity ?? data.batteryCapacityKwh,

      siteSurveyRequired:
        data.siteSurveyRequired !== undefined
          ? data.siteSurveyRequired === true || String(data.siteSurveyRequired).toLowerCase() === "true" || String(data.siteSurveyRequired).toLowerCase() === "yes"
          : data.surveyRequired !== undefined
            ? data.surveyRequired === true || String(data.surveyRequired).toLowerCase() === "true" || String(data.surveyRequired).toLowerCase() === "yes"
            : true,

      siteSurveyCompleted:
        data.siteSurveyCompleted || false,

      photos: data.photos || [],
      documents: data.documents || [],

      notes: data.notes,

      createdBy,
    });

  return getRequirementById(
    requirement._id
  );
};

/* =========================================================
   GET ALL
========================================================= */

const getRequirements = async ({
  page = 1,
  limit = 10,
  search = "",
  lead,
  customer,
  systemType,
  status,
  batteryRequired,
  siteSurveyRequired,
  siteSurveyCompleted,
}) => {
  const filter = {};

  if (lead) {
    filter.lead = lead;
  }

  if (customer) {
    filter.customer = customer;
  }

  if (systemType) {
    filter.systemType = systemType;
  }

  if (status) {
    filter.status = status;
  }

  if (batteryRequired !== undefined) {
    filter.batteryRequired =
      batteryRequired === true ||
      batteryRequired === "true";
  }

  if (siteSurveyRequired !== undefined) {
    filter.siteSurveyRequired =
      siteSurveyRequired === true ||
      siteSurveyRequired === "true";
  }

  if (siteSurveyCompleted !== undefined) {
    filter.siteSurveyCompleted =
      siteSurveyCompleted === true ||
      siteSurveyCompleted === "true";
  }

  /* =========================
     SEARCH
  ========================= */

  if (search) {
    const matchingLeads =
      await Lead.find({
        $or: [
          {
            leadId: {
              $regex: search,
              $options: "i",
            },
          },
          {
            customerName: {
              $regex: search,
              $options: "i",
            },
          },
          {
            companyName: {
              $regex: search,
              $options: "i",
            },
          },
          {
            mobile: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      }).select("_id");

    const matchingCustomers =
      await Customer.find({
        $or: [
          {
            customerId: {
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
            companyName: {
              $regex: search,
              $options: "i",
            },
          },
          {
            mobile: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      }).select("_id");

    const leadIds = matchingLeads.map(
      (item) => item._id
    );

    const customerIds =
      matchingCustomers.map(
        (item) => item._id
      );

    filter.$or = [
      {
        lead: {
          $in: leadIds,
        },
      },
      {
        customer: {
          $in: customerIds,
        },
      },
      {
        siteAddress: {
          $regex: search,
          $options: "i",
        },
      },
      {
        location: {
          $regex: search,
          $options: "i",
        },
      },
    ];
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
    requirements,
    total,
  ] = await Promise.all([
    SolarRequirement.find(filter)
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "customer",
        "customerId name companyName mobile email status"
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
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    SolarRequirement.countDocuments(
      filter
    ),
  ]);

  return {
    requirements,

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

/* =========================================================
   GET BY ID
========================================================= */

const getRequirementById = async (
  requirementId
) => {
  const requirement =
    await SolarRequirement.findById(
      requirementId
    )
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "customer",
        "customerId name companyName mobile email status"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      );

  if (!requirement) {
    const error = new Error(
      "Solar requirement not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return requirement;
};

/* =========================================================
   UPDATE
========================================================= */

const updateRequirement = async (
  requirementId,
  data,
  updatedBy
) => {
  const requirement =
    await SolarRequirement.findById(
      requirementId
    );

  if (!requirement) {
    const error = new Error(
      "Solar requirement not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /* =========================
     LEAD
  ========================= */

  if (data.lead !== undefined) {
    const lead = await Lead.findById(
      data.lead
    );

    if (!lead) {
      const error = new Error(
        "Lead not found"
      );

      error.statusCode = 404;
      throw error;
    }

    requirement.lead = data.lead;
  }

  /* =========================
     CUSTOMER
  ========================= */

  if (data.customer !== undefined) {
    const customer =
      await Customer.findById(
        data.customer
      );

    if (!customer) {
      const error = new Error(
        "Customer not found"
      );

      error.statusCode = 404;
      throw error;
    }

    requirement.customer =
      data.customer;
  }

  /* =========================
     STATUS
  ========================= */

  if (data.status !== undefined) {
    if (
      !Object.values(
        SOLAR_REQUIREMENT_STATUS
      ).includes(data.status)
    ) {
      const error = new Error(
        `Invalid solar requirement status. Allowed statuses: ${Object.values(
          SOLAR_REQUIREMENT_STATUS
        ).join(", ")}`
      );

      error.statusCode = 400;
      throw error;
    }

    requirement.status = data.status;
  }

  /* =========================
     OTHER FIELDS
  ========================= */

  const fieldAliases = {
    requiredKw: ["requiredKw", "requiredCapacity", "systemCapacity"],
    monthlyBill: ["monthlyBill", "monthlyElectricityBill"],
    monthlyUnits: ["monthlyUnits", "monthlyConsumption", "monthlyUnitsConsumed"],
    roofType: ["roofType", "roof"],
    roofArea: ["roofArea", "roofAreaSqFt", "roofAreaSqft"],
    siteAddress: ["siteAddress", "installationSiteAddress", "installationAddress"],
    location: ["location", "installationCity", "city"],
    connectionType: ["connectionType", "connectionPhase", "phase"],
    sanctionedLoad: ["sanctionedLoad", "sanctionedLoadKw"],
    systemType: ["systemType"],
    batteryRequired: ["batteryRequired"],
    batteryCapacity: ["batteryCapacity", "batteryCapacityKwh"],
    siteSurveyRequired: ["siteSurveyRequired", "surveyRequired"],
    siteSurveyCompleted: ["siteSurveyCompleted"],
    photos: ["photos"],
    documents: ["documents"],
    notes: ["notes"],
  };

  Object.entries(fieldAliases).forEach(([field, aliases]) => {
    const alias = aliases.find((key) => data[key] !== undefined);
    if (alias === undefined) return;

    let value = data[alias];
    if (["batteryRequired", "siteSurveyRequired", "siteSurveyCompleted"].includes(field)) {
      value = value === true || String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes";
    }
    requirement[field] = value;
  });

  requirement.updatedBy =
    updatedBy;

  await requirement.save();

  return getRequirementById(
    requirement._id
  );
};

/* =========================================================
   SITE SURVEY STATUS
========================================================= */

const updateSurveyStatus = async (
  requirementId,
  completed,
  updatedBy
) => {
  const requirement =
    await SolarRequirement.findById(
      requirementId
    );

  if (!requirement) {
    const error = new Error(
      "Solar requirement not found"
    );

    error.statusCode = 404;
    throw error;
  }

  requirement.siteSurveyCompleted =
    completed === true ||
    completed === "true";

  requirement.updatedBy =
    updatedBy;

  await requirement.save();

  return getRequirementById(
    requirement._id
  );
};

/* =========================================================
   PHOTOS
========================================================= */

const addPhoto = async (
  requirementId,
  photo,
  updatedBy
) => {
  const requirement =
    await SolarRequirement.findById(
      requirementId
    );

  if (!requirement) {
    const error = new Error(
      "Solar requirement not found"
    );

    error.statusCode = 404;
    throw error;
  }

  requirement.photos.push(photo);
  requirement.updatedBy =
    updatedBy;

  await requirement.save();

  return getRequirementById(
    requirement._id
  );
};

/* =========================================================
   DOCUMENTS
========================================================= */

const addDocument = async (
  requirementId,
  document,
  updatedBy
) => {
  const requirement =
    await SolarRequirement.findById(
      requirementId
    );

  if (!requirement) {
    const error = new Error(
      "Solar requirement not found"
    );

    error.statusCode = 404;
    throw error;
  }

  requirement.documents.push(
    document
  );

  requirement.updatedBy =
    updatedBy;

  await requirement.save();

  return getRequirementById(
    requirement._id
  );
};

/* =========================================================
   DELETE / ARCHIVE
========================================================= */

const deleteRequirement = async (
  requirementId,
  updatedBy
) => {
  const requirement =
    await SolarRequirement.findById(
      requirementId
    );

  if (!requirement) {
    const error = new Error(
      "Solar requirement not found"
    );

    error.statusCode = 404;
    throw error;
  }

  requirement.status =
    SOLAR_REQUIREMENT_STATUS.CANCELLED;

  requirement.notes = `${
    requirement.notes
      ? `${requirement.notes}\n`
      : ""
  }Requirement cancelled/archived.`;

  requirement.updatedBy =
    updatedBy;

  await requirement.save();

  return {
    message:
      "Solar requirement archived successfully",
  };
};

/* =========================================================
   BY LEAD
========================================================= */

const getRequirementsByLead = async (
  leadId
) => {
  const lead =
    await Lead.findById(leadId);

  if (!lead) {
    const error = new Error(
      "Lead not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return SolarRequirement.find({
    lead: leadId,
  })
    .populate(
      "customer",
      "customerId name companyName mobile email status"
    )
    .populate(
      "updatedBy",
      "username email role"
    )
    .sort({
      createdAt: -1,
    })
    .lean();
};

/* =========================================================
   BY CUSTOMER
========================================================= */

const getRequirementsByCustomer =
  async (customerId) => {
    const customer =
      await Customer.findById(
        customerId
      );

    if (!customer) {
      const error = new Error(
        "Customer not found"
      );

      error.statusCode = 404;
      throw error;
    }

    return SolarRequirement.find({
      customer: customerId,
    })
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "updatedBy",
        "username email role"
      )
      .sort({
        createdAt: -1,
      })
      .lean();
  };

module.exports = {
  createSolarRequirement,

  getSolarRequirements:
    getRequirements,

  getSolarRequirementById:
    getRequirementById,

  getSolarRequirementByLead:
    getRequirementsByLead,

  updateSolarRequirement:
    updateRequirement,

  updateSurveyStatus,

  addPhotos: addPhoto,

  addDocuments: addDocument,

  deleteRequirement,

  getRequirementsByCustomer,
};