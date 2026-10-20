const express = require("express");

const {
  createActivityLog,
  getActivityLog,
  getActivityLogs,
  getRecordActivityLogs,
  getUserActivityLogs,
  getModuleActivityLogs,
} = require("../controllers/activityLog.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Create activity log
// Normally audit middleware/service se automatically create hoga.
// Direct creation sirf Admin/Manager ke liye rakha gaya hai.
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  createActivityLog
);

// Get all activity logs
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getActivityLogs
);

// Get activity logs for a specific record
router.get(
  "/record/:recordId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getRecordActivityLogs
);

// Get activity logs for a specific user
router.get(
  "/user/:userId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getUserActivityLogs
);

// Get activity logs for a specific module
router.get(
  "/module/:module",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getModuleActivityLogs
);

// Get single activity log
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getActivityLog
);

module.exports = router;