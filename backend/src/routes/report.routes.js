const express = require("express");

const {
  getLeadReport,
  getQuotationReport,
  getInvoiceReport,
  getPaymentReport,
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
    ROLES.MANAGER,
    ROLES.HR
  ),
  getOverallReport
);

// Lead report
router.get(
  "/leads",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getLeadReport
);

// Quotation report
router.get(
  "/quotations",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getQuotationReport
);

// Invoice report
router.get(
  "/invoices",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getInvoiceReport
);

// Payment report
router.get(
  "/payments",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getPaymentReport
);

// Task report
router.get(
  "/tasks",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getTaskReport
);

// Attendance report
router.get(
  "/attendance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getAttendanceReport
);

// Leave report
router.get(
  "/leaves",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getLeaveReport
);

// Employee report
router.get(
  "/employees",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getEmployeeReport
);

// Sales performance report
router.get(
  "/sales-performance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getSalesPerformanceReport
);

module.exports = router;