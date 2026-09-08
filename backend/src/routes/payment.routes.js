const express = require("express");

const {
  createPayment,
  getPayment,
  getPayments,
  getPaymentsByInvoice,
  getPaymentsByCustomer,
  updatePayment,
  deletePayment,
  refreshInvoicePaymentStatus,
} = require("../controllers/payment.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validatePayment,
  validatePaymentUpdate,
} = require("../validators/payment.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Create payment
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validatePayment,
  createPayment
);

// Get all payments
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getPayments
);

// Get payments by invoice
router.get(
  "/invoice/:invoiceId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getPaymentsByInvoice
);

// Get payments by customer
router.get(
  "/customer/:customerId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getPaymentsByCustomer
);

// Refresh invoice payment status
router.patch(
  "/invoice/:invoiceId/refresh-status",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  refreshInvoicePaymentStatus
);

// Update payment
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  validatePaymentUpdate,
  updatePayment
);

// Delete payment
router.delete(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  deletePayment
);

// Get single payment
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getPayment
);

module.exports = router;