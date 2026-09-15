import api from "@/services/api";

const BASE_URL = "/leads";

/**
 * Get leads with pagination, search, sorting and filters.
 *
 * Example:
 * getLeads({
 *   page: 1,
 *   limit: 20,
 *   search: "Anvari",
 *   status: "NEW",
 *   priority: "HIGH",
 *   assignedTo: "employeeId",
 *   leadSource: "Website",
 *   startDate: "2026-06-01",
 *   endDate: "2026-06-30"
 * })
 */
export const getLeads = async (params = {}) => {
  const response = await api.get(BASE_URL, {
    params,
  });

  return response.data;
};

/**
 * Get a single lead by ID.
 */
export const getLeadById = async (leadId) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.get(`${BASE_URL}/${leadId}`);

  return response.data;
};

/**
 * Create a new lead.
 */
export const createLead = async (leadData) => {
  if (!leadData || typeof leadData !== "object") {
    throw new Error("Lead data is required.");
  }

  const response = await api.post(BASE_URL, leadData);

  return response.data;
};

/**
 * Update an existing lead.
 */
export const updateLead = async (leadId, leadData) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  if (!leadData || typeof leadData !== "object") {
    throw new Error("Lead data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${leadId}`,
    leadData
  );

  return response.data;
};

/**
 * Assign a lead to an employee.
 */
export const assignLead = async (leadId, employeeId) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${leadId}/assign`,
    {
      assignedTo: employeeId,
    }
  );

  return response.data;
};

/**
 * Transfer a lead from one employee to another.
 */
export const transferLead = async (
  leadId,
  employeeId,
  reason = ""
) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  if (!employeeId) {
    throw new Error("New employee ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${leadId}/transfer`,
    {
      assignedTo: employeeId,
      reason,
    }
  );

  return response.data;
};

/**
 * Update lead status.
 *
 * Backend remains authoritative for valid status transitions.
 *
 * Example statuses:
 * NEW → ASSIGNED → CONTACTED → QUALIFIED
 * → SITE_VISIT → QUOTATION → WON / LOST
 */
export const updateLeadStatus = async (leadId, status, reason = "") => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  if (!status) {
    throw new Error("Lead status is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${leadId}/status`,
    {
      status,
      reason,
    }
  );

  return response.data;
};

/**
 * Close a lead.
 *
 * The backend should determine whether the lead is
 * closed as WON or LOST according to its business rules.
 */
export const closeLead = async (
  leadId,
  status,
  reason = ""
) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  if (!status) {
    throw new Error("Closing status is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${leadId}/close`,
    {
      status,
      reason,
    }
  );

  return response.data;
};

/**
 * Get leads assigned to a particular employee.
 */
export const getAssignedLeads = async (
  employeeId,
  params = {}
) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      assignedTo: employeeId,
    },
  });

  return response.data;
};

/**
 * Get leads by status.
 */
export const getLeadsByStatus = async (
  status,
  params = {}
) => {
  if (!status) {
    throw new Error("Lead status is required.");
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
 * Search leads.
 */
export const searchLeads = async (
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

/**
 * Get follow-up pending/overdue leads.
 */
export const getFollowUpLeads = async (
  type = "pending",
  params = {}
) => {
  const response = await api.get(`${BASE_URL}/follow-ups`, {
    params: {
      ...params,
      type,
    },
  });

  return response.data;
};

/**
 * Get lead statistics.
 */
export const getLeadStats = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/stats`, {
    params,
  });

  return response.data;
};

const leadService = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  assignLead,
  transferLead,
  updateLeadStatus,
  closeLead,
  getAssignedLeads,
  getLeadsByStatus,
  searchLeads,
  getFollowUpLeads,
  getLeadStats,
};

export default leadService;