const express = require("express");

const {
  getLeaveTypes,
  createLeaveRequest,
  getLeaveRequest,
  getLeaveRequests,
  getMyLeaveRequests,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance,
  getMyLeaveBalance,
} = require("../controllers/leave.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateLeave,
  validateLeaveUpdate,
  validateLeaveAction,
} = require("../validators/leave.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Active leave types must be registered before /:id routes.
router.get("/types", getLeaveTypes);

// My leave requests
router.get(
  "/my",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  getMyLeaveRequests
);

// My leave balance
router.get(
  "/my/balance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  getMyLeaveBalance
);

// Employee leave balance
router.get(
  "/employee/:employeeId/balance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getLeaveBalance
);

// Create leave request
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  validateLeave,
  createLeaveRequest
);

// Get all leave requests
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getLeaveRequests
);

// Approve leave
router.patch(
  "/:id/approve",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  approveLeaveRequest
);

// Reject leave
router.patch(
  "/:id/reject",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  validateLeaveAction,
  rejectLeaveRequest
);

// Cancel leave
router.patch(
  "/:id/cancel",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  validateLeaveAction,
  cancelLeaveRequest
);

// Update pending leave
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  validateLeaveUpdate,
  updateLeaveRequest
);

// Get single leave request
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  getLeaveRequest
);

module.exports = router;