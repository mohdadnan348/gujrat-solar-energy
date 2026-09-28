const SystemConfiguration = require("../models/SystemConfiguration");
const Lead = require("../models/Lead");
const SolarRequirement = require("../models/SolarRequirement");
const Customer = require("../models/Customer");

const calculateComponentTotals = (components = []) => {
  let subtotal = 0;

  const normalizedComponents = components.map((component) => {
    const quantity = Number(component.quantity) || 0;
    const unitPrice = Number(component.unitPrice) || 0;

    const totalPrice = Number(
      (quantity * unitPrice).toFixed(2)
    );

    subtotal += totalPrice;

    return {
      ...component,
      quantity,
      unitPrice,
      totalPrice,
    };
  });

  return {
    components: normalizedComponents,
    subtotal: Number(subtotal.toFixed(2)),
  };
};

const calculateTotals = ({
  components = [],
  installationCost = 0,
  transportationCost = 0,
  otherCost = 0,
  discount = 0,
  taxPercentage = 0,
}) => {
  const componentResult =
    calculateComponentTotals(components);

  const safeInstallationCost =
    Number(installationCost) || 0;

  const safeTransportationCost =
    Number(transportationCost) || 0;

  const safeOtherCost =
    Number(otherCost) || 0;

  const safeDiscount = Number(discount) || 0;

  const safeTaxPercentage =
    Number(taxPercentage) || 0;

  const baseAmount =
    componentResult.subtotal +
    safeInstallationCost +
    safeTransportationCost +
    safeOtherCost;

  const taxableAmount = Math.max(
    baseAmount - safeDiscount,
    0
  );

  const taxAmount =
    (taxableAmount * safeTaxPercentage) / 100;

  const totalAmount =
    taxableAmount + taxAmount;

  return {
    components: componentResult.components,
    subtotal: Number(baseAmount.toFixed(2)),
    discount: Number(safeDiscount.toFixed(2)),
    taxPercentage: Number(
      safeTaxPercentage.toFixed(2)
    ),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(
      Math.max(totalAmount, 0).toFixed(2)
    ),
  };
};

const validateReferences = async ({
  lead,
  solarRequirement,
  customer,
}) => {
  if (lead) {
    const leadExists = await Lead.exists({
      _id: lead,
    });

    if (!leadExists) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (solarRequirement) {
    const requirementExists =
      await SolarRequirement.exists({
        _id: solarRequirement,
      });

    if (!requirementExists) {
      const error = new Error(
        "Solar requirement not found"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  if (customer) {
    const customerExists =
      await Customer.exists({
        _id: customer,
      });

    if (!customerExists) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }
  }
};

const getNextVersion = async ({
  lead,
  solarRequirement,
}) => {
  const filter = {};

  if (lead) {
    filter.lead = lead;
  }

  if (solarRequirement) {
    filter.solarRequirement =
      solarRequirement;
  }

  if (!lead && !solarRequirement) {
    return 1;
  }

  const latest =
    await SystemConfiguration.findOne(filter)
      .sort({ version: -1 })
      .select("version")
      .lean();

  return latest
    ? Number(latest.version) + 1
    : 1;
};

const createConfiguration = async (
  data,
  createdBy
) => {
  await validateReferences({
    lead: data.lead,
    solarRequirement:
      data.solarRequirement,
    customer: data.customer,
  });

  const version = await getNextVersion({
    lead: data.lead,
    solarRequirement:
      data.solarRequirement,
  });

  const totals = calculateTotals({
    components: data.components || [],
    installationCost:
      data.installationCost || 0,
    transportationCost:
      data.transportationCost || 0,
    otherCost:
      data.otherCost || 0,
    discount: data.discount || 0,
    taxPercentage:
      data.taxPercentage || 0,
  });

  const configurationData = {
    lead: data.lead,
    solarRequirement:
      data.solarRequirement,
    customer: data.customer,

    version,

    systemCapacity:
      Number(data.systemCapacity),

    capacityUnit:
      data.capacityUnit || "KW",

    systemType:
      data.systemType,

    phase: data.phase,

    panelCount:
      data.panelCount || 0,

    inverterCount:
      data.inverterCount || 0,

    batteryCount:
      data.batteryCount || 0,

    components:
      totals.components,

    subtotal:
      totals.subtotal,

    installationCost:
      Number(data.installationCost) || 0,

    transportationCost:
      Number(data.transportationCost) || 0,

    otherCost:
      Number(data.otherCost) || 0,

    discount:
      totals.discount,

    taxPercentage:
      totals.taxPercentage,

    taxAmount:
      totals.taxAmount,

    totalAmount:
      totals.totalAmount,

    status:
      data.status || "DRAFT",

    notes: data.notes,

    createdBy,
  };

  const configuration =
    await SystemConfiguration.create(
      configurationData
    );

  return getConfigurationById(
    configuration._id
  );
};

const getConfigurations = async ({
  page = 1,
  limit = 10,
  lead,
  solarRequirement,
  customer,
}) => {
  const filter = {};

  if (lead) {
    filter.lead = lead;
  }

  if (solarRequirement) {
    filter.solarRequirement =
      solarRequirement;
  }

  if (customer) {
    filter.customer = customer;
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
    (pageNumber - 1) * limitNumber;

  const [
    configurations,
    total,
  ] = await Promise.all([
    SystemConfiguration.find(filter)
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "solarRequirement",
        "requiredKw monthlyBill systemType siteAddress"
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    SystemConfiguration.countDocuments(
      filter
    ),
  ]);

  return {
    configurations,
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

const getConfigurationById = async (
  configurationId
) => {
  const configuration =
    await SystemConfiguration.findById(
      configurationId
    )
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "solarRequirement",
        "requiredKw monthlyBill systemType siteAddress"
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

  if (!configuration) {
    const error = new Error(
      "System configuration not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return configuration;
};

const updateConfiguration = async (
  configurationId,
  data,
  updatedBy
) => {
  const configuration =
    await SystemConfiguration.findById(
      configurationId
    );

  if (!configuration) {
    const error = new Error(
      "System configuration not found"
    );

    error.statusCode = 404;

    throw error;
  }

  await validateReferences({
    lead: data.lead,
    solarRequirement:
      data.solarRequirement,
    customer: data.customer,
  });

  const allowedFields = [
    "lead",
    "solarRequirement",
    "customer",
    "systemCapacity",
    "capacityUnit",
    "systemType",
    "phase",
    "panelCount",
    "inverterCount",
    "batteryCount",
    "components",
    "installationCost",
    "transportationCost",
    "otherCost",
    "discount",
    "taxPercentage",
    "status",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      configuration[field] =
        data[field];
    }
  });

  const totals = calculateTotals({
    components:
      configuration.components || [],

    installationCost:
      configuration.installationCost || 0,

    transportationCost:
      configuration.transportationCost || 0,

    otherCost:
      configuration.otherCost || 0,

    discount:
      configuration.discount || 0,

    taxPercentage:
      configuration.taxPercentage || 0,
  });

  configuration.components =
    totals.components;

  configuration.subtotal =
    totals.subtotal;

  configuration.discount =
    totals.discount;

  configuration.taxPercentage =
    totals.taxPercentage;

  configuration.taxAmount =
    totals.taxAmount;

  configuration.totalAmount =
    totals.totalAmount;

  configuration.updatedBy =
    updatedBy;

  await configuration.save();

  return getConfigurationById(
    configuration._id
  );
};

const createNewVersion = async (
  configurationId,
  createdBy
) => {
  const existing =
    await SystemConfiguration.findById(
      configurationId
    ).lean();

  if (!existing) {
    const error = new Error(
      "System configuration not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const version = await getNextVersion({
    lead: existing.lead,
    solarRequirement:
      existing.solarRequirement,
  });

  const newConfiguration = {
    lead: existing.lead,
    solarRequirement:
      existing.solarRequirement,
    customer: existing.customer,

    version,

    systemCapacity:
      existing.systemCapacity,

    capacityUnit:
      existing.capacityUnit,

    systemType:
      existing.systemType,

    phase:
      existing.phase,

    panelCount:
      existing.panelCount || 0,

    inverterCount:
      existing.inverterCount || 0,

    batteryCount:
      existing.batteryCount || 0,

    components:
      existing.components || [],

    subtotal:
      existing.subtotal || 0,

    installationCost:
      existing.installationCost || 0,

    transportationCost:
      existing.transportationCost || 0,

    otherCost:
      existing.otherCost || 0,

    discount:
      existing.discount || 0,

    taxPercentage:
      existing.taxPercentage || 0,

    taxAmount:
      existing.taxAmount || 0,

    totalAmount:
      existing.totalAmount || 0,

    status:
      existing.status || "DRAFT",

    notes:
      existing.notes,

    createdBy,
  };

  const configuration =
    await SystemConfiguration.create(
      newConfiguration
    );

  return getConfigurationById(
    configuration._id
  );
};

const getLatestConfiguration = async ({
  lead,
  solarRequirement,
  customer,
}) => {
  const filter = {};

  if (lead) {
    filter.lead = lead;
  }

  if (solarRequirement) {
    filter.solarRequirement =
      solarRequirement;
  }

  if (customer) {
    filter.customer = customer;
  }

  if (Object.keys(filter).length === 0) {
    const error = new Error(
      "Lead, solar requirement or customer is required"
    );

    error.statusCode = 400;

    throw error;
  }

  const configuration =
    await SystemConfiguration.findOne(filter)
      .sort({ version: -1 })
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "solarRequirement",
        "requiredKw monthlyBill systemType siteAddress"
      )
      .populate(
        "customer",
        "customerId name companyName mobile email status"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .lean();

  if (!configuration) {
    const error = new Error(
      "System configuration not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return configuration;
};

const getConfigurationsByLead = async (
  leadId
) => {
  return SystemConfiguration.find({
    lead: leadId,
  })
    .populate(
      "solarRequirement",
      "requiredKw monthlyBill systemType siteAddress"
    )
    .populate(
      "customer",
      "customerId name companyName mobile email status"
    )
    .sort({ version: -1 })
    .lean();
};

const getConfigurationsByRequirement =
  async (solarRequirementId) => {
    return SystemConfiguration.find({
      solarRequirement:
        solarRequirementId,
    })
      .populate(
        "lead",
        "leadId customerName companyName mobile email status"
      )
      .populate(
        "customer",
        "customerId name companyName mobile email status"
      )
      .sort({ version: -1 })
      .lean();
  };

module.exports = {
  createSystemConfiguration:
    createConfiguration,

  getSystemConfigurations:
    getConfigurations,

  getSystemConfiguration:
    getConfigurationById,

  getSystemConfigurationById:
    getConfigurationById,

  updateSystemConfiguration:
    updateConfiguration,

  getLatestConfigurationByLead:
    getLatestConfiguration,

  getConfigurationsByLead,

  getConfigurationsByRequirement,

  createNewVersion,
};