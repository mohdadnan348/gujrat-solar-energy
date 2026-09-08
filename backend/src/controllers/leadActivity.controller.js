const leadActivityService = require("../services/leadActivity.service");

const createActivity = async (req, res, next) => {
  try {
    const activity = await leadActivityService.createActivity(
      req.params.leadId,
      req.body,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Lead activity created successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

const getLeadActivities = async (req, res, next) => {
  try {
    const activities =
      await leadActivityService.getLeadActivities(
        req.params.leadId
      );

    return res.status(200).json({
      success: true,
      message: "Lead activities fetched successfully",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

const getActivityById = async (req, res, next) => {
  try {
    const activity =
      await leadActivityService.getActivityById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Lead activity fetched successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const activity =
      await leadActivityService.updateActivity(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Lead activity updated successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const result =
      await leadActivityService.deleteActivity(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const getFollowUps = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      assignedTo,
    } = req.query;

    const result =
      await leadActivityService.getFollowUps({
        page,
        limit,
        startDate,
        endDate,
        assignedTo,
      });

    return res.status(200).json({
      success: true,
      message: "Follow-ups fetched successfully",
      data: result.activities,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  getLeadActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getFollowUps,
};