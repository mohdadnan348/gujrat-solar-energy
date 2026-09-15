const reportService = require("../services/report.service");

const getOverallReport = async (req, res, next) => {
  try {
    const data = await reportService.getOverallReport(
      req.query,
      req.user
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getLeadReport = async (req, res, next) => {
  try {
    const data = await reportService.getLeadReport(
      req.query,
      req.user
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getQuotationReport = async (req, res, next) => {
  try {
    const data = await reportService.getQuotationReport(
      req.query,
      req.user
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceReport = async (req, res, next) => {
  try {
    const data = await reportService.getInvoiceReport(
      req.query,
      req.user
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskReport = async (req, res, next) => {
  try {
    const data = await reportService.getTaskReport(
      req.query,
      req.user
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const data =
      await reportService.getAttendanceReport(
        req.query,
        req.user
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveReport = async (req, res, next) => {
  try {
    const data = await reportService.getLeaveReport(
      req.query,
      req.user
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeReport = async (req, res, next) => {
  try {
    const data =
      await reportService.getEmployeeReport(
        req.query,
        req.user
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getSalesPerformanceReport = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await reportService.getSalesPerformanceReport(
        req.query,
        req.user
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverallReport,
  getLeadReport,
  getQuotationReport,
  getInvoiceReport,
  getTaskReport,
  getAttendanceReport,
  getLeaveReport,
  getEmployeeReport,
  getSalesPerformanceReport,
};