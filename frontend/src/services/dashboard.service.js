import api from "./api";

/**
 * Dashboard Service
 *
 * Backend dashboard routes:
 * GET    /dashboard
 * GET    /dashboard/summary
 * GET    /dashboard/leads
 * GET    /dashboard/quotations
 * GET    /dashboard/invoices
 * GET    /dashboard/tasks
 * GET    /dashboard/employee-performance
 * GET    /dashboard/recent/leads
 * GET    /dashboard/recent/quotations
 * GET    /dashboard/recent/invoices
 * GET    /dashboard/upcoming-tasks
 */

const dashboardService = {
  /**
   * Get complete dashboard data.
   */
  getDashboard: async (params = {}) => {
    const response = await api.get("/dashboard", {
      params,
    });

    return response.data;
  },

  /**
   * Get dashboard summary/statistics.
   */
  getSummary: async (params = {}) => {
    const response = await api.get("/dashboard/summary", {
      params,
    });

    return response.data;
  },

  /**
   * Get dashboard lead statistics.
   */
  getLeads: async (params = {}) => {
    const response = await api.get("/dashboard/leads", {
      params,
    });

    return response.data;
  },

  /**
   * Get dashboard quotation statistics.
   */
  getQuotations: async (params = {}) => {
    const response = await api.get("/dashboard/quotations", {
      params,
    });

    return response.data;
  },

  /**
   * Get dashboard invoice statistics.
   */
  getInvoices: async (params = {}) => {
    const response = await api.get("/dashboard/invoices", {
      params,
    });

    return response.data;
  },

  /**
   * Get dashboard task statistics.
   */
  getTasks: async (params = {}) => {
    const response = await api.get("/dashboard/tasks", {
      params,
    });

    return response.data;
  },

  /**
   * Get employee performance data.
   */
  getEmployeePerformance: async (params = {}) => {
    const response = await api.get(
      "/dashboard/employee-performance",
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * Get recent leads.
   */
  getRecentLeads: async (params = {}) => {
    const response = await api.get(
      "/dashboard/recent/leads",
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * Get recent quotations.
   */
  getRecentQuotations: async (params = {}) => {
    const response = await api.get(
      "/dashboard/recent/quotations",
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * Get recent invoices.
   */
  getRecentInvoices: async (params = {}) => {
    const response = await api.get(
      "/dashboard/recent/invoices",
      {
        params,
      }
    );

    return response.data;
  },

  /**
   * Get upcoming tasks.
   */
  getUpcomingTasks: async (params = {}) => {
    const response = await api.get(
      "/dashboard/upcoming-tasks",
      {
        params,
      }
    );

    return response.data;
  },
};

export default dashboardService;