const express = require("express");

const authRoutes = require("./auth.routes");
const employeeRoutes = require("./employee.routes");
const settingRoutes = require("./setting.routes");
const leadRoutes = require("./lead.routes");
const leadActivityRoutes = require("./leadActivity.routes");
const solarRequirementRoutes = require("./solarRequirement.routes");
const systemConfigurationRoutes = require("./systemConfiguration.routes");
const quotationRoutes = require("./quotation.routes");
const customerRoutes = require("./customer.routes");
const invoiceRoutes = require("./invoice.routes");
const taskRoutes = require("./task.routes");
const attendanceRoutes = require("./attendance.routes");
const leaveRoutes = require("./leave.routes");
const dashboardRoutes = require("./dashboard.routes");
const reportRoutes = require("./report.routes");
const activityLogRoutes = require("./activityLog.routes");
const notificationRoutes = require("./notification.routes");
const pdfRoutes = require("./pdf.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/settings", settingRoutes);
router.use("/leads", leadRoutes);
router.use("/lead-activities", leadActivityRoutes);
router.use("/solar-requirements", solarRequirementRoutes);
router.use("/system-configurations", systemConfigurationRoutes);
router.use("/quotations", quotationRoutes);
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/tasks", taskRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/activity-logs", activityLogRoutes);
router.use("/notifications", notificationRoutes);
router.use("/pdf", pdfRoutes);

module.exports = router;