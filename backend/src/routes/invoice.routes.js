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
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
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
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
  invoiceController.createInvoice
);

/*
|--------------------------------------------------------------------------
| Create Invoice From Quotation
|--------------------------------------------------------------------------
*/
router.post(
  "/from-quotation/:quotationId",
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
  invoiceController.createInvoiceFromQuotation
);

/*
|--------------------------------------------------------------------------
| Mark Overdue Invoices
|--------------------------------------------------------------------------
*/
router.patch(
  "/mark-overdue",
  allowRoles("ADMIN", "ADMIN"),
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
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
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
  allowRoles("ADMIN", "ADMIN", "EMPLOYEE"),
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
  allowRoles("ADMIN", "ADMIN"),
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
  allowRoles("ADMIN", "ADMIN"),
  invoiceController.issueInvoice
);


/*
|--------------------------------------------------------------------------
| Permanently Delete Invoice (Admin only)
|--------------------------------------------------------------------------
*/
router.delete(
  "/:id",
  validate([invoiceIdValidator]),
  allowRoles("ADMIN"),
  invoiceController.deleteInvoice
);


/*
|--------------------------------------------------------------------------
| Cancel Invoice
|--------------------------------------------------------------------------
*/
router.patch(
  "/:id/cancel",
  validate([cancelInvoiceValidator]),
  allowRoles("ADMIN", "ADMIN"),
  invoiceController.cancelInvoice
);

module.exports = router;