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

router.get(
  "/",
  quotationListValidator,
  validate,
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  getQuotations
);

router.post(
  "/",
  createQuotationValidator,
  validate,
  allowRoles("ADMIN", "MANAGER"),
  createQuotation
);

router.patch(
  "/mark-expired",
  allowRoles("ADMIN", "MANAGER"),
  markExpiredQuotations
);

router.get(
  "/:id/items",
  quotationIdValidator,
  validate,
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  getQuotationItems
);

router.get(
  "/:id/bom",
  quotationIdValidator,
  validate,
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  getQuotationBOM
);

router.get(
  "/:id",
  quotationIdValidator,
  validate,
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  getQuotation
);

router.put(
  "/:id",
  updateQuotationValidator,
  validate,
  allowRoles("ADMIN", "MANAGER"),
  updateQuotation
);

router.patch(
  "/:id/send",
  quotationIdValidator,
  validate,
  allowRoles("ADMIN", "MANAGER"),
  sendQuotation
);

router.patch(
  "/:id/accept",
  quotationIdValidator,
  validate,
  allowRoles("ADMIN", "MANAGER"),
  acceptQuotation
);

router.patch(
  "/:id/reject",
  rejectQuotationValidator,
  validate,
  allowRoles("ADMIN", "MANAGER"),
  rejectQuotation
);

module.exports = router;