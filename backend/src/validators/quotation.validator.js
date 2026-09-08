const { body, param, query } = require("express-validator");

/*
|--------------------------------------------------------------------------
| Create Quotation
|--------------------------------------------------------------------------
*/

const createQuotationValidator = [
  body("quotationNumber")
    .optional()
    .trim()
    .matches(/^EST-\d+$/i)
    .withMessage(
      "Quotation number must be like EST-00001"
    ),

  body("lead")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid lead ID"),

  body("customer")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid customer ID"),

  body("solarRequirement")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid solar requirement ID"
    ),

  body("systemConfiguration")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid system configuration ID"
    ),

  body("revisionNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Revision number must be at least 1"
    ),

  body("status")
    .optional()
    .isIn([
      "Draft",
      "Sent",
      "Accepted",
      "Rejected",
    ])
    .withMessage(
      "Invalid quotation status"
    ),

  body("quotationDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Invalid quotation date"
    ),

  body("validUntil")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(
      "Invalid quotation expiry date"
    ),

  /*
   * Plant Details
   */

  body("plantDetails")
    .optional()
    .isObject()
    .withMessage(
      "Plant details must be an object"
    ),

  body("plantDetails.capacityKw")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Plant capacity cannot be negative"
    ),

  body("plantDetails.systemType")
    .optional()
    .isIn([
      "On-grid",
      "Off-grid",
      "Hybrid",
      "",
    ])
    .withMessage(
      "Invalid system type"
    ),

  body("plantDetails.description")
    .optional()
    .trim(),

  /*
   * Customer Snapshot
   */

  body("customerDetails")
    .optional()
    .isObject()
    .withMessage(
      "Customer details must be an object"
    ),

  body("customerDetails.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Customer name cannot be empty"
    ),

  body("customerDetails.companyName")
    .optional()
    .trim(),

  body("customerDetails.mobile")
    .optional()
    .trim(),

  body("customerDetails.alternateMobile")
    .optional()
    .trim(),

  body("customerDetails.email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage(
      "Invalid customer email"
    ),

  body("customerDetails.address")
    .optional()
    .trim(),

  body("customerDetails.city")
    .optional()
    .trim(),

  body("customerDetails.state")
    .optional()
    .trim(),

  body("customerDetails.pincode")
    .optional()
    .trim(),

  body("customerDetails.gstNumber")
    .optional()
    .trim(),

  /*
   * Proposal Content
   */

  body("proposalContent")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid proposal content ID"
    ),

  body("proposalTitle")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage(
      "Proposal title cannot exceed 200 characters"
    ),

  body("companyIntroduction")
    .optional()
    .trim(),

  body("subsidyDetails")
    .optional()
    .trim(),

  body("installationSchedule")
    .optional()
    .trim(),

  body("warrantyDetails")
    .optional()
    .trim(),

  body("scopeOfWork")
    .optional()
    .trim(),

  body("paymentTerms")
    .optional()
    .trim(),

  body("quotationTerms")
    .optional()
    .trim(),

  body("warrantyExclusions")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),

  /*
   * Product Photos
   */

  body("productPhotos")
    .optional()
    .isArray()
    .withMessage(
      "Product photos must be an array"
    ),

  body("productPhotos.*")
    .optional()
    .isString()
    .withMessage(
      "Product photo must be a valid file path"
    ),

  /*
   * Documents
   */

  body("documents")
    .optional()
    .isArray()
    .withMessage(
      "Documents must be an array"
    ),

  body("documents.*")
    .optional()
    .isString()
    .withMessage(
      "Document must be a valid file path"
    ),

  /*
   * Quotation Items
   */

  body("items")
    .isArray({ min: 1 })
    .withMessage(
      "At least one quotation item is required"
    ),

  body("items.*.category")
    .optional()
    .trim(),

  body("items.*.name")
    .trim()
    .notEmpty()
    .withMessage(
      "Quotation item name is required"
    ),

  body("items.*.description")
    .optional()
    .trim(),

  body("items.*.quantity")
    .isFloat({ min: 0.01 })
    .withMessage(
      "Quantity must be greater than 0"
    ),

  body("items.*.unit")
    .optional()
    .trim(),

  body("items.*.rate")
    .isFloat({ min: 0 })
    .withMessage(
      "Rate cannot be negative"
    ),

  body("items.*.discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Discount cannot be negative"
    ),

  body("items.*.taxRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Tax rate cannot be negative"
    ),

  body("items.*.sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Sort order must be a positive number"
    ),

  /*
   * BOM
   */

  body("bom")
    .optional()
    .isArray()
    .withMessage(
      "BOM must be an array"
    ),

  body("bom.*.srNo")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "BOM serial number must be at least 1"
    ),

  body("bom.*.category")
    .optional()
    .trim(),

  body("bom.*.item")
    .trim()
    .notEmpty()
    .withMessage(
      "BOM item name is required"
    ),

  body("bom.*.description")
    .optional()
    .trim(),

  body("bom.*.qty")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "BOM quantity cannot be negative"
    ),

  body("bom.*.unit")
    .optional()
    .trim(),

  body("bom.*.brand")
    .optional()
    .trim(),

  body("bom.*.specification")
    .optional()
    .trim(),

  body("bom.*.sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "BOM sort order must be positive"
    ),
];

/*
|--------------------------------------------------------------------------
| Update Quotation
|--------------------------------------------------------------------------
*/

const updateQuotationValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid quotation ID"
    ),

  body("lead")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid lead ID"
    ),

  body("customer")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid customer ID"
    ),

  body("solarRequirement")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid solar requirement ID"
    ),

  body("systemConfiguration")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid system configuration ID"
    ),

  body("quotationDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Invalid quotation date"
    ),

  body("validUntil")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(
      "Invalid quotation expiry date"
    ),

  body("plantDetails")
    .optional()
    .isObject()
    .withMessage(
      "Plant details must be an object"
    ),

  body("plantDetails.capacityKw")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Plant capacity cannot be negative"
    ),

  body("plantDetails.systemType")
    .optional()
    .isIn([
      "On-grid",
      "Off-grid",
      "Hybrid",
      "",
    ])
    .withMessage(
      "Invalid system type"
    ),

  body("customerDetails")
    .optional()
    .isObject()
    .withMessage(
      "Customer details must be an object"
    ),

  body("customerDetails.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Customer name cannot be empty"
    ),

  body("customerDetails.email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage(
      "Invalid customer email"
    ),

  body("proposalContent")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage(
      "Invalid proposal content ID"
    ),

  body("proposalTitle")
    .optional()
    .trim(),

  body("companyIntroduction")
    .optional()
    .trim(),

  body("subsidyDetails")
    .optional()
    .trim(),

  body("installationSchedule")
    .optional()
    .trim(),

  body("warrantyDetails")
    .optional()
    .trim(),

  body("scopeOfWork")
    .optional()
    .trim(),

  body("paymentTerms")
    .optional()
    .trim(),

  body("quotationTerms")
    .optional()
    .trim(),

  body("warrantyExclusions")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),

  body("productPhotos")
    .optional()
    .isArray()
    .withMessage(
      "Product photos must be an array"
    ),

  body("documents")
    .optional()
    .isArray()
    .withMessage(
      "Documents must be an array"
    ),

  /*
   * Items are optional during update.
   * If provided, at least one item is required.
   */

  body("items")
    .optional()
    .isArray({ min: 1 })
    .withMessage(
      "At least one quotation item is required"
    ),

  body("items.*.name")
    .if(body("items").exists())
    .trim()
    .notEmpty()
    .withMessage(
      "Quotation item name is required"
    ),

  body("items.*.quantity")
    .if(body("items").exists())
    .isFloat({ min: 0.01 })
    .withMessage(
      "Quantity must be greater than 0"
    ),

  body("items.*.rate")
    .if(body("items").exists())
    .isFloat({ min: 0 })
    .withMessage(
      "Rate cannot be negative"
    ),

  body("items.*.discount")
    .if(body("items").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Discount cannot be negative"
    ),

  body("items.*.taxRate")
    .if(body("items").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Tax rate cannot be negative"
    ),

  /*
   * BOM
   */

  body("bom")
    .optional()
    .isArray()
    .withMessage(
      "BOM must be an array"
    ),

  body("bom.*.srNo")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "BOM serial number must be at least 1"
    ),

  body("bom.*.item")
    .if(body("bom").exists())
    .trim()
    .notEmpty()
    .withMessage(
      "BOM item name is required"
    ),

  body("bom.*.qty")
    .if(body("bom").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "BOM quantity cannot be negative"
    ),

  body("bom.*.brand")
    .optional()
    .trim(),

  body("bom.*.specification")
    .optional()
    .trim(),
];

/*
|--------------------------------------------------------------------------
| Quotation ID
|--------------------------------------------------------------------------
*/

const quotationIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid quotation ID"
    ),
];

/*
|--------------------------------------------------------------------------
| Reject Quotation
|--------------------------------------------------------------------------
*/

const rejectQuotationValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid quotation ID"
    ),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      "Rejection reason cannot exceed 500 characters"
    ),
];

/*
|--------------------------------------------------------------------------
| Quotation List
|--------------------------------------------------------------------------
*/

const quotationListValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Page must be at least 1"
    ),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(
      "Limit must be between 1 and 100"
    ),

  query("search")
    .optional()
    .trim(),

  query("status")
    .optional()
    .isIn([
      "Draft",
      "Sent",
      "Accepted",
      "Rejected",
      "Expired",
    ])
    .withMessage(
      "Invalid quotation status"
    ),

  query("customer")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid customer ID"
    ),

  query("lead")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid lead ID"
    ),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Invalid start date"
    ),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Invalid end date"
    ),

  query("sortBy")
    .optional()
    .isIn([
      "quotationNumber",
      "quotationDate",
      "validUntil",
      "grandTotal",
      "status",
      "createdAt",
    ])
    .withMessage(
      "Invalid sort field"
    ),

  query("sortOrder")
    .optional()
    .isIn([
      "asc",
      "desc",
    ])
    .withMessage(
      "Sort order must be asc or desc"
    ),
];

module.exports = {
  createQuotationValidator,
  updateQuotationValidator,
  quotationIdValidator,
  rejectQuotationValidator,
  quotationListValidator,
};