const SystemConfiguration = require("../models/SystemConfiguration");
const Lead = require("../models/Lead");
const SolarRequirement = require("../models/SolarRequirement");
const Customer = require("../models/Customer");

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const round = (value) => {
  return Number(toNumber(value).toFixed(2));
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/* =========================================================
   FRONTEND -> BACKEND COMPONENT NORMALIZATION
========================================================= */

const COMPONENT_TYPE_MAP = {
  panels: "SOLAR_PANEL",
  inverter: "INVERTER",
  battery: "BATTERY",
  structure: "STRUCTURE",
  accessories: "ACCESSORY",
  installation: "INSTALLATION",
  otherItems: "OTHER",
};

const normalizeComponentItem = (
  item,
  componentType
) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const quantity = Math.max(
    toNumber(
      item.quantity ??
        item.qty ??
        1
    ),
    0
  );

  const unitPrice = Math.max(
    toNumber(
      item.unitPrice ??
        item.rate ??
        item.price ??
        0
    ),
    0
  );

  const discount = Math.max(
    toNumber(
      item.discount ??
        0
    ),
    0
  );

  const tax = Math.max(
    toNumber(
      item.tax ??
        0
    ),
    0
  );

  const totalPrice = round(
    quantity * unitPrice
  );

  return {
    componentType,

    name: String(
      item.name ||
        item.title ||
        item.description ||
        componentType
    ).trim(),

    brand: String(
      item.brand ||
        item.make ||
        item.manufacturer ||
        ""
    ).trim(),

    model: String(
      item.model ||
        item.modelNumber ||
        ""
    ).trim(),

    quantity,

    unit: String(
      item.unit ||
        "PCS"
    ).trim(),

    capacity:
      item.capacity !== undefined &&
      item.capacity !== null &&
      item.capacity !== ""
        ? toNumber(item.capacity)
        : undefined,

    capacityUnit: String(
      item.capacityUnit ||
        ""
    ).trim(),

    unitPrice,

    totalPrice,

    discount,

    tax,

    specifications:
      item.specifications ||
      item.specs ||
      {},

    notes: String(
      item.notes ||
        ""
    ).trim(),
  };
};

/**
 * Converts frontend category based data into
 * canonical backend components[].
 *
 * Supported frontend keys:
 * panels
 * inverter
 * battery
 * structure
 * accessories
 * installation
 * otherItems
 *
 * Also supports already-normalized components[].
 */
const normalizeComponents = (data = {}) => {
  const components = [];

  /**
   * Already normalized backend format.
   */
  if (Array.isArray(data.components)) {
    data.components.forEach((item) => {
      if (!item) return;

      const componentType =
        item.componentType ||
        "OTHER";

      const normalized =
        normalizeComponentItem(
          item,
          componentType
        );

      if (normalized) {
        components.push(normalized);
      }
    });
  }

  /**
   * Frontend category format.
   */
  Object.entries(
    COMPONENT_TYPE_MAP
  ).forEach(
    ([frontendKey, componentType]) => {
      const items = data[frontendKey];

      if (!Array.isArray(items)) {
        return;
      }

      items.forEach((item) => {
        const normalized =
          normalizeComponentItem(
            item,
            componentType
          );

        if (normalized) {
          components.push(normalized);
        }
      });
    }
  );

  return components;
};

/* =========================================================
   CALCULATE COMPONENT TOTALS
========================================================= */

const calculateComponentTotals = (
  components = []
) => {
  let subtotal = 0;

  const normalizedComponents =
    components.map((component) => {
      const quantity = Math.max(
        toNumber(component.quantity),
        0
      );

      const unitPrice = Math.max(
        toNumber(component.unitPrice),
        0
      );

      const totalPrice = round(
        quantity * unitPrice
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
    subtotal: round(subtotal),
  };
};

/* =========================================================
   CALCULATE COMPLETE CONFIGURATION TOTAL
========================================================= */

const calculateTotals = ({
  components = [],
  installationCost = 0,
  transportationCost = 0,
  otherCost = 0,
  discount = 0,
  taxPercentage = 0,
}) => {
  const componentResult =
    calculateComponentTotals(
      components
    );

  const safeInstallationCost =
    Math.max(
      toNumber(installationCost),
      0
    );

  const safeTransportationCost =
    Math.max(
      toNumber(transportationCost),
      0
    );

  const safeOtherCost =
    Math.max(
      toNumber(otherCost),
      0
    );

  const safeDiscount =
    Math.max(
      toNumber(discount),
      0
    );

  const safeTaxPercentage =
    Math.max(
      toNumber(taxPercentage),
      0
    );

  const baseAmount =
    componentResult.subtotal +
    safeInstallationCost +
    safeTransportationCost +
    safeOtherCost;

  const taxableAmount =
    Math.max(
      baseAmount -
        safeDiscount,
      0
    );

  const taxAmount =
    taxableAmount *
    (safeTaxPercentage / 100);

  const totalAmount =
    taxableAmount +
    taxAmount;

  return {
    components:
      componentResult.components,

    subtotal:
      round(baseAmount),

    discount:
      round(safeDiscount),

    taxPercentage:
      round(safeTaxPercentage),

    taxAmount:
      round(taxAmount),

    totalAmount:
      round(
        Math.max(
          totalAmount,
          0
        )
      ),
  };
};

/* =========================================================
   VALIDATE REFERENCES
========================================================= */

const validateReferences = async ({
  lead,
  solarRequirement,
  customer,
}) => {
  if (lead) {
    const leadExists =
      await Lead.exists({
        _id: lead,
      });

    if (!leadExists) {
      throw createError(
        "Lead not found",
        404
      );
    }
  }

  if (solarRequirement) {
    const requirementExists =
      await SolarRequirement.exists({
        _id: solarRequirement,
      });

    if (!requirementExists) {
      throw createError(
        "Solar requirement not found",
        404
      );
    }
  }

  if (customer) {
    const customerExists =
      await Customer.exists({
        _id: customer,
      });

    if (!customerExists) {
      throw createError(
        "Customer not found",
        404
      );
    }
  }
};

/* =========================================================
   VERSION
========================================================= */

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

  if (
    Object.keys(filter).length === 0
  ) {
    return 1;
  }

  const latest =
    await SystemConfiguration.findOne(
      filter
    )
      .sort({
        version: -1,
      })
      .select("version")
      .lean();

  return latest
    ? toNumber(latest.version, 0) + 1
    : 1;
};

/* =========================================================
   CREATE CONFIGURATION
========================================================= */

const createConfiguration = async (
  data,
  createdBy
) => {
  if (!data.lead) {
    throw createError(
      "Lead is required"
    );
  }

  if (!data.solarRequirement) {
    throw createError(
      "Solar requirement is required"
    );
  }

  if (
    data.systemCapacity ===
      undefined ||
    data.systemCapacity ===
      null ||
    data.systemCapacity === ""
  ) {
    throw createError(
      "System capacity is required"
    );
  }

  if (!data.systemType) {
    throw createError(
      "System type is required"
    );
  }

  await validateReferences({
    lead: data.lead,
    solarRequirement:
      data.solarRequirement,
    customer: data.customer,
  });

  const version =
    await getNextVersion({
      lead: data.lead,
      solarRequirement:
        data.solarRequirement,
  });

  /**
   * Convert frontend categories
   * into backend components[].
   */
  const components =
    normalizeComponents(data);

  /**
   * Installation can be supplied either:
   *
   * 1. installationCost
   * 2. installation[]
   */
  let installationCost =
    toNumber(
      data.installationCost
    );

  if (
    installationCost === 0 &&
    Array.isArray(
      data.installation
    )
  ) {
    installationCost =
      data.installation.reduce(
        (total, item) => {
          const quantity =
            Math.max(
              toNumber(
                item?.quantity ??
                  item?.qty ??
                  1
              ),
              0
            );

          const rate =
            Math.max(
              toNumber(
                item?.unitPrice ??
                  item?.rate ??
                  item?.price ??
                  0
              ),
              0
            );

          return (
            total +
            quantity * rate
          );
        },
        0
      );
  }

  const totals =
    calculateTotals({
      components,
      installationCost,
      transportationCost:
        data.transportationCost ||
        0,
      otherCost:
        data.otherCost ||
        0,
      discount:
        data.discount ??
        data.totalDiscount ??
        0,
      taxPercentage:
        data.taxPercentage ??
        0,
    });

  /**
   * Generate configuration number.
   */
  const configurationNumber =
    await generateConfigurationNumber();

  /**
   * Counts are calculated from
   * canonical components.
   */
  const panelCount =
    components
      .filter(
        (item) =>
          item.componentType ===
          "SOLAR_PANEL"
      )
      .reduce(
        (total, item) =>
          total +
          toNumber(
            item.quantity
          ),
        0
      );

  const inverterCount =
    components
      .filter(
        (item) =>
          item.componentType ===
          "INVERTER"
      )
      .reduce(
        (total, item) =>
          total +
          toNumber(
            item.quantity
          ),
        0
      );

  const batteryCount =
    components
      .filter(
        (item) =>
          item.componentType ===
          "BATTERY"
      )
      .reduce(
        (total, item) =>
          total +
          toNumber(
            item.quantity
          ),
        0
      );

  const configurationData = {
    configurationNumber,

    lead:
      data.lead,

    solarRequirement:
      data.solarRequirement,

    customer:
      data.customer ||
      undefined,

    version,

    systemCapacity:
      toNumber(
        data.systemCapacity
      ),

    capacityUnit:
      data.capacityUnit ||
      "KW",

    systemType:
      data.systemType,

    phase:
      data.phase ||
      undefined,

    panelCount,

    inverterCount,

    batteryCount,

    components:
      totals.components,

    subtotal:
      totals.subtotal,

    installationCost:
      Math.max(
        toNumber(
          installationCost
        ),
        0
      ),

    transportationCost:
      Math.max(
        toNumber(
          data.transportationCost
        ),
        0
      ),

    otherCost:
      Math.max(
        toNumber(
          data.otherCost
        ),
        0
      ),

    discount:
      totals.discount,

    taxPercentage:
      totals.taxPercentage,

    taxAmount:
      totals.taxAmount,

    totalAmount:
      totals.totalAmount,

    status:
      data.status ||
      "DRAFT",

    notes:
      data.notes,

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

/* =========================================================
   GET CONFIGURATIONS
========================================================= */

const getConfigurations = async ({
  page = 1,
  limit = 10,
  search,
  customer,
  lead,
  solarRequirement,
  startDate,
  endDate,
} = {}) => {
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

  /**
   * Date filtering.
   */
  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte =
        new Date(
          startDate
        );
    }

    if (endDate) {
      const end =
        new Date(endDate);

      /**
       * Include complete end date.
       */
      end.setHours(
        23,
        59,
        59,
        999
      );

      filter.createdAt.$lte =
        end;
    }
  }

  /**
   * Search across configuration
   * number and related IDs.
   *
   * Since related documents are populated,
   * direct text search on their fields is
   * handled below using aggregation-like
   * lookup IDs.
   */
  if (search) {
    const searchText =
      String(search).trim();

    if (searchText) {
      const regex =
        new RegExp(
          searchText.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          "i"
        );

      const [
        matchingLeads,
        matchingCustomers,
      ] = await Promise.all([
        Lead.find({
          $or: [
            {
              leadId: regex,
            },
            {
              customerName:
                regex,
            },
            {
              companyName:
                regex,
            },
            {
              mobile: regex,
            },
            {
              email: regex,
            },
          ],
        })
          .select("_id")
          .lean(),

        Customer.find({
          $or: [
            {
              customerId:
                regex,
            },
            {
              name: regex,
            },
            {
              companyName:
                regex,
            },
            {
              mobile: regex,
            },
            {
              email: regex,
            },
          ],
        })
          .select("_id")
          .lean(),
      ]);

      const leadIds =
        matchingLeads.map(
          (item) => item._id
        );

      const customerIds =
        matchingCustomers.map(
          (item) => item._id
        );

      filter.$or = [
        {
          configurationNumber:
            regex,
        },
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
      ];
    }
  }

  const pageNumber =
    Math.max(
      Number(page) || 1,
      1
    );

  const limitNumber =
    Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      100
    );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [
    configurations,
    total,
  ] = await Promise.all([
    SystemConfiguration.find(
      filter
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
      )
      .sort({
        createdAt: -1,
      })
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
      totalPages:
        Math.ceil(
          total /
            limitNumber
        ),
    },
  };
};

/* =========================================================
   GET BY ID
========================================================= */

const getConfigurationById =
  async (configurationId) => {
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
      throw createError(
        "System configuration not found",
        404
      );
    }

    return configuration;
  };

/* =========================================================
   UPDATE CONFIGURATION
========================================================= */

const updateConfiguration =
  async (
    configurationId,
    data,
    updatedBy
  ) => {
    const configuration =
      await SystemConfiguration.findById(
        configurationId
      );

    if (!configuration) {
      throw createError(
        "System configuration not found",
        404
      );
    }

    await validateReferences({
      lead:
        data.lead,
      solarRequirement:
        data.solarRequirement,
      customer:
        data.customer,
    });

    /**
     * Update references.
     */
    const referenceFields = [
      "lead",
      "solarRequirement",
      "customer",
      "systemCapacity",
      "capacityUnit",
      "systemType",
      "phase",
      "installationCost",
      "transportationCost",
      "otherCost",
      "discount",
      "taxPercentage",
      "status",
      "notes",
    ];

    referenceFields.forEach(
      (field) => {
        if (
          data[field] !==
          undefined
        ) {
          configuration[
            field
          ] = data[field];
        }
      }
    );

    /**
     * Components:
     *
     * If frontend sends category based
     * arrays, normalize them.
     *
     * If frontend sends components[],
     * use that.
     */
    const hasComponentData =
      Array.isArray(
        data.components
      ) ||
      [
        "panels",
        "inverter",
        "battery",
        "structure",
        "accessories",
        "installation",
        "otherItems",
      ].some(
        (key) =>
          Array.isArray(
            data[key]
          )
      );

    if (hasComponentData) {
      configuration.components =
        normalizeComponents(
          data
        );
    }

    /**
     * Recalculate installation cost
     * if installation[] is sent and
     * installationCost is not explicitly
     * provided.
     */
    if (
      Array.isArray(
        data.installation
      ) &&
      data.installationCost ===
        undefined
    ) {
      const calculatedInstallation =
        data.installation.reduce(
          (
            total,
            item
          ) => {
            const quantity =
              Math.max(
                toNumber(
                  item?.quantity ??
                    item?.qty ??
                    1
                ),
                0
              );

            const rate =
              Math.max(
                toNumber(
                  item?.unitPrice ??
                    item?.rate ??
                    item?.price ??
                    0
                ),
                0
              );

            return (
              total +
              quantity *
                rate
            );
          },
          0
        );

      configuration.installationCost =
        calculatedInstallation;
    }

    /**
     * Recalculate totals.
     */
    const totals =
      calculateTotals({
        components:
          configuration.components ||
          [],

        installationCost:
          configuration.installationCost ||
          0,

        transportationCost:
          configuration.transportationCost ||
          0,

        otherCost:
          configuration.otherCost ||
          0,

        discount:
          configuration.discount ||
          0,

        taxPercentage:
          configuration.taxPercentage ||
          0,
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

    /**
     * Recalculate counts.
     */
    configuration.panelCount =
      configuration.components
        .filter(
          (item) =>
            item.componentType ===
            "SOLAR_PANEL"
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            toNumber(
              item.quantity
            ),
          0
        );

    configuration.inverterCount =
      configuration.components
        .filter(
          (item) =>
            item.componentType ===
            "INVERTER"
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            toNumber(
              item.quantity
            ),
          0
        );

    configuration.batteryCount =
      configuration.components
        .filter(
          (item) =>
            item.componentType ===
            "BATTERY"
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            toNumber(
              item.quantity
            ),
          0
        );

    configuration.updatedBy =
      updatedBy;

    await configuration.save();

    return getConfigurationById(
      configuration._id
    );
  };

/* =========================================================
   CREATE NEW VERSION
========================================================= */

const createNewVersion =
  async (
    configurationId,
    createdBy
  ) => {
    const existing =
      await SystemConfiguration.findById(
        configurationId
      ).lean();

    if (!existing) {
      throw createError(
        "System configuration not found",
        404
      );
    }

    const version =
      await getNextVersion({
        lead:
          existing.lead,

        solarRequirement:
          existing.solarRequirement,
      });

    const configurationNumber =
      await generateConfigurationNumber();

    const newConfiguration = {
      configurationNumber,

      lead:
        existing.lead,

      solarRequirement:
        existing.solarRequirement,

      customer:
        existing.customer,

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
        existing.panelCount ||
        0,

      inverterCount:
        existing.inverterCount ||
        0,

      batteryCount:
        existing.batteryCount ||
        0,

      components:
        existing.components ||
        [],

      subtotal:
        existing.subtotal ||
        0,

      installationCost:
        existing.installationCost ||
        0,

      transportationCost:
        existing.transportationCost ||
        0,

      otherCost:
        existing.otherCost ||
        0,

      discount:
        existing.discount ||
        0,

      taxPercentage:
        existing.taxPercentage ||
        0,

      taxAmount:
        existing.taxAmount ||
        0,

      totalAmount:
        existing.totalAmount ||
        0,

      status:
        existing.status ||
        "DRAFT",

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

/* =========================================================
   GET LATEST
========================================================= */

const getLatestConfiguration =
  async ({
    lead,
    solarRequirement,
    customer,
  } = {}) => {
    const filter = {};

    if (lead) {
      filter.lead = lead;
    }

    if (solarRequirement) {
      filter.solarRequirement =
        solarRequirement;
    }

    if (customer) {
      filter.customer =
        customer;
    }

    if (
      Object.keys(filter).length ===
      0
    ) {
      throw createError(
        "Lead, solar requirement or customer is required"
      );
    }

    const configuration =
      await SystemConfiguration.findOne(
        filter
      )
        .sort({
          version: -1,
        })
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
        .lean();

    if (!configuration) {
      throw createError(
        "System configuration not found",
        404
      );
    }

    return configuration;
  };

/* =========================================================
   GET BY LEAD
========================================================= */

const getConfigurationsByLead =
  async (leadId) => {
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
      .sort({
        version: -1,
      })
      .lean();
  };

/* =========================================================
   GET BY REQUIREMENT
========================================================= */

const getConfigurationsByRequirement =
  async (
    solarRequirementId
  ) => {
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
      .sort({
        version: -1,
      })
      .lean();
  };

/* =========================================================
   CONFIGURATION NUMBER
========================================================= */

const generateConfigurationNumber =
  async () => {
    const last =
      await SystemConfiguration.findOne(
        {
          configurationNumber: {
            $regex:
              /^SC-\d+$/,
          },
        }
      )
        .sort({
          configurationNumber: -1,
        })
        .select(
          "configurationNumber"
        )
        .lean();

    let nextNumber = 1;

    if (
      last?.configurationNumber
    ) {
      const match =
        last.configurationNumber.match(
          /^SC-(\d+)$/
        );

      if (match) {
        nextNumber =
          Number(match[1]) + 1;
      }
    }

    return `SC-${String(
      nextNumber
    ).padStart(5, "0")}`;
  };

/* =========================================================
   EXPORTS
========================================================= */

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

  /**
   * Exported for testing/debugging.
   */
  calculateTotals,

  normalizeComponents,
};