const Quotation = require("../models/Quotation");
const QuotationItem = require("../models/QuotationItem");
const QuotationBOM = require("../models/QuotationBOM");
const Invoice = require("../models/Invoice");
const InvoiceItem = require("../models/InvoiceItem");
const Setting = require("../models/Setting");

const quotationTemplate = require("../templates/quotation.template");
const invoiceTemplate = require("../templates/invoice.template");

const getActiveSettings = async () => {
  const settings =
    await Setting.findOne({
      isActive: true,
    }).lean();

  if (settings) {
    return settings;
  }

  return Setting.findOne()
    .sort({ createdAt: -1 })
    .lean();
};

const getQuotationPdfData = async (
  quotationId
) => {
  const quotation =
    await Quotation.findById(
      quotationId
    )
      .populate(
        "lead",
        "leadId name mobile email address city state pincode"
      )
      .populate(
        "customer",
        "customerId name companyName mobile email address city state pincode gstin pan"
      )
      .populate(
        "solarRequirement"
      )
      .populate(
        "systemConfiguration"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .lean();

  if (!quotation) {
    const error = new Error(
      "Quotation not found"
    );
    error.statusCode = 404;
    throw error;
  }

  const [
    items,
    bomItems,
    settings,
  ] = await Promise.all([
    QuotationItem.find({
      quotation: quotation._id,
    })
      .sort({
        sortOrder: 1,
        createdAt: 1,
      })
      .lean(),

    QuotationBOM.find({
      quotation: quotation._id,
    })
      .sort({
        sortOrder: 1,
        srNo: 1,
      })
      .lean(),

    getActiveSettings(),
  ]);

  const company =
    settings?.company || {};

  const bankDetails =
    settings?.bankDetails || {};

  const signature =
    settings?.signature || {};

  const quotationSettings =
    settings?.quotationSettings || {};

  const proposalSettings =
    settings?.proposalSettings || {};

  const proposalContent =
    quotation.proposalContent || {};

  const customerDetails =
    quotation.customerDetails || {};

  const data = {
    quotation,
    quotationNumber:
      quotation.quotationNumber,

    items,
    bomItems,

    settings,

    company,
    bankDetails,
    signature,

    quotationSettings,
    proposalSettings,

    proposalContent,

    customerDetails,

    plantDetails:
      quotation.plantDetails || {},

    totals: {
      subtotal:
        quotation.subtotal || 0,
      discount:
        quotation.discount || 0,
      taxableAmount:
        quotation.taxableAmount || 0,
      cgst:
        quotation.cgst || 0,
      sgst:
        quotation.sgst || 0,
      igst:
        quotation.igst || 0,
      totalTax:
        quotation.totalTax || 0,
      grandTotal:
        quotation.grandTotal || 0,
    },

    paymentTerms:
      quotation.paymentTerms ||
      proposalSettings.defaultPaymentTerms ||
      "",

    warrantyTerms:
      quotation.warrantyTerms ||
      proposalSettings.defaultWarrantyTerms ||
      "",

    subsidyTerms:
      quotation.subsidyTerms ||
      proposalSettings.defaultSubsidyTerms ||
      "",

    installationTerms:
      quotation.installationTerms ||
      proposalSettings.defaultInstallationTerms ||
      "",

    quotationValidity:
      quotation.quotationValidity ||
      proposalSettings.defaultQuotationValidity ||
      quotationSettings.validityDays ||
      "",

    scopeOfWork:
      quotation.scopeOfWork ||
      proposalSettings.defaultScopeOfWork ||
      "",

    warrantyExclusions:
      quotation.warrantyExclusions ||
      proposalSettings.defaultWarrantyExclusions ||
      "",

    testimonials:
      quotation.testimonials ||
      proposalContent.testimonials ||
      [],

    footerContent:
      quotation.footerContent ||
      proposalContent.footerContent ||
      "",
  };

  const html =
    quotationTemplate(data);

  return {
    html,
    quotationNumber:
      quotation.quotationNumber,
    quotation,
    items,
    bomItems,
  };
};

const getInvoicePdfData = async (
  invoiceId
) => {
  const invoice =
    await Invoice.findById(
      invoiceId
    )
      .populate(
        "quotation",
        "quotationNumber"
      )
      .populate(
        "lead",
        "leadId name mobile email address city state pincode"
      )
      .populate(
        "customer",
        "customerId name companyName mobile email address city state pincode gstin pan"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .lean();

  if (!invoice) {
    const error = new Error(
      "Invoice not found"
    );
    error.statusCode = 404;
    throw error;
  }

  const [
    items,
    settings,
  ] = await Promise.all([
    InvoiceItem.find({
      invoice: invoice._id,
    })
      .sort({
        sortOrder: 1,
        createdAt: 1,
      })
      .lean(),

    getActiveSettings(),
  ]);

  const company =
    settings?.company || {};

  const bankDetails =
    settings?.bankDetails || {};

  const signature =
    settings?.signature || {};

  const invoiceSettings =
    settings?.invoiceSettings || {};

  const data = {
    invoice,
    invoiceNumber:
      invoice.invoiceNumber,

    items,

    settings,

    company,
    bankDetails,
    signature,
    invoiceSettings,

    customerDetails:
      invoice.customerDetails ||
      {},

    sellerDetails:
      invoice.sellerDetails ||
      {},

    totals: {
      subtotal:
        invoice.subtotal || 0,
      discount:
        invoice.discount || 0,
      taxableAmount:
        invoice.taxableAmount || 0,
      cgst:
        invoice.cgst || 0,
      sgst:
        invoice.sgst || 0,
      igst:
        invoice.igst || 0,
      totalTax:
        invoice.totalTax || 0,
      grandTotal:
        invoice.grandTotal || 0,
    },

    terms:
      invoice.terms ||
      invoiceSettings.defaultTerms ||
      "",

    notes:
      invoice.notes || "",
  };

  const html =
    invoiceTemplate(data);

  return {
    html,
    invoiceNumber:
      invoice.invoiceNumber,
    invoice,
    items,
  };
};

module.exports = {
  getQuotationPdfData,
  getInvoicePdfData,
};