const reportService = require("../services/report.service");

const getLeadReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      assignedTo,
      status,
      leadSource,
    } = req.query;

    const report = await reportService.getLeadReport({
      startDate,
      endDate,
      assignedTo,
      status,
      leadSource,
    });

    return res.status(200).json({
      success: true,
      message: "Lead report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getQuotationReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      status,
      customer,
    } = req.query;

    const report = await reportService.getQuotationReport({
      startDate,
      endDate,
      status,
      customer,
    });

    return res.status(200).json({
      success: true,
      message: "Quotation report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      status,
      customer,
    } = req.query;

    const report = await reportService.getInvoiceReport({
      startDate,
      endDate,
      status,
      customer,
    });

    return res.status(200).json({
      success: true,
      message: "Invoice report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      paymentMethod,
      customer,
      invoice,
    } = req.query;

    const report = await reportService.getPaymentReport({
      startDate,
      endDate,
      paymentMethod,
      customer,
      invoice,
    });

    return res.status(200).json({
      success: true,
      message: "Payment report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      status,
      priority,
      assignedTo,
    } = req.query;

    const report = await reportService.getTaskReport({
      startDate,
      endDate,
      status,
      priority,
      assignedTo,
    });

    return res.status(200).json({
      success: true,
      message: "Task report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      employee,
      status,
    } = req.query;

    const report = await reportService.getAttendanceReport({
      startDate,
      endDate,
      employee,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      employee,
      leaveType,
      status,
    } = req.query;

    const report = await reportService.getLeaveReport({
      startDate,
      endDate,
      employee,
      leaveType,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Leave report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeReport = async (req, res, next) => {
  try {
    const {
      department,
      role,
      status,
    } = req.query;

    const report = await reportService.getEmployeeReport({
      department,
      role,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Employee report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getSalesPerformanceReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      employee,
    } = req.query;

    const report = await reportService.getSalesPerformanceReport({
      startDate,
      endDate,
      employee,
    });

    return res.status(200).json({
      success: true,
      message: "Sales performance report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getOverallReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const report = await reportService.getOverallReport({
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Overall report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};