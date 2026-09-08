const express = require("express");
const { generateQuotationPdf, generateInvoicePdf } = require("../controllers/pdf.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All PDF routes require authentication
router.use(protect);

// Generate quotation PDF
router.get("/quotation/:id", generateQuotationPdf);

// Generate invoice PDF
router.get("/invoice/:id", generateInvoicePdf);

module.exports = router;