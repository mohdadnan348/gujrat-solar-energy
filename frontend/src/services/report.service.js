import api from "@/services/api";

const BASE_URL = "/reports";

const reportService = {
  // Overall report
  getReport: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Lead report
  getLeadReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/leads`, { params });
    return response.data;
  },

  // Quotation report
  getQuotationReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/quotations`, { params });
    return response.data;
  },

  // Invoice report
  getInvoiceReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/invoices`, { params });
    return response.data;
  },

  // Task report
  getTaskReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/tasks`, { params });
    return response.data;
  },

  // Attendance report
  getAttendanceReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/attendance`, { params });
    return response.data;
  },

  // Leave report
  getLeaveReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/leaves`, { params });
    return response.data;
  },

  // Employee report
  getEmployeeReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/employees`, { params });
    return response.data;
  },

  // Sales performance report
  getSalesPerformanceReport: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/sales-performance`, {
      params,
    });
    return response.data;
  },
};

export default reportService;