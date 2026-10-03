import api from "@/services/api";

const BASE_URL = "/lead-activities";

/*
|--------------------------------------------------------------------------
| Get activities of a specific lead
|--------------------------------------------------------------------------
| Backend:
| GET /api/v1/lead-activities/lead/:leadId
*/
export const getLeadActivities = async (
  leadId,
  params = {}
) => {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/lead/${leadId}`,
    {
      params,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Alias: Get activities by lead
|--------------------------------------------------------------------------
*/
export const getActivitiesByLead = async (
  leadId,
  params = {}
) => {
  return getLeadActivities(leadId, params);
};

/*
|--------------------------------------------------------------------------
| Get single activity
|--------------------------------------------------------------------------
*/
export const getLeadActivityById = async (
  activityId
) => {
  if (!activityId) {
    throw new Error("Activity ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${activityId}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create lead activity
|--------------------------------------------------------------------------
| Backend:
| POST /api/v1/lead-activities/lead/:leadId
*/
export const createLeadActivity = async (
  activityData
) => {
  if (
    !activityData ||
    typeof activityData !== "object"
  ) {
    throw new Error("Activity data is required.");
  }

  const {
    leadId,
    ...payload
  } = activityData;

  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  const response = await api.post(
    `${BASE_URL}/lead/${leadId}`,
    payload
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update lead activity
|--------------------------------------------------------------------------
*/
export const updateLeadActivity = async (
  activityId,
  activityData
) => {
  if (!activityId) {
    throw new Error("Activity ID is required.");
  }

  if (
    !activityData ||
    typeof activityData !== "object"
  ) {
    throw new Error("Activity data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${activityId}`,
    activityData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Delete lead activity
|--------------------------------------------------------------------------
*/
export const deleteLeadActivity = async (
  activityId
) => {
  if (!activityId) {
    throw new Error("Activity ID is required.");
  }

  const response = await api.delete(
    `${BASE_URL}/${activityId}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get follow-up activities
|--------------------------------------------------------------------------
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

/*
|--------------------------------------------------------------------------
| Get activities by type
|--------------------------------------------------------------------------
*/
export const getActivitiesByType = async (
  type,
  params = {}
) => {
  if (!type) {
    throw new Error("Activity type is required.");
  }

  const response = await api.get(
    `${BASE_URL}/lead/${params.leadId || ""}`,
    {
      params: {
        ...params,
        activityType: type,
      },
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Default service
|--------------------------------------------------------------------------
*/
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