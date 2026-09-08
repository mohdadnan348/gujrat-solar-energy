const express = require("express");

const {
  createAttendance,
  getAttendance,
  getAttendances,
  getEmployeeAttendance,
  getMyAttendance,
  getAttendanceByDate,
  updateAttendance,
  checkIn,
  checkOut,
  getAttendanceSummary,
} = require("../controllers/attendance.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateAttendance,
  validateAttendanceUpdate,
} = require("../validators/attendance.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Employee self attendance
router.get(
  "/my",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getMyAttendance
);

// Check-in
router.post(
  "/check-in",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  checkIn
);

// Check-out
router.post(
  "/check-out",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  checkOut
);

// Attendance summary
router.get(
  "/summary",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getAttendanceSummary
);

// Get attendance by employee
router.get(
  "/employee/:employeeId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getEmployeeAttendance
);

// Get attendance for a specific employee/date
router.get(
  "/employee/:employeeId/date/:date",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getAttendanceByDate
);

// Create attendance manually
router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR
  ),
  validateAttendance,
  createAttendance
);

// Get all attendance records
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getAttendances
);

// Update attendance
router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR
  ),
  validateAttendanceUpdate,
  updateAttendance
);

// Get single attendance
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getAttendance
);

module.exports = router;