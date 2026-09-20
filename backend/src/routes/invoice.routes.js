const express = require("express");

const invoiceController = require("../controllers/invoice.controller");

const {
  createInvoiceValidator,
  updateInvoiceValidator,
  invoiceIdValidator,
  cancelInvoiceValidator,
  invoiceListValidator,
} = require("../validators/invoice.validator");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validation.middleware");

const router = express.Router();

router.use(protect);

/*
|--------------------------------------------------------------------------
| Invoice List
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  validate([invoiceListValidator]),
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  invoiceController.getInvoices
);

/*
|--------------------------------------------------------------------------
| Create Invoice
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  validate([createInvoiceValidator]),
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.createInvoice
);

/*
|--------------------------------------------------------------------------
| Create Invoice From Quotation
|--------------------------------------------------------------------------
*/
router.post(
  "/from-quotation/:quotationId",
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.createInvoiceFromQuotation
);

/*
|--------------------------------------------------------------------------
| Mark Overdue Invoices
|--------------------------------------------------------------------------
*/
router.patch(
  "/mark-overdue",
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.markInvoicesOverdue
);

/*
|--------------------------------------------------------------------------
| Invoice Items
|--------------------------------------------------------------------------
*/
router.get(
  "/:id/items",
  validate([invoiceIdValidator]),
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  invoiceController.getInvoiceItems
);

/*
|--------------------------------------------------------------------------
| Single Invoice
|--------------------------------------------------------------------------
*/
router.get(
  "/:id",
  validate([invoiceIdValidator]),
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  invoiceController.getInvoice
);

/*
|--------------------------------------------------------------------------
| Update Invoice
|--------------------------------------------------------------------------
*/
router.put(
  "/:id",
  validate([updateInvoiceValidator]),
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.updateInvoice
);

/*
|--------------------------------------------------------------------------
| Issue Invoice
|--------------------------------------------------------------------------
*/
router.patch(
  "/:id/issue",
  validate([invoiceIdValidator]),
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.issueInvoice
);

/*
|--------------------------------------------------------------------------
| Cancel Invoice
|--------------------------------------------------------------------------
*/
router.patch(
  "/:id/cancel",
  validate([cancelInvoiceValidator]),
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.cancelInvoice
);

module.exports = router;