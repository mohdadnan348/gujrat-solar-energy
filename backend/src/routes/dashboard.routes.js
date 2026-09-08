const express = require("express");

const {
  getDashboard,
  getDashboardSummary,
  getLeadStatusSummary,
  getQuotationSummary,
  getInvoiceSummary,
  getTaskSummary,
  getEmployeePerformance,
  getRecentLeads,
  getRecentQuotations,
  getRecentInvoices,
  getUpcomingTasks,
} = require("../controllers/dashboard.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// Complete dashboard
router.get(
  "/",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getDashboard
);

// Dashboard summary
router.get(
  "/summary",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getDashboardSummary
);

// Lead status chart
router.get(
  "/leads",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getLeadStatusSummary
);

// Quotation chart
router.get(
  "/quotations",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getQuotationSummary
);

// Invoice chart
router.get(
  "/invoices",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getInvoiceSummary
);

// Task chart
router.get(
  "/tasks",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getTaskSummary
);

// Employee performance
router.get(
  "/employee-performance",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR
  ),
  getEmployeePerformance
);

// Recent leads
router.get(
  "/recent/leads",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getRecentLeads
);

// Recent quotations
router.get(
  "/recent/quotations",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getRecentQuotations
);

// Recent invoices
router.get(
  "/recent/invoices",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getRecentInvoices
);

// Upcoming tasks
router.get(
  "/upcoming-tasks",
  allowRoles(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE
  ),
  getUpcomingTasks
);

module.exports = router;