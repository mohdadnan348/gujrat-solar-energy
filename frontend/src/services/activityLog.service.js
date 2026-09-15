import api from "@/services/api";

/**
 * Activity Log Service
 * --------------------
 * Audit / activity logs ko backend se fetch karne ke liye.
 *
 * IMPORTANT:
 * Activity logs backend-generated hone chahiye.
 * Frontend se create/update/delete operations intentionally expose nahi kiye gaye.
 */

const activityLogService = {
  /**
   * Get all activity logs
   * Supports pagination, search, filters, sorting etc.
   */
  async getActivityLogs(params = {}) {
    const response = await api.get("/activity-logs", {
      params,
    });

    return response.data;
  },

  /**
   * Get single activity log by ID
   */
  async getActivityLogById(id) {
    if (!id) {
      throw new Error("Activity log ID is required");
    }

    const response = await api.get(`/activity-logs/${id}`);

    return response.data;
  },

  /**
   * Get activity logs for a specific entity
   *
   * Example:
   * entityType = "Lead"
   * entityId   = leadId
   */
  async getByEntity(entityType, entityId, params = {}) {
    if (!entityType || !entityId) {
      throw new Error("Entity type and entity ID are required");
    }

    const response = await api.get("/activity-logs", {
      params: {
        ...params,
        entityType,
        entityId,
      },
    });

    return response.data;
  },

  /**
   * Get activity logs created by / related to a specific user
   */
  async getByUser(userId, params = {}) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await api.get("/activity-logs", {
      params: {
        ...params,
        userId,
      },
    });

    return response.data;
  },

  /**
   * Filter logs by action
   *
   * Examples:
   * CREATE
   * UPDATE
   * DELETE
   * LOGIN
   * LOGOUT
   * STATUS_CHANGE
   */
  async getByAction(action, params = {}) {
    if (!action) {
      throw new Error("Action is required");
    }

    const response = await api.get("/activity-logs", {
      params: {
        ...params,
        action,
      },
    });

    return response.data;
  },

  /**
   * Get logs between two dates
   */
  async getByDateRange(startDate, endDate, params = {}) {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    const response = await api.get("/activity-logs", {
      params: {
        ...params,
        startDate,
        endDate,
      },
    });

    return response.data;
  },

  /**
   * Search activity logs
   */
  async searchActivityLogs(search, params = {}) {
    const response = await api.get("/activity-logs", {
      params: {
        ...params,
        search,
      },
    });

    return response.data;
  },
};

export default activityLogService;

// Named exports
export const getActivityLogs =
  activityLogService.getActivityLogs.bind(activityLogService);

export const getActivityLogById =
  activityLogService.getActivityLogById.bind(activityLogService);

export const getActivityLogsByEntity =
  activityLogService.getByEntity.bind(activityLogService);

export const getActivityLogsByUser =
  activityLogService.getByUser.bind(activityLogService);

export const getActivityLogsByAction =
  activityLogService.getByAction.bind(activityLogService);

export const getActivityLogsByDateRange =
  activityLogService.getByDateRange.bind(activityLogService);

export const searchActivityLogs =
  activityLogService.searchActivityLogs.bind(activityLogService);