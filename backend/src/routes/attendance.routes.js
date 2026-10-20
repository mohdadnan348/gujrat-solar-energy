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

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Employee Self Attendance
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  getMyAttendance
);

/*
|--------------------------------------------------------------------------
| Check-In
|--------------------------------------------------------------------------
*/

router.post(
  "/check-in",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  checkIn
);

/*
|--------------------------------------------------------------------------
| Check-Out
|--------------------------------------------------------------------------
*/

router.post(
  "/check-out",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  checkOut
);

/*
|--------------------------------------------------------------------------
| Attendance Summary
|--------------------------------------------------------------------------
|
| Employee -> own summary
| Manager  -> team/all allowed by service
| HR       -> full attendance summary
| Admin    -> full attendance summary
|
|--------------------------------------------------------------------------
*/

router.get(
  "/summary",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  getAttendanceSummary
);

/*
|--------------------------------------------------------------------------
| Get Attendance By Employee
|--------------------------------------------------------------------------
*/

router.get(
  "/employee/:employeeId",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getEmployeeAttendance
);

/*
|--------------------------------------------------------------------------
| Get Attendance For Employee / Date
|--------------------------------------------------------------------------
*/

router.get(
  "/employee/:employeeId/date/:date",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getAttendanceByDate
);

/*
|--------------------------------------------------------------------------
| Create Attendance Manually
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  validateAttendance,
  createAttendance
);

/*
|--------------------------------------------------------------------------
| Get All Attendance Records
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getAttendances
);

/*
|--------------------------------------------------------------------------
| Update Attendance
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  validateAttendanceUpdate,
  updateAttendance
);

/*
|--------------------------------------------------------------------------
| Get Single Attendance
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getAttendance
);

module.exports = router;