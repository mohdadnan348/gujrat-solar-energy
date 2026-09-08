const dashboardService = require("../services/dashboard.service");

const getDashboard = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const dashboard =
      await dashboardService.getDashboard({
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardSummary = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const summary =
      await dashboardService.getDashboardSummary({
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getLeadStatusSummary = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const summary =
      await dashboardService.getLeadStatusSummary({
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Lead status summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getQuotationSummary = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const summary =
      await dashboardService.getQuotationSummary({
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Quotation summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceSummary = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const summary =
      await dashboardService.getInvoiceSummary({
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Invoice summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskSummary = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const summary =
      await dashboardService.getTaskSummary({
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Task summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeePerformance = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const performance =
      await dashboardService.getEmployeePerformance({
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Employee performance fetched successfully",
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

const getRecentLeads = async (
  req,
  res,
  next
) => {
  try {
    const { limit = 5 } = req.query;

    const leads =
      await dashboardService.getRecentLeads(
        limit
      );

    return res.status(200).json({
      success: true,
      message: "Recent leads fetched successfully",
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

const getRecentQuotations = async (
  req,
  res,
  next
) => {
  try {
    const { limit = 5 } = req.query;

    const quotations =
      await dashboardService.getRecentQuotations(
        limit
      );

    return res.status(200).json({
      success: true,
      message: "Recent quotations fetched successfully",
      data: quotations,
    });
  } catch (error) {
    next(error);
  }
};

const getRecentInvoices = async (
  req,
  res,
  next
) => {
  try {
    const { limit = 5 } = req.query;

    const invoices =
      await dashboardService.getRecentInvoices(
        limit
      );

    return res.status(200).json({
      success: true,
      message: "Recent invoices fetched successfully",
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

const getUpcomingTasks = async (
  req,
  res,
  next
) => {
  try {
    const { limit = 5 } = req.query;

    const tasks =
      await dashboardService.getUpcomingTasks(
        limit
      );

    return res.status(200).json({
      success: true,
      message: "Upcoming tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};