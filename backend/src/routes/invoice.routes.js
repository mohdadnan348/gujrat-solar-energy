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
  invoiceListValidator,
  validate,
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
  createInvoiceValidator,
  validate,
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.createInvoice
);

/*
|--------------------------------------------------------------------------
| Create Invoice From Accepted Quotation
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
| Single Invoice
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  invoiceIdValidator,
  validate,
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  invoiceController.getInvoice
);

/*
|--------------------------------------------------------------------------
| Invoice Items
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/items",
  invoiceIdValidator,
  validate,
  allowRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  invoiceController.getInvoiceItems
);

/*
|--------------------------------------------------------------------------
| Update Invoice
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  updateInvoiceValidator,
  validate,
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
  invoiceIdValidator,
  validate,
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
  cancelInvoiceValidator,
  validate,
  allowRoles("ADMIN", "MANAGER"),
  invoiceController.cancelInvoice
);

module.exports = router;