import api from "@/services/api";

const BASE_URL = "/system-configurations";

export const getSystemConfigurations = async (params = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getSystemConfigurationById = async (configurationId) => {
  if (!configurationId) {
    throw new Error("System configuration ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${configurationId}`
  );

  return response.data;
};

export const getConfigurationsByLead = async (
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

export const getLatestConfiguration = async (leadId) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/lead/${leadId}/latest`
  );

  return response.data;
};

export const createSystemConfiguration = async (
  configurationData
) => {
  if (
    !configurationData ||
    typeof configurationData !== "object"
  ) {
    throw new Error(
      "System configuration data is required."
    );
  }

  const response = await api.post(
    BASE_URL,
    configurationData
  );

  return response.data;
};

export const updateSystemConfiguration = async (
  configurationId,
  configurationData
) => {
  if (!configurationId) {
    throw new Error("System configuration ID is required.");
  }

  if (
    !configurationData ||
    typeof configurationData !== "object"
  ) {
    throw new Error(
      "System configuration data is required."
    );
  }

  const response = await api.put(
    `${BASE_URL}/${configurationId}`,
    configurationData
  );

  return response.data;
};

const systemConfigurationService = {
  getSystemConfigurations,
  getSystemConfigurationById,
  getConfigurationsByLead,
  getLatestConfiguration,
  createSystemConfiguration,
  updateSystemConfiguration,
};

export default systemConfigurationService;