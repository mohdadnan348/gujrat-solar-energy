const express = require("express");

const {
  getSettings,
  getDocumentSettings,
  updateSettings,
  updateCompany,
  updateBankDetails,
  updateSignature,
  updateProposalSettings,
  updateQuotationSettings,
  updateInvoiceSettings,
  updateTaxSettings,
} = require("../controllers/setting.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  allowRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Get Settings
|--------------------------------------------------------------------------
| GET /api/settings
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  allowRoles("Admin", "Manager", "HR"),
  getSettings
);

/*
|--------------------------------------------------------------------------
| Get Document Settings
|--------------------------------------------------------------------------
| GET /api/settings/document
|--------------------------------------------------------------------------
| PDF generation ke liye company/proposal/invoice settings
|--------------------------------------------------------------------------
*/

router.get(
  "/document",
  allowRoles("Admin", "Manager"),
  getDocumentSettings
);

/*
|--------------------------------------------------------------------------
| Update All Settings
|--------------------------------------------------------------------------
| PUT /api/settings
|--------------------------------------------------------------------------
*/

router.put(
  "/",
  allowRoles("Admin"),
  updateSettings
);

/*
|--------------------------------------------------------------------------
| Company Information
|--------------------------------------------------------------------------
| PUT /api/settings/company
|--------------------------------------------------------------------------
*/

router.put(
  "/company",
  allowRoles("Admin"),
  updateCompany
);

/*
|--------------------------------------------------------------------------
| Bank Details
|--------------------------------------------------------------------------
| PUT /api/settings/bank
|--------------------------------------------------------------------------
*/

router.put(
  "/bank",
  allowRoles("Admin"),
  updateBankDetails
);

/*
|--------------------------------------------------------------------------
| Authorized Signature
|--------------------------------------------------------------------------
| PUT /api/settings/signature
|--------------------------------------------------------------------------
*/

router.put(
  "/signature",
  allowRoles("Admin"),
  updateSignature
);

/*
|--------------------------------------------------------------------------
| Proposal Settings
|--------------------------------------------------------------------------
| PUT /api/settings/proposal
|--------------------------------------------------------------------------
*/

router.put(
  "/proposal",
  allowRoles("Admin"),
  updateProposalSettings
);

/*
|--------------------------------------------------------------------------
| Quotation Settings
|--------------------------------------------------------------------------
| PUT /api/settings/quotation
|--------------------------------------------------------------------------
*/

router.put(
  "/quotation",
  allowRoles("Admin"),
  updateQuotationSettings
);

/*
|--------------------------------------------------------------------------
| Invoice Settings
|--------------------------------------------------------------------------
| PUT /api/settings/invoice
|--------------------------------------------------------------------------
*/

router.put(
  "/invoice",
  allowRoles("Admin"),
  updateInvoiceSettings
);

/*
|--------------------------------------------------------------------------
| Tax Settings
|--------------------------------------------------------------------------
| PUT /api/settings/tax
|--------------------------------------------------------------------------
*/

router.put(
  "/tax",
  allowRoles("Admin"),
  updateTaxSettings
);

module.exports = router;