import api from "@/services/api";

const BASE_URL = "/solar-requirements";

export const getSolarRequirements = async (params = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getSolarRequirementById = async (requirementId) => {
  if (!requirementId) {
    throw new Error("Solar requirement ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${requirementId}`
  );

  return response.data;
};

export const getSolarRequirementsByLead = async (
  leadId,
  params = {}
) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/lead/${leadId}`,
    { params }
  );

  return response.data;
};

export const createSolarRequirement = async (
  requirementData
) => {
  if (
    !requirementData ||
    typeof requirementData !== "object"
  ) {
    throw new Error("Solar requirement data is required.");
  }

  const response = await api.post(
    BASE_URL,
    requirementData
  );

  return response.data;
};

export const updateSolarRequirement = async (
  requirementId,
  requirementData
) => {
  if (!requirementId) {
    throw new Error("Solar requirement ID is required.");
  }

  if (
    !requirementData ||
    typeof requirementData !== "object"
  ) {
    throw new Error("Solar requirement data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${requirementId}`,
    requirementData
  );

  return response.data;
};

export const updateSurveyStatus = async (
  requirementId,
  surveyData
) => {
  if (!requirementId) {
    throw new Error("Solar requirement ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${requirementId}/survey-status`,
    surveyData
  );

  return response.data;
};

export const uploadRequirementPhotos = async (
  requirementId,
  formData
) => {
  if (!requirementId) {
    throw new Error("Solar requirement ID is required.");
  }

  if (!(formData instanceof FormData)) {
    throw new Error("Photo upload data must be FormData.");
  }

  const response = await api.patch(
    `${BASE_URL}/${requirementId}/photos`,
    formData
  );

  return response.data;
};

export const uploadRequirementDocuments = async (
  requirementId,
  formData
) => {
  if (!requirementId) {
    throw new Error("Solar requirement ID is required.");
  }

  if (!(formData instanceof FormData)) {
    throw new Error("Document upload data must be FormData.");
  }

  const response = await api.patch(
    `${BASE_URL}/${requirementId}/documents`,
    formData
  );

  return response.data;
};

const solarRequirementService = {
  getSolarRequirements,
  getSolarRequirementById,
  getSolarRequirementsByLead,
  createSolarRequirement,
  updateSolarRequirement,
  updateSurveyStatus,
  uploadRequirementPhotos,
  uploadRequirementDocuments,
};

export default solarRequirementService;