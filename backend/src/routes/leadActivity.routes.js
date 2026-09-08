const express = require("express");

const {
  createActivity,
  getLeadActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getFollowUps,
} = require("../controllers/leadActivity.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

// All lead activity routes require authentication
router.use(protect);

// Get all follow-ups
// Admin / Manager / Employee
router.get(
  "/follow-ups",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "EMPLOYEE"
  ),
  getFollowUps
);

// Create activity for a lead
// Admin / Manager / Employee
router.post(
  "/lead/:leadId",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "EMPLOYEE"
  ),
  createActivity
);

// Get all activities of a lead
// Admin / Manager / Employee
router.get(
  "/lead/:leadId",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "EMPLOYEE"
  ),
  getLeadActivities
);

// Get single activity
router.get(
  "/:id",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "EMPLOYEE"
  ),
  getActivityById
);

// Update activity
router.put(
  "/:id",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "EMPLOYEE"
  ),
  updateActivity
);

// Delete activity
// Admin / Manager
router.delete(
  "/:id",
  allowRoles(
    "ADMIN",
    "MANAGER"
  ),
  deleteActivity
);

module.exports = router;