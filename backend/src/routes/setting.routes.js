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

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  allowRoles("ADMIN", "MANAGER", "HR"),
  getSettings
);

router.get(
  "/document",
  allowRoles("ADMIN", "MANAGER"),
  getDocumentSettings
);

router.put(
  "/",
  allowRoles("ADMIN"),
  updateSettings
);

router.put(
  "/company",
  allowRoles("ADMIN"),
  updateCompany
);

router.put(
  "/bank",
  allowRoles("ADMIN"),
  updateBankDetails
);

router.put(
  "/signature",
  allowRoles("ADMIN"),
  updateSignature
);

router.put(
  "/proposal",
  allowRoles("ADMIN"),
  updateProposalSettings
);

router.put(
  "/quotation",
  allowRoles("ADMIN"),
  updateQuotationSettings
);

router.put(
  "/invoice",
  allowRoles("ADMIN"),
  updateInvoiceSettings
);

router.put(
  "/tax",
  allowRoles("ADMIN"),
  updateTaxSettings
);

module.exports = router;