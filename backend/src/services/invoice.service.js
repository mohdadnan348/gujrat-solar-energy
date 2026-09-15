const Invoice = require("../models/Invoice");
const InvoiceItem = require("../models/InvoiceItem");
const Quotation = require("../models/Quotation");
const QuotationItem = require("../models/QuotationItem");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

const generateNumber = require("../utils/generateNumber");
const { INVOICE_STATUS } = require("../config/constants");

const round = (value) =>
  Number(Number(value || 0).toFixed(2));

const numberToWords = (amount) => {
  const number = Math.round(Number(amount) || 0);

  if (number === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const twoDigits = (num) => {
    if (num < 20) return ones[num];

    return (
      tens[Math.floor(num / 10)] +
      (num % 10 ? ` ${ones[num % 10]}` : "")
    );
  };

  const threeDigits = (num) => {
    if (num < 100) return twoDigits(num);

    return (
      `${ones[Math.floor(num / 100)]} Hundred` +
      (num % 100 ? ` ${twoDigits(num % 100)}` : "")
    );
  };

  let result = "";

  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor(
    (number % 10000000) / 100000
  );
  const thousand = Math.floor(
    (number % 100000) / 1000
  );
  const remainder = number % 1000;

  if (crore) {
    result += `${threeDigits(crore)} Crore `;
  }

  if (lakh) {
    result += `${twoDigits(lakh)} Lakh `;
  }

  if (thousand) {
    result += `${twoDigits(thousand)} Thousand `;
  }

  if (remainder) {
    result += `${threeDigits(remainder)} `;
  }

  return `${result.trim()} Rupees Only`;
};

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

  const taxAmount =
    (taxableAmount * taxRate) / 100;

  const amount = taxableAmount + taxAmount;

  return {
    grossAmount: round(grossAmount),
    discountAmount: round(discountAmount),
    taxableAmount: round(taxableAmount),
    taxAmount: round(taxAmount),
    amount: round(amount),
  };
};

const calculateTotals = (items = []) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalTax = 0;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  items.forEach((item) => {
    const calculated = calculateItem(item);

    subtotal += calculated.grossAmount;
    totalDiscount += calculated.discountAmount;
    taxableAmount += calculated.taxableAmount;
    totalTax += calculated.taxAmount;

    cgst += Number(item.cgstAmount) || 0;
    sgst += Number(item.sgstAmount) || 0;
    igst += Number(item.igstAmount) || 0;
  });

  if (
    cgst === 0 &&
    sgst === 0 &&
    igst === 0 &&
    totalTax > 0
  ) {
    cgst = totalTax / 2;
    sgst = totalTax / 2;
  }

  return {
    subtotal: round(subtotal),
    totalDiscount: round(totalDiscount),
    taxableAmount: round(taxableAmount),
    totalTax: round(totalTax),
    cgst: round(cgst),
    sgst: round(sgst),
    igst: round(igst),
    grandTotal: round(taxableAmount + totalTax),
  };
};

const validateReferences = async (data) => {
  if (data.quotation) {
    const exists = await Quotation.exists({
      _id: data.quotation,
    });

    if (!exists) {
      const error = new Error("Quotation not found");
      error.statusCode = 404;
      throw error;
    }
  }

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
};

const getNextInvoiceNumber = async () =>
  generateNumber({
    Model: Invoice,
    field: "invoiceNumber",
    prefix: "INV",
    padding: 5,
    start: 1,
  });

const buildCustomerSnapshot = (
  customer,
  lead
) => {
  if (!customer && !lead) return {};

  return {
    name:
      customer?.name ||
      lead?.customerName ||
      "",

    company:
      customer?.companyName ||
      lead?.companyName ||
      "",

    mobile:
      customer?.mobile ||
      lead?.mobile ||
      "",

    alternateMobile:
      customer?.alternateMobile ||
      lead?.alternateMobile ||
      "",

    email:
      customer?.email ||
      lead?.email ||
      "",

    address:
      customer?.address ||
      lead?.address ||
      "",

    city:
      customer?.city ||
      lead?.city ||
      "",

    state:
      customer?.state ||
      lead?.state ||
      "",

    pincode:
      customer?.pincode ||
      lead?.pincode ||
      "",

    gst:
      customer?.gstNumber ||
      "",
  };
};

const prepareInvoiceItems = (
  items,
  createdBy
) =>
  items.map((item, index) => {
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

const createInvoice = async (
  data,
  createdBy
) => {
  await validateReferences(data);

  let quotation = null;
  let lead = null;
  let customer = null;

  if (data.quotation) {
    quotation = await Quotation.findById(
      data.quotation
    ).lean();
  }

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

  let sourceItems = Array.isArray(data.items)
    ? data.items
    : [];

  if (!sourceItems.length && quotation) {
    sourceItems = await QuotationItem.find({
      quotation: quotation._id,
    })
      .sort({ sortOrder: 1 })
      .lean();
  }

  const items = prepareInvoiceItems(
    sourceItems,
    createdBy
  );

  const totals = calculateTotals(items);

  const invoiceNumber =
    await getNextInvoiceNumber();

  const invoice = await Invoice.create({
    invoiceNumber,
    quotation: data.quotation,
    lead: data.lead,
    customer: data.customer,
    invoiceDate:
      data.invoiceDate || new Date(),
    dueDate: data.dueDate,

    status:
      data.status || INVOICE_STATUS.DRAFT,

    customerDetails:
      data.customerDetails ||
      buildCustomerSnapshot(
        customer,
        lead
      ),

    subtotal: totals.subtotal,

    totalDiscount:
      totals.totalDiscount,

    taxableAmount:
      totals.taxableAmount,

    totalTax:
      totals.totalTax,

    cgst: totals.cgst,
    sgst: totals.sgst,
    igst: totals.igst,

    grandTotal:
      totals.grandTotal,

    amountInWords:
      data.amountInWords ||
      numberToWords(
        totals.grandTotal
      ),

    termsAndConditions:
      data.termsAndConditions,

    notes: data.notes,
    createdBy,
  });

  if (items.length) {
    await InvoiceItem.insertMany(
      items.map((item) => ({
        ...item,
        invoice: invoice._id,
      }))
    );
  }

  return getInvoiceById(invoice._id);
};

const createInvoiceFromQuotation = async (
  quotationId,
  data = {},
  createdBy
) => {
  const quotation =
    await Quotation.findById(
      quotationId
    ).lean();

  if (!quotation) {
    const error = new Error(
      "Quotation not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    quotation.status &&
    !["Accepted", "accepted"].includes(
      quotation.status
    )
  ) {
    const error = new Error(
      "Invoice can only be generated from an accepted quotation"
    );
    error.statusCode = 400;
    throw error;
  }

  const quotationItems =
    await QuotationItem.find({
      quotation: quotation._id,
    })
      .sort({ sortOrder: 1 })
      .lean();

  let customerId =
    data.customer || quotation.customer;

  let leadId =
    data.lead || quotation.lead;

  let customer = null;
  let lead = null;

  if (customerId) {
    customer = await Customer.findById(
      customerId
    ).lean();
  }

  if (leadId) {
    lead = await Lead.findById(
      leadId
    ).lean();
  }

  const items = prepareInvoiceItems(
    quotationItems,
    createdBy
  );

  const totals = calculateTotals(items);

  const invoiceNumber =
    await getNextInvoiceNumber();

  const invoice =
    await Invoice.create({
      invoiceNumber,

      quotation: quotation._id,

      lead: leadId,

      customer: customerId,

      invoiceDate:
        data.invoiceDate || new Date(),

      dueDate: data.dueDate,

      status:
        data.status || INVOICE_STATUS.DRAFT,

      customerDetails:
        data.customerDetails ||
        buildCustomerSnapshot(
          customer,
          lead
        ),

      subtotal: totals.subtotal,

      totalDiscount:
        totals.totalDiscount,

      taxableAmount:
        totals.taxableAmount,

      totalTax:
        totals.totalTax,

      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,

      grandTotal:
        totals.grandTotal,

      amountInWords:
        numberToWords(
          totals.grandTotal
        ),

      termsAndConditions:
        data.termsAndConditions ||
        quotation.termsAndConditions,

      notes:
        data.notes ||
        quotation.notes,

      createdBy,
    });

  if (items.length) {
    await InvoiceItem.insertMany(
      items.map((item) => ({
        ...item,
        invoice: invoice._id,
        quotationItem:
          item._id || undefined,
      }))
    );
  }

  return getInvoiceById(invoice._id);
};

const getInvoices = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  quotation,
  lead,
  customer,
} = {}) => {
  const filter = {};

  if (status) filter.status = status;
  if (quotation) filter.quotation = quotation;
  if (lead) filter.lead = lead;
  if (customer) filter.customer = customer;

  if (search.trim()) {
    filter.$or = [
      {
        invoiceNumber: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        "customerDetails.name": {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        "customerDetails.company": {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        "customerDetails.mobile": {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
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
    (pageNumber - 1) * limitNumber;

  const [invoices, total] =
    await Promise.all([
      Invoice.find(filter)
        .populate(
          "quotation",
          "quotationNumber status grandTotal"
        )
        .populate(
          "lead",
          "leadId customerName companyName mobile status"
        )
        .populate(
          "customer",
          "customerId name companyName mobile status"
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
          invoiceDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Invoice.countDocuments(filter),
    ]);

  return {
    invoices,
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

const getInvoiceById = async (
  invoiceId
) => {
  const invoice =
    await Invoice.findById(invoiceId)
      .populate(
        "quotation",
        "quotationNumber status grandTotal quotationDate"
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

  if (!invoice) {
    const error = new Error(
      "Invoice not found"
    );
    error.statusCode = 404;
    throw error;
  }

  const items =
    await InvoiceItem.find({
      invoice: invoice._id,
    })
      .sort({
        sortOrder: 1,
      })
      .lean();

  return {
    invoice,
    items,
  };
};

const updateInvoice = async (
  invoiceId,
  data,
  updatedBy
) => {
  const invoice =
    await Invoice.findById(
      invoiceId
    );

  if (!invoice) {
    const error = new Error(
      "Invoice not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    invoice.status ===
    INVOICE_STATUS.CANCELLED
  ) {
    const error = new Error(
      "Cancelled invoice cannot be edited"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    invoice.status ===
    INVOICE_STATUS.ISSUED
  ) {
    const error = new Error(
      "Issued invoice cannot be edited"
    );
    error.statusCode = 400;
    throw error;
  }

  await validateReferences(data);

  const allowedFields = [
    "quotation",
    "lead",
    "customer",
    "invoiceDate",
    "dueDate",
    "customerDetails",
    "termsAndConditions",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      invoice[field] = data[field];
    }
  });

  if (data.status !== undefined) {
    if (
      !Object.values(
        INVOICE_STATUS
      ).includes(data.status)
    ) {
      const error = new Error(
        "Invalid invoice status"
      );
      error.statusCode = 400;
      throw error;
    }

    invoice.status = data.status;
  }

  if (Array.isArray(data.items)) {
    const items = prepareInvoiceItems(
      data.items,
      updatedBy
    );

    await InvoiceItem.deleteMany({
      invoice: invoice._id,
    });

    if (items.length) {
      await InvoiceItem.insertMany(
        items.map((item) => ({
          ...item,
          invoice: invoice._id,
        }))
      );
    }

    const totals =
      calculateTotals(items);

    invoice.subtotal =
      totals.subtotal;

    invoice.totalDiscount =
      totals.totalDiscount;

    invoice.taxableAmount =
      totals.taxableAmount;

    invoice.totalTax =
      totals.totalTax;

    invoice.cgst =
      totals.cgst;

    invoice.sgst =
      totals.sgst;

    invoice.igst =
      totals.igst;

    invoice.grandTotal =
      totals.grandTotal;

    invoice.amountInWords =
      numberToWords(
        totals.grandTotal
      );
  }

  invoice.updatedBy = updatedBy;

  await invoice.save();

  return getInvoiceById(
    invoice._id
  );
};

const updateInvoiceStatus = async (
  invoiceId,
  status,
  updatedBy,
  cancellationReason
) => {
  if (
    !Object.values(
      INVOICE_STATUS
    ).includes(status)
  ) {
    const error = new Error(
      "Invalid invoice status"
    );
    error.statusCode = 400;
    throw error;
  }

  const invoice =
    await Invoice.findById(
      invoiceId
    );

  if (!invoice) {
    const error = new Error(
      "Invoice not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    status ===
    INVOICE_STATUS.ISSUED
  ) {
    if (
      invoice.status ===
      INVOICE_STATUS.CANCELLED
    ) {
      const error = new Error(
        "Cancelled invoice cannot be issued"
      );
      error.statusCode = 400;
      throw error;
    }

    invoice.issuedAt = new Date();
  }

  if (
    status ===
    INVOICE_STATUS.CANCELLED
  ) {
    if (
      invoice.status ===
      INVOICE_STATUS.CANCELLED
    ) {
      return getInvoiceById(
        invoice._id
      );
    }

    invoice.cancelledAt =
      new Date();

    invoice.cancellationReason =
      cancellationReason ||
      "Invoice cancelled";
  }

  invoice.status = status;
  invoice.updatedBy = updatedBy;

  await invoice.save();

  return getInvoiceById(
    invoice._id
  );
};

const issueInvoice = async (
  invoiceId,
  updatedBy
) =>
  updateInvoiceStatus(
    invoiceId,
    INVOICE_STATUS.ISSUED,
    updatedBy
  );

const cancelInvoice = async (
  invoiceId,
  cancellationReason,
  updatedBy
) =>
  updateInvoiceStatus(
    invoiceId,
    INVOICE_STATUS.CANCELLED,
    updatedBy,
    cancellationReason
  );

const getInvoiceItems = async (
  invoiceId
) => {
  const invoice =
    await Invoice.exists({
      _id: invoiceId,
    });

  if (!invoice) {
    const error = new Error(
      "Invoice not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return InvoiceItem.find({
    invoice: invoiceId,
  })
    .sort({
      sortOrder: 1,
    })
    .lean();
};

const getInvoicesByCustomer =
  async (customerId) =>
    Invoice.find({
      customer: customerId,
    })
      .populate(
        "quotation",
        "quotationNumber status grandTotal"
      )
      .sort({
        invoiceDate: -1,
      })
      .lean();

const getInvoicesByQuotation =
  async (quotationId) =>
    Invoice.find({
      quotation: quotationId,
    })
      .populate(
        "customer",
        "customerId name companyName mobile"
      )
      .sort({
        invoiceDate: -1,
      })
      .lean();

const deleteInvoice = async (
  invoiceId,
  updatedBy
) => {
  const invoice =
    await Invoice.findById(
      invoiceId
    );

  if (!invoice) {
    const error = new Error(
      "Invoice not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    invoice.status !==
    INVOICE_STATUS.CANCELLED
  ) {
    invoice.status =
      INVOICE_STATUS.CANCELLED;

    invoice.cancelledAt =
      new Date();

    invoice.cancellationReason =
      "Invoice cancelled";

    invoice.updatedBy =
      updatedBy;

    await invoice.save();
  }

  return invoice;
};

const markInvoicesOverdue = async () => {
  const today = new Date();

  return Invoice.updateMany(
    {
      dueDate: {
        $lt: today,
      },
      status: INVOICE_STATUS.ISSUED,
    },
    {
      $set: {
        status: INVOICE_STATUS.OVERDUE,
      },
    }
  );
};

module.exports = {
  createInvoice,
  createInvoiceFromQuotation,
  getInvoices,
  getInvoiceById,
  getInvoiceItems,
  updateInvoice,
  updateInvoiceStatus,
  issueInvoice,
  cancelInvoice,
  getInvoicesByCustomer,
  getInvoicesByQuotation,
  deleteInvoice,
  markInvoicesOverdue,
  calculateItem,
  calculateTotals,
  numberToWords,
};