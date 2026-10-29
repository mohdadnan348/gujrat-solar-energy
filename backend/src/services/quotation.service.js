const Quotation = require("../models/Quotation");
const QuotationItem = require("../models/QuotationItem");
const QuotationBOM = require("../models/QuotationBOM");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const SolarRequirement = require("../models/SolarRequirement");
const SystemConfiguration = require("../models/SystemConfiguration");
const ProposalContent = require("../models/ProposalContent");

const generateNumber = require("../utils/generateNumber");
const { QUOTATION_STATUS } = require("../config/constants");

/* =========================================================
   HELPERS
========================================================= */

const round = (value) =>
  Number(Number(value || 0).toFixed(2));

const calculateItem = (item = {}) => {
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const rate = Math.max(0, Number(item.rate) || 0);
  const discountPercent = Math.min(100, Math.max(0, Number(item.discount) || 0));
  const taxRate = Math.max(0, Number(item.taxRate) || 0);

  const grossAmount = round(quantity * rate);
  const discountAmount = round((grossAmount * discountPercent) / 100);
  const taxableAmount = round(Math.max(grossAmount - discountAmount, 0));
  const taxAmount = round((taxableAmount * taxRate) / 100);

  return {
    grossAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    amount: round(taxableAmount + taxAmount),
  };
};

const calculateTotals = (items = []) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const calculated = calculateItem(item);
    subtotal += calculated.grossAmount;
    totalDiscount += calculated.discountAmount;
    taxableAmount += calculated.taxableAmount;
    totalTax += calculated.taxAmount;
  });

  subtotal = round(subtotal);
  totalDiscount = round(totalDiscount);
  taxableAmount = round(taxableAmount);
  totalTax = round(totalTax);

  return {
    subtotal,
    totalDiscount,
    taxableAmount,
    totalTax,
    grandTotal: round(taxableAmount + totalTax),
  };
};

// A quotation-level flat discount is deducted from the final total after GST.
// Item-level discounts (if any) retain their existing tax treatment.
const applyGlobalDiscount = (totals, requestedDiscount = 0) => {
  const globalDiscount = round(Math.min(
    Math.max(Number(requestedDiscount) || 0, 0),
    Math.max(Number(totals.subtotal) || 0, 0)
  ));
  return {
    ...totals,
    totalDiscount: round((Number(totals.totalDiscount) || 0) + globalDiscount),
    grandTotal: round(Math.max(
      (Number(totals.taxableAmount) || 0) + (Number(totals.totalTax) || 0) - globalDiscount,
      0
    )),
  };
};

/* =========================================================
   EMPLOYEE BUSINESS SCOPE
========================================================= */

const getEmployeeScope = async (userId) => {
  if (!userId) {
    return {
      leadIds: [],
      customerIds: [],
      quotationIds: [],
    };
  }

  const employee = await Employee.findOne({
    user: userId,
  })
    .select("_id")
    .lean();

  const employeeId = employee?._id;

  /*
   * Employee ke:
   * 1. created leads
   * 2. assigned leads
   */
  const leadOrConditions = [
    {
      createdBy: userId,
    },
  ];

  if (employeeId) {
    leadOrConditions.push({
      assignedTo: employeeId,
    });
  }

  const leads = await Lead.find({
    $or: leadOrConditions,
  })
    .select("_id")
    .lean();

  const leadIds = leads.map(
    (lead) => lead._id
  );

  /*
   * Employee ke accessible customers:
   * - createdBy employee
   * - employee ke leads se linked customers
   */
  const customerOrConditions = [
    {
      createdBy: userId,
    },
  ];

  if (leadIds.length) {
    customerOrConditions.push({
      lead: {
        $in: leadIds,
      },
    });
  }

  const customers = await Customer.find({
    $or: customerOrConditions,
  })
    .select("_id")
    .lean();

  const customerIds = customers.map(
    (customer) => customer._id
  );

  /*
   * Employee ki quotations:
   * - createdBy employee
   * - employee ke leads
   * - employee ke customers
   */
  const quotationOrConditions = [
    {
      createdBy: userId,
    },
  ];

  if (leadIds.length) {
    quotationOrConditions.push({
      lead: {
        $in: leadIds,
      },
    });
  }

  if (customerIds.length) {
    quotationOrConditions.push({
      customer: {
        $in: customerIds,
      },
    });
  }

  const quotations = await Quotation.find({
    $or: quotationOrConditions,
  })
    .select("_id")
    .lean();

  const quotationIds = quotations.map(
    (quotation) => quotation._id
  );

  return {
    employeeId,
    leadIds,
    customerIds,
    quotationIds,
  };
};

/* =========================================================
   REFERENCE VALIDATION
========================================================= */

const validateReferences = async (data = {}) => {
  if (data.lead) {
    const exists = await Lead.exists({
      _id: data.lead,
    });

    if (!exists) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.customer) {
    const exists = await Customer.exists({
      _id: data.customer,
    });

    if (!exists) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.solarRequirement) {
    const exists =
      await SolarRequirement.exists({
        _id: data.solarRequirement,
      });

    if (!exists) {
      const error = new Error(
        "Solar requirement not found"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.systemConfiguration) {
    const exists =
      await SystemConfiguration.exists({
        _id: data.systemConfiguration,
      });

    if (!exists) {
      const error = new Error(
        "System configuration not found"
      );
      error.statusCode = 404;
      throw error;
    }
  }
};

/* =========================================================
   QUOTATION NUMBER
========================================================= */

const getNextQuotationNumber = async () => {
  return generateNumber({
    Model: Quotation,
    field: "quotationNumber",
    prefix: "EST",
    padding: 5,
    start: 1,
  });
};

/* =========================================================
   CUSTOMER SNAPSHOT
========================================================= */

const buildCustomerSnapshot = (
  customer,
  lead
) => {
  const source = customer || lead;

  if (!source) {
    return {};
  }

  return {
    name: customer
      ? customer.name
      : lead?.customerName,

    companyName:
      customer?.companyName ||
      lead?.companyName ||
      "",

    mobile:
      customer?.mobile ||
      lead?.mobile,

    alternateMobile:
      customer?.alternateMobile ||
      lead?.alternateMobile,

    email:
      customer?.email ||
      lead?.email,

    address:
      customer?.address ||
      lead?.address,

    city:
      customer?.city ||
      lead?.city,

    state:
      customer?.state ||
      lead?.state,

    pincode:
      customer?.pincode ||
      lead?.pincode,

    gstNumber:
      customer?.gstNumber ||
      customer?.gstin ||
      lead?.gstNumber ||
      lead?.gstin ||
      "",
  };
};

const getActiveProposalContent =
  async () => {
    return ProposalContent.findOne({
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();
  };

/* =========================================================
   CREATE QUOTATION
========================================================= */

const createQuotation = async (
  data,
  createdBy
) => {
  if (!createdBy) {
    const error = new Error(
      "Authenticated user ID is required to create quotation"
    );

    error.statusCode = 401;
    throw error;
  }

  // The create-quotation screen can submit the requirement and system
  // configuration inline. Persist those supporting records here so the user
  // does not need to visit separate modules. Existing references still work.
  if (data.customer && data.inlineSolarRequirement) {
    const customerRecord = await Customer.findById(data.customer).lean();
    if (!customerRecord) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }

    const requirementInput = data.inlineSolarRequirement;
    const requirement = await SolarRequirement.create({
      lead: data.lead || customerRecord.lead || undefined,
      customer: data.customer,
      status: "PENDING",
      requiredKw: Number(requirementInput.requiredKw || data.plantDetails?.capacityKw || 0),
      monthlyBill: Number(requirementInput.monthlyBill || 0),
      monthlyUnits: Number(requirementInput.monthlyUnits || 0),
      roofType: requirementInput.roofType || "",
      roofArea: Number(requirementInput.roofArea || 0),
      siteAddress: requirementInput.siteAddress || customerRecord.siteAddress || customerRecord.address || "",
      location: requirementInput.location || customerRecord.city || "",
      connectionType: requirementInput.connectionType || "",
      sanctionedLoad: Number(requirementInput.sanctionedLoad || 0),
      systemType: ({ ON_GRID: "On-grid", OFF_GRID: "Off-grid", HYBRID: "Hybrid" })[requirementInput.systemType] || requirementInput.systemType || data.plantDetails?.systemType || "On-grid",
      batteryRequired: Boolean(requirementInput.batteryRequired),
      batteryCapacity: Number(requirementInput.batteryCapacity || 0),
      siteSurveyRequired: requirementInput.siteSurveyRequired !== false,
      siteSurveyCompleted: Boolean(requirementInput.siteSurveyCompleted),
      notes: requirementInput.notes || "",
      createdBy,
    });
    data.solarRequirement = requirement._id;

    if (data.inlineSystemConfiguration) {
      const configInput = data.inlineSystemConfiguration;
      const sourceComponents = Array.isArray(configInput.components) ? configInput.components : [];
      const components = sourceComponents.map((component) => {
        const name = String(component.name || component.description || "Solar Component");
        const normalizedName = name.toLowerCase();
        let componentType = component.componentType;

        // The create-quotation form sends line items as OTHER. Infer their
        // real type from the item description so counts and technical views
        // can use the canonical component structure.
        if (!["SOLAR_PANEL", "INVERTER", "BATTERY", "STRUCTURE", "ACCESSORY", "INSTALLATION", "OTHER"].includes(componentType) || componentType === "OTHER") {
          if (/solar panel|photovoltaic panel|pv panel/.test(normalizedName)) componentType = "SOLAR_PANEL";
          else if (/inverter/.test(normalizedName)) componentType = "INVERTER";
          else if (/battery/.test(normalizedName)) componentType = "BATTERY";
          else if (/mounting structure|gi structure|aluminium structure|ground mount/.test(normalizedName)) componentType = "STRUCTURE";
          else if (/installation|commissioning/.test(normalizedName)) componentType = "INSTALLATION";
          else if (/cable|earthing|protection|accessor/.test(normalizedName)) componentType = "ACCESSORY";
          else componentType = "OTHER";
        }

        const quantity = Math.max(0, Number(component.quantity || 1));
        const unitPrice = Math.max(0, Number(component.unitPrice || component.rate || 0));
        return {
          componentType,
          name,
          brand: component.brand || (
            componentType === "SOLAR_PANEL" ? configInput.panelMake :
            componentType === "INVERTER" ? configInput.inverterMake :
            componentType === "BATTERY" ? configInput.batteryMake : ""
          ) || "",
          model: component.model || (
            componentType === "SOLAR_PANEL" ? configInput.panelModel :
            componentType === "INVERTER" ? configInput.inverterModel :
            componentType === "BATTERY" ? configInput.batteryModel : ""
          ) || "",
          quantity,
          unit: component.unit || "Unit",
          unitPrice,
          totalPrice: quantity * unitPrice,
          tax: Math.max(0, Number(component.tax || component.taxRate || 0)),
        };
      });
      const componentSubtotal = components.reduce((sum, component) => sum + component.totalPrice, 0);
      const installationCost = Math.max(0, Number(configInput.installationCost || 0));
      const transportationCost = Math.max(0, Number(configInput.transportationCost || 0));
      const otherCost = Math.max(0, Number(configInput.otherCost || 0));
      const configNumber = `SC-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
      const configuration = await SystemConfiguration.create({
        configurationNumber: configNumber,
        version: 1,
        lead: data.lead || customerRecord.lead || undefined,
        solarRequirement: requirement._id,
        customer: data.customer,
        systemCapacity: Math.max(0, Number(configInput.systemCapacity || requirementInput.requiredKw || 0)),
        capacityUnit: configInput.capacityUnit || "KW",
        systemType: configInput.systemType || requirementInput.systemType || "ON_GRID",
        phase: configInput.phase || undefined,
        panelMake: configInput.panelMake || "",
        panelModel: configInput.panelModel || "",
        panelWattage: Math.max(0, Number(configInput.panelWattage || 0)),
        panelCapacity: Math.round((Math.max(0, Number(configInput.panelCount || 0)) * Math.max(0, Number(configInput.panelWattage || 0)) / 1000) * 100) / 100,
        panelCount: Math.max(0, Number(configInput.panelCount || 0)),
        inverterMake: configInput.inverterMake || "",
        inverterModel: configInput.inverterModel || "",
        inverterCapacity: String(configInput.inverterCapacity || ""),
        batteryRequired: Boolean(requirementInput.batteryRequired),
        batteryCapacity: Math.max(0, Number(configInput.batteryCapacity || requirementInput.batteryCapacity || 0)),
        mountingStructure: configInput.mountingStructure || "",
        cable: components.filter((item) => /cable/i.test(item.name)).map((item) => item.name).join(", "),
        earthing: components.filter((item) => /earthing/i.test(item.name)).map((item) => item.name).join(", "),
        protection: components.filter((item) => /protection|accessor/i.test(item.name)).map((item) => item.name).join(", "),
        inverterCount: components.some((item) => item.componentType === "INVERTER")
          ? components.filter((item) => item.componentType === "INVERTER").reduce((sum, item) => sum + item.quantity, 0)
          : (configInput.inverterMake || configInput.inverterModel || configInput.inverterCapacity ? 1 : 0),
        batteryCount: components.filter((item) => item.componentType === "BATTERY").reduce((sum, item) => sum + item.quantity, 0),
        components,
        subtotal: componentSubtotal + installationCost + transportationCost + otherCost,
        installationCost,
        transportationCost,
        otherCost,
        discount: 0,
        taxPercentage: 0,
        taxAmount: 0,
        totalAmount: componentSubtotal + installationCost + transportationCost + otherCost,
        status: "DRAFT",
        notes: [configInput.panelMake && `Panel: ${configInput.panelMake}`, configInput.panelModel && `Panel model: ${configInput.panelModel}`, configInput.panelWattage && `Panel wattage: ${configInput.panelWattage}W`, configInput.inverterMake && `Inverter: ${configInput.inverterMake}`, configInput.inverterModel && `Inverter model: ${configInput.inverterModel}`, configInput.inverterCapacity && `Inverter capacity: ${configInput.inverterCapacity}`, configInput.batteryMake && `Battery: ${configInput.batteryMake}`, configInput.batteryModel && `Battery model: ${configInput.batteryModel}`, configInput.mountingStructure && `Structure: ${configInput.mountingStructure}`, configInput.notes].filter(Boolean).join(" | "),
        createdBy,
      });
      data.systemConfiguration = configuration._id;
    }
  }

  await validateReferences(data);

  let lead = null;
  let customer = null;
  let solarRequirement = null;
  let systemConfiguration = null;

  if (data.lead) {
    lead = await Lead.findById(
      data.lead
    ).lean();
  }

  if (data.customer) {
    customer = await Customer.findById(
      data.customer
    ).lean();
  }

  if (data.solarRequirement) {
    solarRequirement =
      await SolarRequirement.findById(
        data.solarRequirement
      ).lean();
  }

  if (data.systemConfiguration) {
    systemConfiguration =
      await SystemConfiguration.findById(
        data.systemConfiguration
      ).lean();
  }

  const quotationNumber =
    await getNextQuotationNumber();

  const items = (data.items || []).map(
    (item, index) => {
      const calculated =
        calculateItem(item);

      return {
        ...item,

        taxableAmount:
          calculated.taxableAmount,

        taxAmount:
          calculated.taxAmount,

        amount:
          calculated.amount,

        sortOrder:
          item.sortOrder !== undefined
            ? item.sortOrder
            : index,

        createdBy,
      };
    }
  );

  const totals = applyGlobalDiscount(
    calculateTotals(items),
    data.globalDiscount
  );

  const activeProposal =
    await getActiveProposalContent();

  const proposalContent =
    data.proposalContent ||
    activeProposal?._id;

  const rawCustomerDetails =
    data.customerDetails ||
    buildCustomerSnapshot(customer, lead);

  // Normalize customer snapshot aliases to the Quotation schema fields.
  const customerDetails = {
    ...rawCustomerDetails,
    companyName: rawCustomerDetails.companyName || rawCustomerDetails.company || "",
    gstNumber: rawCustomerDetails.gstNumber || rawCustomerDetails.gstin || rawCustomerDetails.gst || "",
  };

  const quotation =
    await Quotation.create({
      quotationNumber,

      lead: data.lead,

      customer: data.customer,

      solarRequirement:
        data.solarRequirement,

      systemConfiguration:
        data.systemConfiguration,

      revisionNumber:
        data.revisionNumber || 1,

      status:
        data.status ||
        QUOTATION_STATUS.DRAFT,

      quotationDate:
        data.quotationDate ||
        new Date(),

      validUntil:
        data.validUntil,

      plantDetails: {
        capacityKw:
          data.plantDetails
            ?.capacityKw ??
          solarRequirement?.requiredKw,

        systemType:
          data.plantDetails
            ?.systemType ??
          solarRequirement
            ?.systemType ??
          "",

        description:
          data.plantDetails
            ?.description,
      },

      customerDetails,

      subtotal:
        totals.subtotal,

      totalDiscount:
        totals.totalDiscount,

      taxableAmount:
        totals.taxableAmount,

      totalTax:
        totals.totalTax,

      cgst:
        Number(data.cgst) || 0,

      sgst:
        Number(data.sgst) || 0,

      igst:
        Number(data.igst) || 0,

      grandTotal:
        totals.grandTotal,

      proposalContent,

      proposalTitle:
        data.proposalTitle,

      companyIntroduction:
        data.companyIntroduction,

      subsidyDetails:
        data.subsidyDetails,

      installationSchedule:
        data.installationSchedule,

      warrantyDetails:
        data.warrantyDetails,

      scopeOfWork:
        data.scopeOfWork,

      paymentTerms:
        data.paymentTerms,

      quotationTerms:
        data.quotationTerms,

      warrantyExclusions:
        data.warrantyExclusions,

      notes:
        data.notes,

      productPhotos:
        data.productPhotos || [],

      documents:
        data.documents || [],

      createdBy,
    });

  if (items.length) {
    await QuotationItem.insertMany(
      items.map((item) => ({
        quotation:
          quotation._id,
        ...item,
      }))
    );
  }

  if (data.bom?.length) {
    await QuotationBOM.insertMany(
      data.bom.map((item, index) => ({
        quotation:
          quotation._id,

        ...item,

        srNo:
          item.srNo !== undefined
            ? item.srNo
            : index + 1,

        sortOrder:
          item.sortOrder !== undefined
            ? item.sortOrder
            : index,

        createdBy,
      }))
    );
  }

  return getQuotationById(
    quotation._id
  );
};

/* =========================================================
   GET QUOTATIONS
========================================================= */

const getQuotations = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  lead,
  customer,
  userId,
  role,
} = {}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (lead) {
    filter.lead = lead;
  }

  if (customer) {
    filter.customer = customer;
  }

  if (search) {
    filter.$or = [
      {
        quotationNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        "customerDetails.name": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "customerDetails.company": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "customerDetails.mobile": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  /*
   * =======================================================
   * EMPLOYEE SCOPE
   * =======================================================
   */
  if (
    String(role || "").toUpperCase() ===
    "EMPLOYEE"
  ) {
    const scope =
      await getEmployeeScope(userId);

    const employeeConditions = [
      {
        createdBy: userId,
      },
    ];

    if (scope.leadIds.length) {
      employeeConditions.push({
        lead: {
          $in: scope.leadIds,
        },
      });
    }

    if (scope.customerIds.length) {
      employeeConditions.push({
        customer: {
          $in: scope.customerIds,
        },
      });
    }

    /*
     * Existing filters + employee scope
     */
    const normalFilter = {
      ...filter,
    };

    delete normalFilter.$or;

    const employeeScopeFilter = {
      $or: employeeConditions,
    };

    if (search) {
      filter.$and = [
        normalFilter,
        employeeScopeFilter,
        {
          $or: [
            {
              quotationNumber: {
                $regex: search,
                $options: "i",
              },
            },
            {
              "customerDetails.name": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "customerDetails.company": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "customerDetails.mobile": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      ];
    } else {
      filter.$and = [
        normalFilter,
        employeeScopeFilter,
      ];
    }
  }

  const pageNumber = Math.max(
    Number(page) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [quotations, total] =
    await Promise.all([
      Quotation.find(filter)
        .populate(
          "lead",
          "leadId customerName companyName mobile status"
        )
        .populate(
          "customer",
          "customerId name companyName mobile status"
        )
        .populate(
          "solarRequirement",
          "requiredKw systemType siteAddress"
        )
        .populate(
          "systemConfiguration",
          "configurationNumber systemCapacity capacityUnit systemType totalAmount"
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
          quotationDate: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Quotation.countDocuments(filter),
    ]);

  return {
    quotations,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,

      totalPages:
        Math.ceil(
          total / limitNumber
        ),

      hasNextPage:
        pageNumber * limitNumber <
        total,

      hasPreviousPage:
        pageNumber > 1,
    },
  };
};

/* =========================================================
   GET QUOTATION BY ID
========================================================= */

const getQuotationById = async (
  quotationId
) => {
  const quotation =
    await Quotation.findById(
      quotationId
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
        "solarRequirement",
        "requiredKw monthlyBill systemType siteAddress"
      )
      .populate(
        "systemConfiguration",
        "configurationNumber systemCapacity capacityUnit systemType totalAmount"
      )
      .populate(
        "proposalContent"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      );

  if (!quotation) {
    const error = new Error(
      "Quotation not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const [items, bom] =
    await Promise.all([
      QuotationItem.find({
        quotation:
          quotation._id,
      })
        .sort({
          sortOrder: 1,
        })
        .lean(),

      QuotationBOM.find({
        quotation:
          quotation._id,
      })
        .sort({
          sortOrder: 1,
          srNo: 1,
        })
        .lean(),
    ]);

  return {
    quotation,
    items,
    bom,
  };
};

/* =========================================================
   UPDATE QUOTATION
========================================================= */

const updateQuotation = async (
  quotationId,
  data,
  updatedBy
) => {
  if (!updatedBy) {
    const error = new Error(
      "Authenticated user ID is required to update quotation"
    );

    error.statusCode = 401;
    throw error;
  }

  const quotation =
    await Quotation.findById(
      quotationId
    );

  if (!quotation) {
    const error = new Error(
      "Quotation not found"
    );

    error.statusCode = 404;
    throw error;
  }

  if (
    quotation.status ===
    QUOTATION_STATUS.ACCEPTED
  ) {
    const error = new Error(
      "Accepted quotation cannot be edited"
    );

    error.statusCode = 400;
    throw error;
  }

  await validateReferences(data);

  const allowedFields = [
    "lead",
    "customer",
    "solarRequirement",
    "systemConfiguration",
    "validUntil",
    "plantDetails",
    "customerDetails",
    "proposalContent",
    "proposalTitle",
    "companyIntroduction",
    "subsidyDetails",
    "installationSchedule",
    "warrantyDetails",
    "scopeOfWork",
    "paymentTerms",
    "quotationTerms",
    "warrantyExclusions",
    "notes",
    "productPhotos",
    "documents",
  ];

  allowedFields.forEach(
    (field) => {
      if (
        data[field] !== undefined
      ) {
        quotation[field] =
          data[field];
      }
    }
  );

  if (data.status !== undefined) {
    quotation.status =
      data.status;
  }

  if (
    data.quotationDate !==
    undefined
  ) {
    quotation.quotationDate =
      data.quotationDate;
  }

  quotation.updatedBy =
    updatedBy;

  if (data.items) {
    await QuotationItem.deleteMany({
      quotation:
        quotation._id,
    });

    const items = data.items.map(
      (item, index) => {
        const calculated =
          calculateItem(item);

        return {
          quotation:
            quotation._id,

          ...item,

          taxableAmount:
            calculated.taxableAmount,

          taxAmount:
            calculated.taxAmount,

          amount:
            calculated.amount,

          sortOrder:
            item.sortOrder !==
            undefined
              ? item.sortOrder
              : index,

          createdBy:
            updatedBy,
        };
      }
    );

    await QuotationItem.insertMany(
      items
    );

    const totals = applyGlobalDiscount(
      calculateTotals(items),
      data.globalDiscount
    );

    quotation.subtotal =
      totals.subtotal;

    quotation.totalDiscount =
      totals.totalDiscount;

    quotation.taxableAmount =
      totals.taxableAmount;

    quotation.totalTax =
      totals.totalTax;

    quotation.grandTotal =
      totals.grandTotal;
  }

  if (data.bom) {
    await QuotationBOM.deleteMany({
      quotation:
        quotation._id,
    });

    if (data.bom.length) {
      await QuotationBOM.insertMany(
        data.bom.map(
          (item, index) => ({
            quotation:
              quotation._id,

            ...item,

            srNo:
              item.srNo !==
              undefined
                ? item.srNo
                : index + 1,

            sortOrder:
              item.sortOrder !==
              undefined
                ? item.sortOrder
                : index,

            createdBy:
              updatedBy,
          })
        )
      );
    }
  }

  await quotation.save();

  return getQuotationById(
    quotation._id
  );
};

/* =========================================================
   UPDATE STATUS
========================================================= */

const updateQuotationStatus =
  async (
    quotationId,
    status,
    updatedBy,
    extraData = {}
  ) => {
    if (!updatedBy) {
      const error = new Error(
        "Authenticated user ID is required"
      );

      error.statusCode = 401;
      throw error;
    }

    if (
      !Object.values(
        QUOTATION_STATUS
      ).includes(status)
    ) {
      const error = new Error(
        "Invalid quotation status"
      );

      error.statusCode = 400;
      throw error;
    }

    const quotation =
      await Quotation.findById(
        quotationId
      );

    if (!quotation) {
      const error = new Error(
        "Quotation not found"
      );

      error.statusCode = 404;
      throw error;
    }

    quotation.status =
      status;

    quotation.updatedBy =
      updatedBy;

    if (
      status ===
      QUOTATION_STATUS.SENT
    ) {
      quotation.sentAt =
        new Date();
    }

    if (
      status ===
      QUOTATION_STATUS.ACCEPTED
    ) {
      quotation.acceptedAt =
        new Date();
    }

    if (
      status ===
      QUOTATION_STATUS.REJECTED
    ) {
      quotation.rejectedAt =
        new Date();

      quotation.rejectionReason =
        extraData.rejectionReason;
    }

    if (
      status ===
      QUOTATION_STATUS.EXPIRED
    ) {
      quotation.expiredAt =
        new Date();
    }

    await quotation.save();

    return getQuotationById(
      quotation._id
    );
  };

/* =========================================================
   STATUS HELPERS
========================================================= */

const sendQuotation = async (
  quotationId,
  updatedBy
) => {
  return updateQuotationStatus(
    quotationId,
    QUOTATION_STATUS.SENT,
    updatedBy
  );
};

const acceptQuotation = async (
  quotationId,
  updatedBy
) => {
  return updateQuotationStatus(
    quotationId,
    QUOTATION_STATUS.ACCEPTED,
    updatedBy
  );
};

const rejectQuotation = async (
  quotationId,
  rejectionReason,
  updatedBy
) => {
  return updateQuotationStatus(
    quotationId,
    QUOTATION_STATUS.REJECTED,
    updatedBy,
    {
      rejectionReason,
    }
  );
};

const expireQuotation = async (
  quotationId,
  updatedBy
) => {
  return updateQuotationStatus(
    quotationId,
    QUOTATION_STATUS.EXPIRED,
    updatedBy
  );
};

/* =========================================================
   ITEMS / BOM
========================================================= */

const getQuotationItems = async (
  quotationId
) => {
  return QuotationItem.find({
    quotation: quotationId,
  })
    .sort({
      sortOrder: 1,
    })
    .lean();
};

const getQuotationBOM = async (
  quotationId
) => {
  return QuotationBOM.find({
    quotation: quotationId,
  })
    .sort({
      sortOrder: 1,
      srNo: 1,
    })
    .lean();
};

/* =========================================================
   LEAD / CUSTOMER
========================================================= */

const getQuotationsByLead =
  async (leadId) => {
    return Quotation.find({
      lead: leadId,
    })
      .populate(
        "customer",
        "customerId name companyName mobile"
      )
      .sort({
        revisionNumber: -1,
        quotationDate: -1,
      })
      .lean();
  };

const getQuotationsByCustomer =
  async (customerId) => {
    return Quotation.find({
      customer: customerId,
    })
      .sort({
        revisionNumber: -1,
        quotationDate: -1,
      })
      .lean();
  };

/* =========================================================
   DELETE / DEACTIVATE
========================================================= */

const deleteQuotation = async (
  quotationId,
  updatedBy
) => {
  if (!updatedBy) {
    const error = new Error(
      "Authenticated user ID is required"
    );

    error.statusCode = 401;
    throw error;
  }

  const quotation =
    await Quotation.findById(
      quotationId
    );

  if (!quotation) {
    const error = new Error(
      "Quotation not found"
    );

    error.statusCode = 404;
    throw error;
  }

  if (
    quotation.status ===
    QUOTATION_STATUS.ACCEPTED
  ) {
    const error = new Error(
      "Accepted quotation cannot be deleted"
    );

    error.statusCode = 400;
    throw error;
  }

  quotation.status =
    QUOTATION_STATUS.REJECTED;

  quotation.rejectionReason =
    "Quotation deactivated";

  quotation.rejectedAt =
    new Date();

  quotation.updatedBy =
    updatedBy;

  await quotation.save();

  return {
    message:
      "Quotation deactivated successfully",
  };
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  updateQuotationStatus,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  expireQuotation,
  getQuotationItems,
  getQuotationBOM,
  getQuotationsByLead,
  getQuotationsByCustomer,
  markExpiredQuotations:
    expireQuotation,
  deleteQuotation,
  calculateItem,
  calculateTotals,
  getEmployeeScope,
};