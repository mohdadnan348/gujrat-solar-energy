import api from "@/services/api";

const BASE_URL = "/quotations";

export const getQuotations = async (params = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getQuotationById = async (quotationId) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${quotationId}`
  );

  return response.data;
};

export const getQuotationItems = async (quotationId) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${quotationId}/items`
  );

  return response.data;
};

export const getQuotationBOM = async (quotationId) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${quotationId}/bom`
  );

  return response.data;
};

export const createQuotation = async (quotationData) => {
  if (!quotationData || typeof quotationData !== "object") {
    throw new Error("Quotation data is required.");
  }

  const response = await api.post(
    BASE_URL,
    quotationData
  );

  return response.data;
};

export const updateQuotation = async (
  quotationId,
  quotationData
) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  if (!quotationData || typeof quotationData !== "object") {
    throw new Error("Quotation data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${quotationId}`,
    quotationData
  );

  return response.data;
};

export const sendQuotation = async (quotationId) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${quotationId}/send`
  );

  return response.data;
};

export const acceptQuotation = async (quotationId) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${quotationId}/accept`
  );

  return response.data;
};

export const rejectQuotation = async (
  quotationId,
  rejectionReason
) => {
  if (!quotationId) {
    throw new Error("Quotation ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${quotationId}/reject`,
    {
      rejectionReason,
    }
  );

  return response.data;
};

export const markQuotationsExpired = async () => {
  const response = await api.patch(
    `${BASE_URL}/mark-expired`
  );

  return response.data;
};

export const searchQuotations = async (
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

export const getQuotationsByStatus = async (
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

const quotationService = {
  getQuotations,
  getQuotationById,
  getQuotationItems,
  getQuotationBOM,
  createQuotation,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  markQuotationsExpired,
  searchQuotations,
  getQuotationsByStatus,
};

export { quotationService };
export default quotationService;