import api from "@/services/api";

const BASE_URL = "/settings";

export const getSettings = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

export const getDocumentSettings = async () => {
  const response = await api.get(
    `${BASE_URL}/document`
  );

  return response.data;
};

export const updateSettings = async (settingsData) => {
  if (!settingsData || typeof settingsData !== "object") {
    throw new Error("Settings data is required.");
  }

  const response = await api.put(
    BASE_URL,
    settingsData
  );

  return response.data;
};

export const updateCompany = async (companyData) => {
  if (!companyData || typeof companyData !== "object") {
    throw new Error("Company data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/company`,
    companyData
  );

  return response.data;
};

export const updateBankDetails = async (bankData) => {
  if (!bankData || typeof bankData !== "object") {
    throw new Error("Bank details are required.");
  }

  const response = await api.put(
    `${BASE_URL}/bank`,
    bankData
  );

  return response.data;
};

export const updateSignature = async (signatureData) => {
  if (
    !signatureData ||
    typeof signatureData !== "object"
  ) {
    throw new Error("Signature data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/signature`,
    signatureData
  );

  return response.data;
};

export const updateProposalSettings = async (
  proposalData
) => {
  if (
    !proposalData ||
    typeof proposalData !== "object"
  ) {
    throw new Error("Proposal settings are required.");
  }

  const response = await api.put(
    `${BASE_URL}/proposal`,
    proposalData
  );

  return response.data;
};

export const updateQuotationSettings = async (
  quotationData
) => {
  if (
    !quotationData ||
    typeof quotationData !== "object"
  ) {
    throw new Error("Quotation settings are required.");
  }

  const response = await api.put(
    `${BASE_URL}/quotation`,
    quotationData
  );

  return response.data;
};

export const updateInvoiceSettings = async (
  invoiceData
) => {
  if (
    !invoiceData ||
    typeof invoiceData !== "object"
  ) {
    throw new Error("Invoice settings are required.");
  }

  const response = await api.put(
    `${BASE_URL}/invoice`,
    invoiceData
  );

  return response.data;
};

export const updateTaxSettings = async (taxData) => {
  if (!taxData || typeof taxData !== "object") {
    throw new Error("Tax settings are required.");
  }

  const response = await api.put(
    `${BASE_URL}/tax`,
    taxData
  );

  return response.data;
};

const settingService = {
  getSettings,
  getDocumentSettings,
  updateSettings,
  updateCompany,
  updateBankDetails,
  updateSignature,
  updateProposalSettings,
  updateQuotationSettings,
  updateInvoiceSettings,
  updateTaxSettings,
};

export default settingService;