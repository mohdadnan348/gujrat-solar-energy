import api from "@/services/api";

const BASE_URL = "/lead-activities";

/**
 * Get lead activities.
 *
 * Supports lead-wise activity history and filters.
 *
 * Example:
 * getLeadActivities({
 *   leadId: "LEAD_ID",
 *   page: 1,
 *   limit: 20,
 *   type: "CALL"
 * })
 */
export const getLeadActivities = async (params = {}) => {
  const response = await api.get(BASE_URL, {
    params,
  });

  return response.data;
};

/**
 * Get activities of a specific lead.
 */
export const getActivitiesByLead = async (
  leadId,
  params = {}
) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      leadId,
    },
  });

  return response.data;
};

/**
 * Get a single activity by ID.
 */
export const getLeadActivityById = async (activityId) => {
  if (!activityId) {
    throw new Error("Activity ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${activityId}`
  );

  return response.data;
};

/**
 * Create a new lead activity.
 *
 * Examples:
 * CALL
 * WHATSAPP
 * EMAIL
 * MEETING
 * SITE_VISIT
 * NOTE
 * FOLLOW_UP
 */
export const createLeadActivity = async (activityData) => {
  if (!activityData || typeof activityData !== "object") {
    throw new Error("Activity data is required.");
  }

  if (!activityData.leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.post(
    BASE_URL,
    activityData
  );

  return response.data;
};

/**
 * Update an existing lead activity.
 */
export const updateLeadActivity = async (
  activityId,
  activityData
) => {
  if (!activityId) {
    throw new Error("Activity ID is required.");
  }

  if (!activityData || typeof activityData !== "object") {
    throw new Error("Activity data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${activityId}`,
    activityData
  );

  return response.data;
};

/**
 * Delete an activity.
 *
 * Backend authorization/audit rules remain authoritative.
 */
export const deleteLeadActivity = async (activityId) => {
  if (!activityId) {
    throw new Error("Activity ID is required.");
  }

  const response = await api.delete(
    `${BASE_URL}/${activityId}`
  );

  return response.data;
};

/**
 * Get follow-up activities.
 */
export const getFollowUpActivities = async (
  params = {}
) => {
  const response = await api.get(
    `${BASE_URL}/follow-ups`,
    {
      params,
    }
  );

  return response.data;
};

/**
 * Get activities by activity type.
 */
export const getActivitiesByType = async (
  type,
  params = {}
) => {
  if (!type) {
    throw new Error("Activity type is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      type,
    },
  });

  return response.data;
};

const leadActivityService = {
  getLeadActivities,
  getActivitiesByLead,
  getLeadActivityById,
  createLeadActivity,
  updateLeadActivity,
  deleteLeadActivity,
  getFollowUpActivities,
  getActivitiesByType,
};

export default leadActivityService;