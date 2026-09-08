const Invoice = require("../models/Invoice");
const InvoiceItem = require("../models/InvoiceItem");
const Quotation = require("../models/Quotation");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

const { generateNumber } = require("../utils/generateNumber");
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
      (num % 100
        ? ` ${twoDigits(num % 100)}`
        : "")
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
  const discountPercent =
    Number(item.discount) || 0;
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
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discountPercent =
      Number(item.discount) || 0;

    const grossAmount = quantity * rate;

    const discountAmount =
      (grossAmount * discountPercent) / 100;

    const calculated = calculateItem(item);

    subtotal += grossAmount;
    totalDiscount += discountAmount;
    taxableAmount += calculated.taxableAmount;
    totalTax += calculated.taxAmount;

    cgst += Number(item.cgstAmount) || 0;
    sgst += Number(item.sgstAmount) || 0;
    igst += Number(item.igstAmount) || 0;
  });

  /*
   * Agar individual tax split nahi diya gaya,
   * to totalTax ko CGST + SGST mein split karenge.
   */
  if (
    cgst === 0 &&
    sgst === 0 &&
    igst === 0 &&
    totalTax > 0
  ) {
    cgst = totalTax / 2;
    sgst = totalTax / 2;
  }

  const calculatedGrandTotal =
    taxableAmount + totalTax;

  return {
    subtotal: round(subtotal),
    totalDiscount: round(totalDiscount),
    taxableAmount: round(taxableAmount),
    totalTax: round(totalTax),
    cgst: round(cgst),
    sgst: round(sgst),
    igst: round(igst),
    grandTotal: round(calculatedGrandTotal),
  };
};

const validateReferences = async (data) => {
  if (data.quotation) {
    const quotationExists =
      await Quotation.exists({
        _id: data.quotation,
      });

    if (!quotationExists) {
      const error = new Error(
        "Quotation not found"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.lead) {
    const leadExists = await Lead.exists({
      _id: data.lead,
    });

    if (!leadExists) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.customer) {
    const customerExists =
      await Customer.exists({
        _id: data.customer,
      });

    if (!customerExists) {
      const error = new Error(
        "Customer not found"
      );
      error.statusCode = 404;
      throw error;
    }
  }
};

const getNextInvoiceNumber = async () => {
  return generateNumber(
    Invoice,
    "invoiceNumber",
    "INV"
  );
};

const buildCustomerSnapshot = (
  customer,
  lead
) => {
  const source = customer || lead;

  if (!source) return {};

  return {
    name: customer
      ? customer.name
      : lead?.customerName,

    company:
      customer?.companyName ||
      lead?.companyName,

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

    gst:
      customer?.gstNumber ||
      undefined,
  };
};

const createInvoice = async (
  data,
  createdBy
) => {
  await validateReferences(data);

  let quotation = null;
  let lead = null;
  let customer = null;

  if (data.quotation) {
    quotation =
      await Quotation.findById(
        data.quotation
      ).lean();
  }

  if (data.lead) {
    lead = await Lead.findById(
      data.lead
    ).lean();
  }

  if (data.customer) {
    customer =
      await Customer.findById(
        data.customer
      ).lean();
  }

  /*
   * Agar quotation diya hai aur items nahi diye,
   * to quotation ke items se invoice items
   * automatically create honge.
   */
  let sourceItems = data.items || [];

  if (
    !sourceItems.length &&
    quotation
  ) {
    sourceItems =
      await InvoiceItem.find({
        invoice: quotation._id,
      }).lean();
  }

  const invoiceNumber =
    await getNextInvoiceNumber();

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

  const totals = calculateTotals(items);

  const customerDetails =
    data.customerDetails ||
    buildCustomerSnapshot(
      customer,
      lead
    );

  const invoiceDate =
    data.invoiceDate || new Date();

  const dueDate = data.dueDate;

  const invoice =
    await Invoice.create({
      invoiceNumber,

      quotation: data.quotation,

      lead: data.lead,

      customer: data.customer,

      invoiceDate,

      dueDate,

      status:
        data.status ||
        INVOICE_STATUS.DRAFT,

      customerDetails,

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

  /*
   * Invoice items ko quotation items
   * se copy karna ho to quotationItem
   * mapping alag se nahi kar rahe.
   */
  if (items.length) {
    await InvoiceItem.insertMany(
      items.map((item) => ({
        ...item,
        invoice: invoice._id,
      }))
    );
  }

  return getInvoiceById(
    invoice._id
  );
};

const getInvoices = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  quotation,
  lead,
  customer,
}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (quotation) {
    filter.quotation = quotation;
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
        invoiceNumber: {
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
    await Invoice.findById(
      invoiceId
    )
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

  allowedFields.forEach(
    (field) => {
      if (
        data[field] !==
        undefined
      ) {
        invoice[field] =
          data[field];
      }
    }
  );

  if (data.status !== undefined) {
    invoice.status = data.status;
  }

  if (data.items) {
    await InvoiceItem.deleteMany({
      invoice: invoice._id,
    });

    const items =
      data.items.map(
        (item, index) => {
          const calculated =
            calculateItem(item);

          return {
            invoice:
              invoice._id,

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

    await InvoiceItem.insertMany(
      items
    );

    const totals =
      calculateTotals(
        items
      );

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

  invoice.updatedBy =
    updatedBy;

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

  invoice.status = status;
  invoice.updatedBy =
    updatedBy;

  if (
    status ===
    INVOICE_STATUS.ISSUED
  ) {
    invoice.issuedAt =
      new Date();
  }

  if (
    status ===
    INVOICE_STATUS.CANCELLED
  ) {
    invoice.cancelledAt =
      new Date();

    invoice.cancellationReason =
      cancellationReason;
  }

  await invoice.save();

  return getInvoiceById(
    invoice._id
  );
};

const issueInvoice = async (
  invoiceId,
  updatedBy
) => {
  return updateInvoiceStatus(
    invoiceId,
    INVOICE_STATUS.ISSUED,
    updatedBy
  );
};

const cancelInvoice = async (
  invoiceId,
  cancellationReason,
  updatedBy
) => {
  return updateInvoiceStatus(
    invoiceId,
    INVOICE_STATUS.CANCELLED,
    updatedBy,
    cancellationReason
  );
};

const getInvoicesByCustomer =
  async (customerId) => {
    return Invoice.find({
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
  };

const getInvoicesByQuotation =
  async (quotationId) => {
    return Invoice.find({
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
  };

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
    invoice.status ===
    INVOICE_STATUS.CANCELLED
  ) {
    return {
      message:
        "Invoice is already cancelled",
    };
  }

  invoice.status =
    INVOICE_STATUS.CANCELLED;

  invoice.cancelledAt =
    new Date();

  invoice.cancellationReason =
    "Invoice deactivated";

  invoice.updatedBy =
    updatedBy;

  await invoice.save();

  return {
    message:
      "Invoice cancelled successfully",
  };
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  issueInvoice,
  cancelInvoice,
  getInvoicesByCustomer,
  getInvoicesByQuotation,
  deleteInvoice,
  calculateItem,
  calculateTotals,
  numberToWords,
};