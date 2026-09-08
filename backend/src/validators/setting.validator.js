const { body } = require("express-validator");

/*
|--------------------------------------------------------------------------
| Company Validator
|--------------------------------------------------------------------------
*/

const companyFields = [
  body("company.name")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Company name must not exceed 150 characters"),

  body("company.legalName")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Legal name must not exceed 200 characters"),

  body("company.logo")
    .optional()
    .trim(),

  body("company.address")
    .optional()
    .trim(),

  body("company.city")
    .optional()
    .trim(),

  body("company.state")
    .optional()
    .trim(),

  body("company.pincode")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Invalid pincode"),

  body("company.phone")
    .optional()
    .trim(),

  body("company.alternatePhone")
    .optional()
    .trim(),

  body("company.email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid company email"),

  body("company.website")
    .optional()
    .trim(),

  body("company.gstin")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Invalid GSTIN"),

  body("company.pan")
    .optional()
    .trim()
    .isLength({ max: 15 })
    .withMessage("Invalid PAN"),
];

/*
|--------------------------------------------------------------------------
| Company Profile Validator
|--------------------------------------------------------------------------
*/

const companyProfileFields = [
  body("companyProfile.introduction")
    .optional()
    .trim(),

  body("companyProfile.vision")
    .optional()
    .trim(),

  body("companyProfile.mission")
    .optional()
    .trim(),

  body("companyProfile.aboutUs")
    .optional()
    .trim(),
];

/*
|--------------------------------------------------------------------------
| Bank Details Validator
|--------------------------------------------------------------------------
*/

const bankFields = [
  body("bankDetails.bankName")
    .optional()
    .trim(),

  body("bankDetails.accountName")
    .optional()
    .trim(),

  body("bankDetails.accountNumber")
    .optional()
    .trim(),

  body("bankDetails.ifscCode")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Invalid IFSC code"),

  body("bankDetails.branchName")
    .optional()
    .trim(),

  body("bankDetails.upiId")
    .optional()
    .trim(),
];

/*
|--------------------------------------------------------------------------
| Signature Validator
|--------------------------------------------------------------------------
*/

const signatureFields = [
  body("signature.name")
    .optional()
    .trim(),

  body("signature.designation")
    .optional()
    .trim(),

  body("signature.signatureImage")
    .optional()
    .trim(),

  body("signature.stampImage")
    .optional()
    .trim(),
];

/*
|--------------------------------------------------------------------------
| Tax Validator
|--------------------------------------------------------------------------
*/

const taxFields = [
  body("taxSettings.defaultTaxRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Tax rate must be between 0 and 100"),

  body("taxSettings.cgstRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("CGST rate must be between 0 and 100"),

  body("taxSettings.sgstRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("SGST rate must be between 0 and 100"),

  body("taxSettings.igstRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("IGST rate must be between 0 and 100"),
];

/*
|--------------------------------------------------------------------------
| Quotation Settings Validator
|--------------------------------------------------------------------------
*/

const quotationSettingsFields = [
  body("quotationSettings.prefix")
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage("Quotation prefix is invalid"),

  body("quotationSettings.startingNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Starting number must be at least 1"),

  body("quotationSettings.defaultValidityDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Validity days must be at least 1"),

  body("quotationSettings.defaultTitle")
    .optional()
    .trim(),

  body("quotationSettings.currency")
    .optional()
    .trim(),

  body("quotationSettings.currencySymbol")
    .optional()
    .trim(),

  body("quotationSettings.showCompanyProfile")
    .optional()
    .isBoolean()
    .withMessage("showCompanyProfile must be boolean"),

  body("quotationSettings.showProductPhotos")
    .optional()
    .isBoolean()
    .withMessage("showProductPhotos must be boolean"),

  body("quotationSettings.showBOM")
    .optional()
    .isBoolean()
    .withMessage("showBOM must be boolean"),

  body("quotationSettings.showWarranty")
    .optional()
    .isBoolean()
    .withMessage("showWarranty must be boolean"),

  body("quotationSettings.showSubsidy")
    .optional()
    .isBoolean()
    .withMessage("showSubsidy must be boolean"),

  body("quotationSettings.showPaymentTerms")
    .optional()
    .isBoolean()
    .withMessage("showPaymentTerms must be boolean"),

  body("quotationSettings.showTestimonials")
    .optional()
    .isBoolean()
    .withMessage("showTestimonials must be boolean"),
];

/*
|--------------------------------------------------------------------------
| Proposal Settings Validator
|--------------------------------------------------------------------------
*/

const proposalSettingsFields = [
  body("proposalSettings.coverTitle")
    .optional()
    .trim(),

  body("proposalSettings.coverSubtitle")
    .optional()
    .trim(),

  body("proposalSettings.footerText")
    .optional()
    .trim(),

  body("proposalSettings.thankYouText")
    .optional()
    .trim(),

  body("proposalSettings.defaultPaymentTerms")
    .optional()
    .trim(),

  body("proposalSettings.defaultWarrantyTerms")
    .optional()
    .trim(),

  body("proposalSettings.defaultSubsidyTerms")
    .optional()
    .trim(),

  body("proposalSettings.defaultInstallationTerms")
    .optional()
    .trim(),

  body("proposalSettings.defaultScopeOfWork")
    .optional()
    .trim(),

  body("proposalSettings.defaultWarrantyExclusions")
    .optional()
    .trim(),

  body("proposalSettings.defaultQuotationTerms")
    .optional()
    .trim(),
];

/*
|--------------------------------------------------------------------------
| Invoice Settings Validator
|--------------------------------------------------------------------------
*/

const invoiceSettingsFields = [
  body("invoiceSettings.prefix")
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage("Invoice prefix is invalid"),

  body("invoiceSettings.startingNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Starting number must be at least 1"),

  body("invoiceSettings.defaultDueDays")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Due days cannot be negative"),

  body("invoiceSettings.currency")
    .optional()
    .trim(),

  body("invoiceSettings.currencySymbol")
    .optional()
    .trim(),

  body("invoiceSettings.defaultTerms")
    .optional()
    .trim(),
];

/*
|--------------------------------------------------------------------------
| Product Master Validator
|--------------------------------------------------------------------------
*/

const productMasterFields = [
  body("productMaster")
    .optional()
    .isArray()
    .withMessage("Product master must be an array"),

  body("productMaster.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("productMaster.*.category")
    .optional()
    .trim(),

  body("productMaster.*.brand")
    .optional()
    .trim(),

  body("productMaster.*.specification")
    .optional()
    .trim(),

  body("productMaster.*.unit")
    .optional()
    .trim(),

  body("productMaster.*.defaultRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Product rate cannot be negative"),

  body("productMaster.*.isActive")
    .optional()
    .isBoolean()
    .withMessage("Product isActive must be boolean"),
];

/*
|--------------------------------------------------------------------------
| Lead / Task Settings Validator
|--------------------------------------------------------------------------
*/

const listFields = [
  body("leadSources")
    .optional()
    .isArray()
    .withMessage("Lead sources must be an array"),

  body("leadStatuses")
    .optional()
    .isArray()
    .withMessage("Lead statuses must be an array"),

  body("taskStatuses")
    .optional()
    .isArray()
    .withMessage("Task statuses must be an array"),

  body("taskPriorities")
    .optional()
    .isArray()
    .withMessage("Task priorities must be an array"),

  body("leaveTypes")
    .optional()
    .isArray()
    .withMessage("Leave types must be an array"),
];

/*
|--------------------------------------------------------------------------
| Leave Type Validator
|--------------------------------------------------------------------------
*/

const leaveTypeFields = [
  body("leaveTypes.*.name")
    .optional()
    .trim(),

  body("leaveTypes.*.code")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Leave code is invalid"),

  body("leaveTypes.*.annualLimit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Annual leave limit cannot be negative"),

  body("leaveTypes.*.isActive")
    .optional()
    .isBoolean()
    .withMessage("Leave type isActive must be boolean"),
];

/*
|--------------------------------------------------------------------------
| Common Settings Validator
|--------------------------------------------------------------------------
*/

const createOrUpdateSettingsValidator = [
  ...companyFields,
  ...companyProfileFields,
  ...bankFields,
  ...signatureFields,
  ...taxFields,
  ...quotationSettingsFields,
  ...proposalSettingsFields,
  ...invoiceSettingsFields,
  ...productMasterFields,
  ...listFields,
  ...leaveTypeFields,
];

/*
|--------------------------------------------------------------------------
| Company Only Validator
|--------------------------------------------------------------------------
*/

const updateCompanyValidator = [
  ...companyFields,
];

/*
|--------------------------------------------------------------------------
| Bank Only Validator
|--------------------------------------------------------------------------
*/

const updateBankDetailsValidator = [
  ...bankFields,
];

/*
|--------------------------------------------------------------------------
| Signature Only Validator
|--------------------------------------------------------------------------
*/

const updateSignatureValidator = [
  ...signatureFields,
];

/*
|--------------------------------------------------------------------------
| Proposal Only Validator
|--------------------------------------------------------------------------
*/

const updateProposalSettingsValidator = [
  ...proposalSettingsFields,
];

/*
|--------------------------------------------------------------------------
| Quotation Only Validator
|--------------------------------------------------------------------------
*/

const updateQuotationSettingsValidator = [
  ...quotationSettingsFields,
];

/*
|--------------------------------------------------------------------------
| Invoice Only Validator
|--------------------------------------------------------------------------
*/

const updateInvoiceSettingsValidator = [
  ...invoiceSettingsFields,
];

/*
|--------------------------------------------------------------------------
| Tax Only Validator
|--------------------------------------------------------------------------
*/

const updateTaxSettingsValidator = [
  ...taxFields,
];

module.exports = {
  createOrUpdateSettingsValidator,
  updateCompanyValidator,
  updateBankDetailsValidator,
  updateSignatureValidator,
  updateProposalSettingsValidator,
  updateQuotationSettingsValidator,
  updateInvoiceSettingsValidator,
  updateTaxSettingsValidator,
};