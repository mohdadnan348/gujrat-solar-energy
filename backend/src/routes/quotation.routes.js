const express = require("express");

const {
  createQuotation,
  getQuotations,
  getQuotation,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  getQuotationItems,
  getQuotationBOM,
  markExpiredQuotations,
} = require("../controllers/quotation.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
  createQuotationValidator,
  updateQuotationValidator,
  quotationIdValidator,
  rejectQuotationValidator,
  quotationListValidator,
} = require("../validators/quotation.validator");

const router = express.Router();

router.use(protect);

// Get quotations
router.get(
  "/",
  validate([quotationListValidator]),
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
  getQuotations
);

// Create quotation
router.post(
  "/",
  validate([createQuotationValidator]),
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
  createQuotation
);

// Mark expired quotations
router.patch(
  "/mark-expired",
  allowRoles("ADMIN", "ADMIN"),
  markExpiredQuotations
);

// Get quotation items
router.get(
  "/:id/items",
  validate([quotationIdValidator]),
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
  getQuotationItems
);

// Get quotation BOM
router.get(
  "/:id/bom",
  validate([quotationIdValidator]),
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
  getQuotationBOM
);

// Get quotation by ID
router.get(
  "/:id",
  validate([quotationIdValidator]),
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
  getQuotation
);

// Update quotation
router.put(
  "/:id",
  validate([updateQuotationValidator]),
  allowRoles("ADMIN", "ADMIN"),
  updateQuotation
);

// Send quotation
router.patch(
  "/:id/send",
  validate([quotationIdValidator]),
  allowRoles("ADMIN", "ADMIN"),
  sendQuotation
);

// Accept quotation
router.patch(
  "/:id/accept",
  validate([quotationIdValidator]),
  allowRoles("ADMIN", "ADMIN"),
  acceptQuotation
);

// Reject quotation
router.patch(
  "/:id/reject",
  validate([rejectQuotationValidator]),
  allowRoles("ADMIN", "ADMIN"),
  rejectQuotation
);

module.exports = router;