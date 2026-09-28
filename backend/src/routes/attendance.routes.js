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
    ROLES.MANAGER,
    ROLES.HR,
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
    ROLES.MANAGER,
    ROLES.HR,
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
    ROLES.MANAGER,
    ROLES.HR,
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
    ROLES.MANAGER,
    ROLES.HR,
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
    ROLES.MANAGER,
    ROLES.HR
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
    ROLES.MANAGER,
    ROLES.HR
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
    ROLES.HR
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
    ROLES.MANAGER,
    ROLES.HR
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
    ROLES.HR
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
    ROLES.MANAGER,
    ROLES.HR
  ),
  getAttendance
);

module.exports = router;