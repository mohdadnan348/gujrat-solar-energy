const { body, param, query } = require("express-validator");

const createInvoiceValidator = [
  body("invoiceNumber")
    .optional()
    .trim()
    .matches(/^INV-\d+$/i)
    .withMessage("Invoice number must be like INV-001"),

  body("quotation")
    .optional()
    .isMongoId()
    .withMessage("Invalid quotation ID"),

  body("lead")
    .optional()
    .isMongoId()
    .withMessage("Invalid lead ID"),

  body("customer")
    .optional()
    .isMongoId()
    .withMessage("Invalid customer ID"),

  body("invoiceDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid invoice date"),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid due date"),

  body("status")
    .optional()
    .isIn(["Draft", "Issued"])
    .withMessage("Invalid invoice status"),

  body("customerDetails")
    .optional()
    .isObject()
    .withMessage("Customer details must be an object"),

  body("customerDetails.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Customer name cannot be empty"),

  body("customerDetails.mobile")
    .optional()
    .trim(),

  body("customerDetails.email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("Invalid customer email"),

  body("customerDetails.gstNumber")
    .optional()
    .trim(),

  body("customerDetails.placeOfSupply")
    .optional()
    .trim(),

  body("termsAndConditions")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),

  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one invoice item is required"),

  body("items.*.itemName")
    .trim()
    .notEmpty()
    .withMessage("Item name is required"),

  body("items.*.description")
    .optional()
    .trim(),

  body("items.*.quantity")
    .isFloat({ min: 0.01 })
    .withMessage("Quantity must be greater than 0"),

  body("items.*.unit")
    .optional()
    .trim(),

  body("items.*.rate")
    .isFloat({ min: 0 })
    .withMessage("Rate cannot be negative"),

  body("items.*.discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount cannot be negative"),

  body("items.*.taxRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax rate cannot be negative"),

  body("items.*.cgstRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("CGST rate cannot be negative"),

  body("items.*.sgstRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("SGST rate cannot be negative"),

  body("items.*.igstRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("IGST rate cannot be negative"),

  body("items.*.sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a positive number"),
];

const updateInvoiceValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid invoice ID"),

  body("invoiceDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid invoice date"),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid due date"),

  body("quotation")
    .optional()
    .isMongoId()
    .withMessage("Invalid quotation ID"),

  body("lead")
    .optional()
    .isMongoId()
    .withMessage("Invalid lead ID"),

  body("customer")
    .optional()
    .isMongoId()
    .withMessage("Invalid customer ID"),

  body("customerDetails")
    .optional()
    .isObject()
    .withMessage("Customer details must be an object"),

  body("customerDetails.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Customer name cannot be empty"),

  body("customerDetails.email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("Invalid customer email"),

  body("customerDetails.mobile")
    .optional()
    .trim(),

  body("customerDetails.gstNumber")
    .optional()
    .trim(),

  body("customerDetails.placeOfSupply")
    .optional()
    .trim(),

  body("termsAndConditions")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),

  body("items")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one invoice item is required"),

  body("items.*.itemName")
    .if(body("items").exists())
    .trim()
    .notEmpty()
    .withMessage("Item name is required"),

  body("items.*.quantity")
    .if(body("items").exists())
    .isFloat({ min: 0.01 })
    .withMessage("Quantity must be greater than 0"),

  body("items.*.rate")
    .if(body("items").exists())
    .isFloat({ min: 0 })
    .withMessage("Rate cannot be negative"),

  body("items.*.discount")
    .if(body("items").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount cannot be negative"),

  body("items.*.taxRate")
    .if(body("items").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax rate cannot be negative"),

  body("items.*.cgstRate")
    .if(body("items").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage("CGST rate cannot be negative"),

  body("items.*.sgstRate")
    .if(body("items").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage("SGST rate cannot be negative"),

  body("items.*.igstRate")
    .if(body("items").exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage("IGST rate cannot be negative"),
];

const invoiceIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid invoice ID"),
];

const cancelInvoiceValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid invoice ID"),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Cancellation reason cannot exceed 500 characters"),
];

const invoiceListValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim(),

  query("status")
    .optional()
    .isIn(["Draft", "Issued", "Overdue", "Cancelled"])
    .withMessage("Invalid invoice status"),

  query("customer")
    .optional()
    .isMongoId()
    .withMessage("Invalid customer ID"),

  query("quotation")
    .optional()
    .isMongoId()
    .withMessage("Invalid quotation ID"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date"),

  query("sortBy")
    .optional()
    .isIn([
      "invoiceNumber",
      "invoiceDate",
      "dueDate",
      "grandTotal",
      "status",
      "createdAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

module.exports = {
  createInvoiceValidator,
  updateInvoiceValidator,
  invoiceIdValidator,
  cancelInvoiceValidator,
  invoiceListValidator,
};