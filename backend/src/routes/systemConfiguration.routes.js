const express = require("express");

const {
  createSystemConfiguration,
  getSystemConfiguration,
  getConfigurationsByLead,
  getLatestConfigurationByLead,
  getSystemConfigurations,
  updateSystemConfiguration,
} = require("../controllers/systemConfiguration.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateSystemConfiguration,
  validateSystemConfigurationUpdate,
} = require("../validators/systemConfiguration.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

// All system configuration routes require authentication
router.use(protect);

// Create System Configuration
// Admin / Manager / Employee
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validateSystemConfiguration,
  createSystemConfiguration
);

// Get all System Configurations
// Admin / Manager / HR
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getSystemConfigurations
);

// Get all configurations for a lead
router.get(
  "/lead/:leadId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getConfigurationsByLead
);

// Get latest configuration for a lead
router.get(
  "/lead/:leadId/latest",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getLatestConfigurationByLead
);

// Get single configuration
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getSystemConfiguration
);

// Update System Configuration
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validateSystemConfigurationUpdate,
  updateSystemConfiguration
);

module.exports = router;