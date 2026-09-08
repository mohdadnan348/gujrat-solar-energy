const activityLogService = require("../services/activityLog.service");

/**
 * Create activity log
 */

const createActivityLog = async (req, res, next) => {
  try {
    const {
      action,
      module,
      recordId,
      recordType,
      description,
      beforeData,
      afterData,
      metadata,
    } = req.body;

    const activityLog = await activityLogService.createActivityLog({
      user: req.user.userId,
      action,
      module,
      recordId,
      recordType,
      description,
      beforeData,
      afterData,
      metadata,
      ipAddress:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "",
      userAgent: req.get("user-agent") || "",
    });

    return res.status(201).json({
      success: true,
      message: "Activity log created successfully",
      data: activityLog,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get activity log by ID
 */
const getActivityLog = async (req, res, next) => {
  try {
    const activityLog =
      await activityLogService.getActivityLogById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Activity log fetched successfully",
      data: activityLog,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get activity logs
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      user,
      action,
      module,
      recordId,
      startDate,
      endDate,
    } = req.query;

    const result =
      await activityLogService.getActivityLogs({
        page,
        limit,
        search,
        user,
        action,
        module,
        recordId,
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Activity logs fetched successfully",
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs for a specific record
 */
const getRecordActivityLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
    } = req.query;

    const result =
      await activityLogService.getRecordActivityLogs(
        req.params.recordId,
        {
          page,
          limit,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Record activity logs fetched successfully",
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs for a specific user
 */
const getUserActivityLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
    } = req.query;

    const result =
      await activityLogService.getUserActivityLogs(
        req.params.userId,
        {
          page,
          limit,
        }
      );

    return res.status(200).json({
      success: true,
      message: "User activity logs fetched successfully",
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs for a specific module
 */
const getModuleActivityLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = req.query;

    const result =
      await activityLogService.getModuleActivityLogs(
        req.params.module,
        {
          page,
          limit,
          startDate,
          endDate,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Module activity logs fetched successfully",
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivityLog,
  getActivityLog,
  getActivityLogs,
  getRecordActivityLogs,
  getUserActivityLogs,
  getModuleActivityLogs,
};