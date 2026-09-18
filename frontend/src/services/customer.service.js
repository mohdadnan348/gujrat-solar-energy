import api from "@/services/api";

const BASE_URL = "/customers";

/**
 * Get customers with pagination and filters.
 */
export const getCustomers = async (params = {}) => {
  const response = await api.get(BASE_URL, {
    params,
  });

  return response.data;
};

/**
 * Get customer by ID.
 */
export const getCustomerById = async (customerId) => {
  if (!customerId) {
    throw new Error("Customer ID is required.");
  }

  const response = await api.get(`${BASE_URL}/${customerId}`);

  return response.data;
};

/**
 * Get customer linked with a lead.
 */
export const getCustomerByLead = async (leadId) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/lead/${leadId}`
  );

  return response.data;
};

/**
 * Create customer.
 *
 * To create a customer from a lead, include:
 * {
 *   lead: leadId
 * }
 */
export const createCustomer = async (customerData) => {
  if (!customerData || typeof customerData !== "object") {
    throw new Error("Customer data is required.");
  }

  const response = await api.post(
    BASE_URL,
    customerData
  );

  return response.data;
};

/**
 * Convert a lead into a customer.
 *
 * The backend handles lead conversion through
 * the normal customer creation endpoint.
 */
export const convertLeadToCustomer = async (
  leadId,
  customerData = {}
) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.post(BASE_URL, {
    ...customerData,
    lead: leadId,
  });

  return response.data;
};

/**
 * Update customer.
 */
export const updateCustomer = async (
  customerId,
  customerData
) => {
  if (!customerId) {
    throw new Error("Customer ID is required.");
  }

  if (!customerData || typeof customerData !== "object") {
    throw new Error("Customer data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${customerId}`,
    customerData
  );

  return response.data;
};

/**
 * Update customer status.
 */
export const updateCustomerStatus = async (
  customerId,
  status
) => {
  if (!customerId) {
    throw new Error("Customer ID is required.");
  }

  if (!status) {
    throw new Error("Customer status is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${customerId}/status`,
    { status }
  );

  return response.data;
};

/**
 * Deactivate customer.
 */
export const deactivateCustomer = async (customerId) => {
  if (!customerId) {
    throw new Error("Customer ID is required.");
  }

  const response = await api.delete(
    `${BASE_URL}/${customerId}`
  );

  return response.data;
};

/**
 * Search customers.
 */
export const searchCustomers = async (
  search,
  params = {}
) => {
  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      search: search || "",
    },
  });

  return response.data;
};

/**
 * Get customers by status.
 */
export const getCustomersByStatus = async (
  status,
  params = {}
) => {
  if (!status) {
    throw new Error("Customer status is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      status,
    },
  });

  return response.data;
};

/**
 * Get customer statistics.
 *
 * Note:
 * The current backend does not expose a dedicated
 * /customers/stats route, so this function derives
 * statistics from the customer list response.
 */
export const getCustomerStats = async () => {
  const response = await api.get(BASE_URL, {
    params: {
      page: 1,
      limit: 100,
    },
  });

  const customers = response?.data?.data || [];

  const byStatus = {};
  const byType = {};

  customers.forEach((customer) => {
    const status = customer.status || "Unknown";
    const type = customer.customerType || "Unknown";

    byStatus[status] = (byStatus[status] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;
  });

  return {
    ...response.data,
    data: {
      byStatus: Object.entries(byStatus).map(
        ([status, count]) => ({
          _id: status,
          count,
        })
      ),
      byType: Object.entries(byType).map(
        ([type, count]) => ({
          _id: type,
          count,
        })
      ),
    },
  };
};

const customerService = {
  getCustomers,
  getCustomerById,
  getCustomerByLead,
  createCustomer,
  convertLeadToCustomer,
  updateCustomer,
  updateCustomerStatus,
  deactivateCustomer,
  searchCustomers,
  getCustomersByStatus,
  getCustomerStats,
};

export { customerService };
export default customerService;