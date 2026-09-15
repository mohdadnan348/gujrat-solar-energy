import api from "@/services/api";

const BASE_URL = "/invoices";

export const getInvoices = async (params = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getInvoiceById = async (invoiceId) => {
  if (!invoiceId) {
    throw new Error("Invoice ID is required.");
  }

  const response = await api.get(`${BASE_URL}/${invoiceId}`);
  return response.data;
};

export const getInvoiceItems = async (invoiceId) => {
  if (!invoiceId) {
    throw new Error("Invoice ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${invoiceId}/items`
  );

  return response.data;
};

export const createInvoice = async (invoiceData) => {
  if (!invoiceData || typeof invoiceData !== "object") {
    throw new Error("Invoice data is required.");
  }

  const response = await api.post(
    BASE_URL,
    invoiceData
  );

  return response.data;
};

export const createInvoiceFromQuotation = async (
  quotationId,
  invoiceData = {}
) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  const response = await api.post(
    `${BASE_URL}/from-quotation/${quotationId}`,
    invoiceData
  );

  return response.data;
};

export const updateInvoice = async (
  invoiceId,
  invoiceData
) => {
  if (!invoiceId) {
    throw new Error("Invoice ID is required.");
  }

  if (!invoiceData || typeof invoiceData !== "object") {
    throw new Error("Invoice data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${invoiceId}`,
    invoiceData
  );

  return response.data;
};

export const issueInvoice = async (invoiceId) => {
  if (!invoiceId) {
    throw new Error("Invoice ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${invoiceId}/issue`
  );

  return response.data;
};

export const cancelInvoice = async (
  invoiceId,
  cancellationReason
) => {
  if (!invoiceId) {
    throw new Error("Invoice ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${invoiceId}/cancel`,
    {
      cancellationReason,
    }
  );

  return response.data;
};

export const markInvoicesOverdue = async () => {
  const response = await api.patch(
    `${BASE_URL}/mark-overdue`
  );

  return response.data;
};

export const searchInvoices = async (
  search,
  params = {}
) => {
  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      search,
    },
  });

  return response.data;
};

export const getInvoicesByStatus = async (
  status,
  params = {}
) => {
  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      status,
    },
  });

  return response.data;
};

const invoiceService = {
  getInvoices,
  getInvoiceById,
  getInvoiceItems,
  createInvoice,
  createInvoiceFromQuotation,
  updateInvoice,
  issueInvoice,
  cancelInvoice,
  markInvoicesOverdue,
  searchInvoices,
  getInvoicesByStatus,
};

export default invoiceService;