const express = require("express");

const {
  createLead,
  getLead,
  getLeads,
  getMyLeads,
  updateLead,
  assignLead,
  transferLead,
  updateLeadStatus,
  closeLead,
} = require("../controllers/lead.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateLead,
  validateLeadUpdate,
  validateLeadStatus,
  validateLeadAssignment,
} = require("../validators/lead.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

// All lead routes require authentication
router.use(protect);

// Create Lead
// Admin / Manager / Employee
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  validateLead,
  createLead
);

// Get all leads
// Admin / Manager / HR
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getLeads
);

// Get logged-in employee's assigned leads
router.get(
  "/my-leads",
  allowRoles(ROLES.EMPLOYEE),
  getMyLeads
);

// Get single lead
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  getLead
);

// Update Lead
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  validateLeadUpdate,
  updateLead
);

// Assign Lead
// Admin / Manager
router.patch(
  "/:id/assign",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  validateLeadAssignment,
  assignLead
);

// Transfer Lead
// Admin / Manager
router.patch(
  "/:id/transfer",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  validateLeadAssignment,
  transferLead
);

// Update Lead Status
router.patch(
  "/:id/status",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  validateLeadStatus,
  updateLeadStatus
);

// Close Lead
router.patch(
  "/:id/close",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  closeLead
);

module.exports = router;