const express = require("express");

const {
  createCustomer,
  getCustomer,
  getCustomers,
  getCustomerByLead,
  updateCustomer,
  updateCustomerStatus,
  deactivateCustomer,
} = require("../controllers/customer.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateCustomer,
  validateCustomerUpdate,
} = require("../validators/customer.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

// All customer routes require authentication
router.use(protect);

// Create customer
// Admin / Manager / Employee
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validateCustomer,
  createCustomer
);

// Get all customers
// Admin / Manager / HR
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getCustomers
);

// Get customer by lead
// Keep this route before /:id
router.get(
  "/lead/:leadId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getCustomerByLead
);

// Update customer
// Admin / Manager / Employee
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validateCustomerUpdate,
  updateCustomer
);

// Update customer status
// Admin / Manager
router.patch(
  "/:id/status",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  updateCustomerStatus
);

// Deactivate customer
// Admin / Manager
router.delete(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  deactivateCustomer
);

// Get single customer
// Admin / Manager / HR / Employee
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getCustomer
);

module.exports = router;