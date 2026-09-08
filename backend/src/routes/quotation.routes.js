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

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  allowRoles,
} = require("../middleware/role.middleware");

const {
  validate,
} = require("../middleware/validation.middleware");

const {
  createQuotationValidator,
  updateQuotationValidator,
  quotationIdValidator,
  rejectQuotationValidator,
  quotationListValidator,
} = require("../validators/quotation.validator");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Quotation List
|--------------------------------------------------------------------------
| GET /api/quotations
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  allowRoles("Admin", "Manager", "Employee"),
  validate(quotationListValidator),
  getQuotations
);

/*
|--------------------------------------------------------------------------
| Create Quotation
|--------------------------------------------------------------------------
| POST /api/quotations
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  allowRoles("Admin", "Manager", "Employee"),
  validate(createQuotationValidator),
  createQuotation
);

/*
|--------------------------------------------------------------------------
| Mark Expired Quotations
|--------------------------------------------------------------------------
| PATCH /api/quotations/mark-expired
|--------------------------------------------------------------------------
*/

router.patch(
  "/mark-expired",
  allowRoles("Admin", "Manager"),
  markExpiredQuotations
);

/*
|--------------------------------------------------------------------------
| Single Quotation
|--------------------------------------------------------------------------
| GET /api/quotations/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  allowRoles("Admin", "Manager", "Employee"),
  validate(quotationIdValidator),
  getQuotation
);

/*
|--------------------------------------------------------------------------
| Quotation Items
|--------------------------------------------------------------------------
| GET /api/quotations/:id/items
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/items",
  allowRoles("Admin", "Manager", "Employee"),
  validate(quotationIdValidator),
  getQuotationItems
);

/*
|--------------------------------------------------------------------------
| Quotation BOM
|--------------------------------------------------------------------------
| GET /api/quotations/:id/bom
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/bom",
  allowRoles("Admin", "Manager", "Employee"),
  validate(quotationIdValidator),
  getQuotationBOM
);

/*
|--------------------------------------------------------------------------
| Update Quotation
|--------------------------------------------------------------------------
| PUT /api/quotations/:id
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  allowRoles("Admin", "Manager"),
  validate(updateQuotationValidator),
  updateQuotation
);

/*
|--------------------------------------------------------------------------
| Send Quotation
|--------------------------------------------------------------------------
| PATCH /api/quotations/:id/send
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/send",
  allowRoles("Admin", "Manager", "Employee"),
  validate(quotationIdValidator),
  sendQuotation
);

/*
|--------------------------------------------------------------------------
| Accept Quotation
|--------------------------------------------------------------------------
| PATCH /api/quotations/:id/accept
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/accept",
  allowRoles("Admin", "Manager"),
  validate(quotationIdValidator),
  acceptQuotation
);

/*
|--------------------------------------------------------------------------
| Reject Quotation
|--------------------------------------------------------------------------
| PATCH /api/quotations/:id/reject
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/reject",
  allowRoles("Admin", "Manager"),
  validate(rejectQuotationValidator),
  rejectQuotation
);

module.exports = router;