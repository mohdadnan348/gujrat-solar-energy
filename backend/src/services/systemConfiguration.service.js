const SystemConfiguration = require("../models/SystemConfiguration");
const Lead = require("../models/Lead");
const SolarRequirement = require("../models/SolarRequirement");
const Customer = require("../models/Customer");

const calculateItemAmount = (item) => {
  const quantity = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const discount = Number(item.discount) || 0;

  const grossAmount = quantity * rate;
  const discountAmount = (grossAmount * discount) / 100;

  return Math.max(grossAmount - discountAmount, 0);
};

const calculateTotals = (configuration) => {
  const categories = [
    "panels",
    "inverter",
    "battery",
    "structure",
    "accessories",
    "installation",
    "otherItems",
  ];

  let subtotal = 0;
  let totalDiscount = 0;
  let grandTax = 0;

  categories.forEach((category) => {
    const items = configuration[category] || [];

    items.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;
      const tax = Number(item.tax) || 0;

      const grossAmount = quantity * rate;
      const discountAmount = (grossAmount * discount) / 100;
      const amount = Math.max(grossAmount - discountAmount, 0);
      const taxAmount = (amount * tax) / 100;

      item.amount = Number(amount.toFixed(2));

      subtotal += grossAmount;
      totalDiscount += discountAmount;
      grandTax += taxAmount;
    });
  });

  const grandTotal = subtotal - totalDiscount + grandTax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(totalDiscount.toFixed(2)),
    grandTax: Number(grandTax.toFixed(2)),
    grandTotal: Number(Math.max(grandTotal, 0).toFixed(2)),
  };
};

const validateReferences = async ({
  lead,
  solarRequirement,
  customer,
}) => {
  if (lead) {
    const leadExists = await Lead.exists({ _id: lead });

    if (!leadExists) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (solarRequirement) {
    const requirementExists = await SolarRequirement.exists({
      _id: solarRequirement,
    });

    if (!requirementExists) {
      const error = new Error("Solar requirement not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (customer) {
    const customerExists = await Customer.exists({
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
    filter.solarRequirement = solarRequirement;
  }

  if (!lead && !solarRequirement) {
    return 1;
  }

  const latest = await SystemConfiguration.findOne(filter)
    .sort({ version: -1 })
    .select("version")
    .lean();

  return latest ? Number(latest.version) + 1 : 1;
};

const createConfiguration = async (data, createdBy) => {
  await validateReferences({
    lead: data.lead,
    solarRequirement: data.solarRequirement,
    customer: data.customer,
  });

  const version = await getNextVersion({
    lead: data.lead,
    solarRequirement: data.solarRequirement,
  });

  const configurationData = {
    lead: data.lead,
    solarRequirement: data.solarRequirement,
    customer: data.customer,
    version,

    panels: data.panels || [],
    inverter: data.inverter || [],
    battery: data.battery || [],
    structure: data.structure || [],
    accessories: data.accessories || [],
    installation: data.installation || [],
    otherItems: data.otherItems || [],

    notes: data.notes,
    createdBy,
  };

  const totals = calculateTotals(configurationData);

  configurationData.subtotal = totals.subtotal;
  configurationData.discount = totals.discount;
  configurationData.grandTax = totals.grandTax;
  configurationData.grandTotal = totals.grandTotal;

  const configuration = await SystemConfiguration.create(
    configurationData
  );

  return getConfigurationById(configuration._id);
};

const getConfigurations = async ({
  page = 1,
  limit = 10,
  lead,
  solarRequirement,
  customer,
}) => {
  const filter = {};

  if (lead) filter.lead = lead;
  if (solarRequirement) filter.solarRequirement = solarRequirement;
  if (customer) filter.customer = customer;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [configurations, total] = await Promise.all([
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
      .populate("createdBy", "username email role")
      .populate("updatedBy", "username email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    SystemConfiguration.countDocuments(filter),
  ]);

  return {
    configurations,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getConfigurationById = async (configurationId) => {
  const configuration = await SystemConfiguration.findById(
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
    .populate("createdBy", "username email role")
    .populate("updatedBy", "username email role");

  if (!configuration) {
    const error = new Error("System configuration not found");
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
  const configuration = await SystemConfiguration.findById(
    configurationId
  );

  if (!configuration) {
    const error = new Error("System configuration not found");
    error.statusCode = 404;
    throw error;
  }

  await validateReferences({
    lead: data.lead,
    solarRequirement: data.solarRequirement,
    customer: data.customer,
  });

  const allowedFields = [
    "lead",
    "solarRequirement",
    "customer",
    "panels",
    "inverter",
    "battery",
    "structure",
    "accessories",
    "installation",
    "otherItems",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      configuration[field] = data[field];
    }
  });

  const totals = calculateTotals(configuration);

  configuration.subtotal = totals.subtotal;
  configuration.discount = totals.discount;
  configuration.grandTax = totals.grandTax;
  configuration.grandTotal = totals.grandTotal;
  configuration.updatedBy = updatedBy;

  await configuration.save();

  return getConfigurationById(configuration._id);
};

const createNewVersion = async (
  configurationId,
  createdBy
) => {
  const existing = await SystemConfiguration.findById(
    configurationId
  ).lean();

  if (!existing) {
    const error = new Error("System configuration not found");
    error.statusCode = 404;
    throw error;
  }

  const version = await getNextVersion({
    lead: existing.lead,
    solarRequirement: existing.solarRequirement,
  });

  const newConfiguration = {
    lead: existing.lead,
    solarRequirement: existing.solarRequirement,
    customer: existing.customer,
    version,

    panels: existing.panels || [],
    inverter: existing.inverter || [],
    battery: existing.battery || [],
    structure: existing.structure || [],
    accessories: existing.accessories || [],
    installation: existing.installation || [],
    otherItems: existing.otherItems || [],

    subtotal: existing.subtotal || 0,
    discount: existing.discount || 0,
    grandTax: existing.grandTax || 0,
    grandTotal: existing.grandTotal || 0,

    notes: existing.notes,
    createdBy,
  };

  const configuration = await SystemConfiguration.create(
    newConfiguration
  );

  return getConfigurationById(configuration._id);
};

const getLatestConfiguration = async ({
  lead,
  solarRequirement,
  customer,
}) => {
  const filter = {};

  if (lead) filter.lead = lead;
  if (solarRequirement) filter.solarRequirement = solarRequirement;
  if (customer) filter.customer = customer;

  if (Object.keys(filter).length === 0) {
    const error = new Error(
      "Lead, solar requirement or customer is required"
    );
    error.statusCode = 400;
    throw error;
  }

  const configuration = await SystemConfiguration.findOne(filter)
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
    .populate("createdBy", "username email role")
    .lean();

  if (!configuration) {
    const error = new Error("System configuration not found");
    error.statusCode = 404;
    throw error;
  }

  return configuration;
};

const getConfigurationsByLead = async (leadId) => {
  return SystemConfiguration.find({ lead: leadId })
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

const getConfigurationsByRequirement = async (
  solarRequirementId
) => {
  return SystemConfiguration.find({
    solarRequirement: solarRequirementId,
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
  createConfiguration,
  getConfigurations,
  getConfigurationById,
  updateConfiguration,
  createNewVersion,
  getLatestConfiguration,
  getConfigurationsByLead,
  getConfigurationsByRequirement,
  calculateTotals,
};