const systemConfigurationService = require("../services/systemConfiguration.service");

const createSystemConfiguration = async (
  req,
  res,
  next
) => {
  try {
    const configuration =
      await systemConfigurationService.createSystemConfiguration(
        req.body,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message:
        "System configuration created successfully",
      data: configuration,
    });
  } catch (error) {
    next(error);
  }
};

const getSystemConfiguration = async (
  req,
  res,
  next
) => {
  try {
    const configuration =
      await systemConfigurationService.getSystemConfigurationById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "System configuration fetched successfully",
      data: configuration,
    });
  } catch (error) {
    next(error);
  }
};

const getConfigurationsByLead = async (
  req,
  res,
  next
) => {
  try {
    const configurations =
      await systemConfigurationService.getConfigurationsByLead(
        req.params.leadId
      );

    return res.status(200).json({
      success: true,
      message:
        "System configurations fetched successfully",
      data: configurations,
    });
  } catch (error) {
    next(error);
  }
};

const getLatestConfigurationByLead = async (
  req,
  res,
  next
) => {
  try {
    const configuration =
      await systemConfigurationService.getLatestConfigurationByLead(
        req.params.leadId
      );

    return res.status(200).json({
      success: true,
      message:
        "Latest system configuration fetched successfully",
      data: configuration,
    });
  } catch (error) {
    next(error);
  }
};

const getSystemConfigurations = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      customer,
      lead,
      solarRequirement,
      startDate,
      endDate,
    } = req.query;

    const result =
      await systemConfigurationService.getSystemConfigurations({
        page,
        limit,
        search,
        customer,
        lead,
        solarRequirement,
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message:
        "System configurations fetched successfully",
      data: result.configurations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateSystemConfiguration = async (
  req,
  res,
  next
) => {
  try {
    const configuration =
      await systemConfigurationService.updateSystemConfiguration(
        req.params.id,
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "System configuration updated successfully",
      data: configuration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSystemConfiguration,
  getSystemConfiguration,
  getConfigurationsByLead,
  getLatestConfigurationByLead,
  getSystemConfigurations,
  updateSystemConfiguration,
};