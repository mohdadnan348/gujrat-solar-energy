const express = require("express");

const {
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

// My leave requests
router.get(
  "/my",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getMyLeaveRequests
);

// My leave balance
router.get(
  "/my/balance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getMyLeaveBalance
);

// Employee leave balance
router.get(
  "/employee/:employeeId/balance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getLeaveBalance
);

// Create leave request
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
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
    ROLES.MANAGER,
    ROLES.HR
  ),
  getLeaveRequests
);

// Approve leave
router.patch(
  "/:id/approve",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  approveLeaveRequest
);

// Reject leave
router.patch(
  "/:id/reject",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  validateLeaveAction,
  rejectLeaveRequest
);

// Cancel leave
router.patch(
  "/:id/cancel",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
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
    ROLES.MANAGER,
    ROLES.HR,
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
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getLeaveRequest
);

module.exports = router;