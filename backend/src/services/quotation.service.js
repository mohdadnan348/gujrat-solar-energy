const Quotation = require("../models/Quotation");
const QuotationItem = require("../models/QuotationItem");
const QuotationBOM = require("../models/QuotationBOM");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const SolarRequirement = require("../models/SolarRequirement");
const SystemConfiguration = require("../models/SystemConfiguration");
const ProposalContent = require("../models/ProposalContent");

const { generateNumber } = require("../utils/generateNumber");
const { QUOTATION_STATUS } = require("../config/constants");

const round = (value) => Number(Number(value || 0).toFixed(2));

const calculateItem = (item) => {
  const quantity = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const discountPercent = Number(item.discount) || 0;
  const taxRate = Number(item.taxRate) || 0;

  const grossAmount = quantity * rate;
  const discountAmount =
    (grossAmount * discountPercent) / 100;

  const taxableAmount = Math.max(
    grossAmount - discountAmount,
    0
  );

  const taxAmount = (taxableAmount * taxRate) / 100;

  return {
    taxableAmount: round(taxableAmount),
    taxAmount: round(taxAmount),
    amount: round(taxableAmount + taxAmount),
  };
};

const calculateTotals = (items = []) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discountPercent = Number(item.discount) || 0;

    const grossAmount = quantity * rate;
    const discountAmount =
      (grossAmount * discountPercent) / 100;

    const calculated = calculateItem(item);

    subtotal += grossAmount;
    totalDiscount += discountAmount;
    taxableAmount += calculated.taxableAmount;
    totalTax += calculated.taxAmount;
  });

  return {
    subtotal: round(subtotal),
    totalDiscount: round(totalDiscount),
    taxableAmount: round(taxableAmount),
    totalTax: round(totalTax),
    grandTotal: round(taxableAmount + totalTax),
  };
};

const validateReferences = async (data) => {
  if (data.lead) {
    const exists = await Lead.exists({ _id: data.lead });

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
    const exists = await SolarRequirement.exists({
      _id: data.solarRequirement,
    });

    if (!exists) {
      const error = new Error("Solar requirement not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.systemConfiguration) {
    const exists = await SystemConfiguration.exists({
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

const getNextQuotationNumber = async () => {
  return generateNumber(
    Quotation,
    "quotationNumber",
    "EST"
  );
};

const buildCustomerSnapshot = (customer, lead) => {
  const source = customer || lead;

  if (!source) {
    return {};
  }

  return {
    name: customer
      ? customer.name
      : lead?.customerName,
    company:
      customer?.companyName || lead?.companyName,
    mobile: customer?.mobile || lead?.mobile,
    alternateMobile:
      customer?.alternateMobile || lead?.alternateMobile,
    email: customer?.email || lead?.email,
    address: customer?.address || lead?.address,
    city: customer?.city || lead?.city,
    state: customer?.state || lead?.state,
    pincode: customer?.pincode || lead?.pincode,
    gst:
      customer?.gstNumber ||
      undefined,
  };
};

const getActiveProposalContent = async () => {
  return ProposalContent.findOne({
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .lean();
};

const createQuotation = async (data, createdBy) => {
  await validateReferences(data);

  let lead = null;
  let customer = null;
  let solarRequirement = null;
  let systemConfiguration = null;

  if (data.lead) {
    lead = await Lead.findById(data.lead).lean();
  }

  if (data.customer) {
    customer = await Customer.findById(data.customer).lean();
  }

  if (data.solarRequirement) {
    solarRequirement = await SolarRequirement.findById(
      data.solarRequirement
    ).lean();
  }

  if (data.systemConfiguration) {
    systemConfiguration =
      await SystemConfiguration.findById(
        data.systemConfiguration
      ).lean();
  }

  const quotationNumber = await getNextQuotationNumber();

  const items = (data.items || []).map((item, index) => {
    const calculated = calculateItem(item);

    return {
      ...item,
      taxableAmount: calculated.taxableAmount,
      taxAmount: calculated.taxAmount,
      amount: calculated.amount,
      sortOrder:
        item.sortOrder !== undefined
          ? item.sortOrder
          : index,
      createdBy,
    };
  });

  const totals = calculateTotals(items);

  const proposalContent =
    data.proposalContent ||
    (await getActiveProposalContent())?._id;

  const customerDetails =
    data.customerDetails ||
    buildCustomerSnapshot(customer, lead);

  const quotation = await Quotation.create({
    quotationNumber,
    lead: data.lead,
    customer: data.customer,
    solarRequirement: data.solarRequirement,
    systemConfiguration: data.systemConfiguration,

    revisionNumber: data.revisionNumber || 1,

    status:
      data.status || QUOTATION_STATUS.DRAFT,

    quotationDate:
      data.quotationDate || new Date(),

    validUntil: data.validUntil,

    plantDetails: {
      capacityKw:
        data.plantDetails?.capacityKw ??
        solarRequirement?.requiredKw,

      systemType:
        data.plantDetails?.systemType ??
        solarRequirement?.systemType ??
        "",

      description:
        data.plantDetails?.description,
    },

    customerDetails,

    subtotal: totals.subtotal,
    discount: totals.totalDiscount,
    taxableAmount: totals.taxableAmount,
    totalTax: totals.totalTax,
    cgst: data.cgst || 0,
    sgst: data.sgst || 0,
    igst: data.igst || 0,
    grandTotal: totals.grandTotal,

    proposalContent,

    proposalTitle: data.proposalTitle,
    companyIntroduction:
      data.companyIntroduction,
    subsidyDetails: data.subsidyDetails,
    installationSchedule:
      data.installationSchedule,
    warrantyDetails: data.warrantyDetails,
    scopeOfWork: data.scopeOfWork,
    paymentTerms: data.paymentTerms,
    quotationTerms: data.quotationTerms,
    warrantyExclusions:
      data.warrantyExclusions,
    notes: data.notes,

    productPhotos: data.productPhotos || [],
    documents: data.documents || [],

    createdBy,
  });

  if (items.length) {
    await QuotationItem.insertMany(
      items.map((item) => ({
        quotation: quotation._id,
        ...item,
      }))
    );
  }

  if (data.bom?.length) {
    await QuotationBOM.insertMany(
      data.bom.map((item, index) => ({
        quotation: quotation._id,
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

  return getQuotationById(quotation._id);
};

const getQuotations = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  lead,
  customer,
}) => {
  const filter = {};

  if (status) filter.status = status;
  if (lead) filter.lead = lead;
  if (customer) filter.customer = customer;

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

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip =
    (pageNumber - 1) * limitNumber;

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
          "version grandTotal"
        )
        .populate(
          "createdBy",
          "username email role"
        )
        .populate(
          "updatedBy",
          "username email role"
        )
        .sort({ quotationDate: -1 })
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
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

const getQuotationById = async (quotationId) => {
  const quotation = await Quotation.findById(
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
      "version panels inverter battery grandTotal"
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

  const [items, bom] = await Promise.all([
    QuotationItem.find({
      quotation: quotation._id,
    })
      .sort({ sortOrder: 1 })
      .lean(),

    QuotationBOM.find({
      quotation: quotation._id,
    })
      .sort({ sortOrder: 1, srNo: 1 })
      .lean(),
  ]);

  return {
    quotation,
    items,
    bom,
  };
};

const updateQuotation = async (
  quotationId,
  data,
  updatedBy
) => {
  const quotation = await Quotation.findById(
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
    quotation.status === QUOTATION_STATUS.ACCEPTED
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

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      quotation[field] = data[field];
    }
  });

  if (data.status !== undefined) {
    quotation.status = data.status;
  }

  if (data.quotationDate !== undefined) {
    quotation.quotationDate =
      data.quotationDate;
  }

  quotation.updatedBy = updatedBy;

  if (data.items) {
    await QuotationItem.deleteMany({
      quotation: quotation._id,
    });

    const items = data.items.map((item, index) => {
      const calculated = calculateItem(item);

      return {
        quotation: quotation._id,
        ...item,
        taxableAmount:
          calculated.taxableAmount,
        taxAmount:
          calculated.taxAmount,
        amount: calculated.amount,
        sortOrder:
          item.sortOrder !== undefined
            ? item.sortOrder
            : index,
        createdBy: updatedBy,
      };
    });

    await QuotationItem.insertMany(items);

    const totals = calculateTotals(items);

    quotation.subtotal = totals.subtotal;
    quotation.discount = totals.totalDiscount;
    quotation.taxableAmount =
      totals.taxableAmount;
    quotation.totalTax = totals.totalTax;

    quotation.grandTotal =
      round(
        totals.taxableAmount +
          totals.totalTax
      );
  }

  if (data.bom) {
    await QuotationBOM.deleteMany({
      quotation: quotation._id,
    });

    if (data.bom.length) {
      await QuotationBOM.insertMany(
        data.bom.map((item, index) => ({
          quotation: quotation._id,
          ...item,
          srNo:
            item.srNo !== undefined
              ? item.srNo
              : index + 1,
          sortOrder:
            item.sortOrder !== undefined
              ? item.sortOrder
              : index,
          createdBy: updatedBy,
        }))
      );
    }
  }

  await quotation.save();

  return getQuotationById(
    quotation._id
  );
};

const updateQuotationStatus = async (
  quotationId,
  status,
  updatedBy,
  extraData = {}
) => {
  if (
    !Object.values(QUOTATION_STATUS).includes(
      status
    )
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

  quotation.status = status;
  quotation.updatedBy = updatedBy;

  if (status === QUOTATION_STATUS.SENT) {
    quotation.sentAt = new Date();
  }

  if (
    status === QUOTATION_STATUS.ACCEPTED
  ) {
    quotation.acceptedAt = new Date();
  }

  if (
    status === QUOTATION_STATUS.REJECTED
  ) {
    quotation.rejectedAt = new Date();
    quotation.rejectionReason =
      extraData.rejectionReason;
  }

  if (
    status === QUOTATION_STATUS.EXPIRED
  ) {
    quotation.expiredAt = new Date();
  }

  await quotation.save();

  return getQuotationById(
    quotation._id
  );
};

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
    { rejectionReason }
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

const getQuotationItems = async (
  quotationId
) => {
  return QuotationItem.find({
    quotation: quotationId,
  })
    .sort({ sortOrder: 1 })
    .lean();
};

const getQuotationBOM = async (
  quotationId
) => {
  return QuotationBOM.find({
    quotation: quotationId,
  })
    .sort({ sortOrder: 1, srNo: 1 })
    .lean();
};

const getQuotationsByLead = async (
  leadId
) => {
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

const getQuotationsByCustomer = async (
  customerId
) => {
  return Quotation.find({
    customer: customerId,
  })
    .sort({
      revisionNumber: -1,
      quotationDate: -1,
    })
    .lean();
};

const deleteQuotation = async (
  quotationId,
  updatedBy
) => {
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
  quotation.rejectedAt = new Date();
  quotation.updatedBy = updatedBy;

  await quotation.save();

  return {
    message:
      "Quotation deactivated successfully",
  };
};

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
  deleteQuotation,
  calculateItem,
  calculateTotals,
};