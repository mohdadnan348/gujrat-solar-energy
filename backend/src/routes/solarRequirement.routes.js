const express = require("express");

const {
  createSolarRequirement,
  getSolarRequirement,
  getSolarRequirementByLead,
  getSolarRequirements,
  updateSolarRequirement,
  updateSurveyStatus,
  addPhotos,
  addDocuments,
} = require("../controllers/solarRequirement.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateSolarRequirement,
  validateSolarRequirementUpdate,
} = require("../validators/solarRequirement.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

// All solar requirement routes require authentication
router.use(protect);

// Create Solar Requirement
// Admin / Manager / Employee
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validateSolarRequirement,
  createSolarRequirement
);

// Get all Solar Requirements
// Admin / Manager / HR
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getSolarRequirements
);

// Get requirement by Lead
router.get(
  "/lead/:leadId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getSolarRequirementByLead
);

// Get single requirement
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getSolarRequirement
);

// Update Solar Requirement
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  validateSolarRequirementUpdate,
  updateSolarRequirement
);

// Update Site Survey Status
router.patch(
  "/:id/survey-status",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  updateSurveyStatus
);

// Add Site Photos
router.patch(
  "/:id/photos",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  addPhotos
);

// Add Site Documents
router.patch(
  "/:id/documents",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.EMPLOYEE
  ),
  addDocuments
);

module.exports = router;