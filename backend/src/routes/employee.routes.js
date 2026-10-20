const express = require("express");

const {
  createEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} = require("../controllers/employee.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const {
  validateEmployee,
  validateEmployeeUpdate,
} = require("../validators/employee.validator");

const { ROLES } = require("../config/constants");

const router = express.Router();

// All employee routes require authentication
router.use(protect);

// Create Employee - Admin / HR
router.post(
  "/",
  allowRoles(ROLES.ADMIN, ROLES.ADMIN),
  validateEmployee,
  createEmployee
);

// List Employees
router.get(
  "/",
  allowRoles(ROLES.ADMIN, ROLES.ADMIN, ROLES.ADMIN),
  getEmployees
);

// Get Single Employee
router.get(
  "/:id",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.EMPLOYEE
  ),
  getEmployee
);

// Update Employee - Admin / HR
router.put(
  "/:id",
  allowRoles(ROLES.ADMIN, ROLES.ADMIN),
  validateEmployeeUpdate,
  updateEmployee
);

// Activate / Deactivate Employee - Admin / HR
router.patch(
  "/:id/status",
  allowRoles(ROLES.ADMIN, ROLES.ADMIN),
  updateEmployeeStatus
);

// Deactivate Employee - Admin / HR
router.delete(
  "/:id",
  allowRoles(ROLES.ADMIN, ROLES.ADMIN),
  deleteEmployee
);

module.exports = router;