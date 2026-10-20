const express = require("express");

const {
  getLeadReport,
  getQuotationReport,
  getInvoiceReport,
  getTaskReport,
  getAttendanceReport,
  getLeaveReport,
  getEmployeeReport,
  getSalesPerformanceReport,
  getOverallReport,
} = require("../controllers/report.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Overall business report
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getOverallReport
);

// Lead report
router.get(
  "/leads",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getLeadReport
);

// Quotation report
router.get(
  "/quotations",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getQuotationReport
);

// Invoice report
router.get(
  "/invoices",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getInvoiceReport
);

// Task report
router.get(
  "/tasks",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getTaskReport
);

// Attendance report
router.get(
  "/attendance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getAttendanceReport
);

// Leave report
router.get(
  "/leaves",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getLeaveReport
);

// Employee report
router.get(
  "/employees",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getEmployeeReport
);

// Sales performance report
router.get(
  "/sales-performance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.ADMIN
  ),
  getSalesPerformanceReport
);

module.exports = router;