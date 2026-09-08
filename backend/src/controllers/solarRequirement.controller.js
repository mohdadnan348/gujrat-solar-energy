const solarRequirementService = require("../services/solarRequirement.service");

const createSolarRequirement = async (req, res, next) => {
  try {
    const requirement =
      await solarRequirementService.createSolarRequirement(
        req.body,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message: "Solar requirement created successfully",
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

const getSolarRequirement = async (req, res, next) => {
  try {
    const requirement =
      await solarRequirementService.getSolarRequirementById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Solar requirement fetched successfully",
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

const getSolarRequirementByLead = async (
  req,
  res,
  next
) => {
  try {
    const requirement =
      await solarRequirementService.getSolarRequirementByLead(
        req.params.leadId
      );

    return res.status(200).json({
      success: true,
      message:
        "Solar requirement fetched successfully",
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

const getSolarRequirements = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      systemType,
      customer,
      lead,
      startDate,
      endDate,
    } = req.query;

    const result =
      await solarRequirementService.getSolarRequirements({
        page,
        limit,
        search,
        systemType,
        customer,
        lead,
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message:
        "Solar requirements fetched successfully",
      data: result.requirements,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateSolarRequirement = async (
  req,
  res,
  next
) => {
  try {
    const requirement =
      await solarRequirementService.updateSolarRequirement(
        req.params.id,
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Solar requirement updated successfully",
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

const updateSurveyStatus = async (
  req,
  res,
  next
) => {
  try {
    const { completed } = req.body;

    const requirement =
      await solarRequirementService.updateSurveyStatus(
        req.params.id,
        completed,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Site survey status updated successfully",
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

const addPhotos = async (req, res, next) => {
  try {
    const { photos } = req.body;

    const requirement =
      await solarRequirementService.addPhotos(
        req.params.id,
        photos,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Photos added successfully",
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

const addDocuments = async (
  req,
  res,
  next
) => {
  try {
    const { documents } = req.body;

    const requirement =
      await solarRequirementService.addDocuments(
        req.params.id,
        documents,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Documents added successfully",
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSolarRequirement,
  getSolarRequirement,
  getSolarRequirementByLead,
  getSolarRequirements,
  updateSolarRequirement,
  updateSurveyStatus,
  addPhotos,
  addDocuments,
};