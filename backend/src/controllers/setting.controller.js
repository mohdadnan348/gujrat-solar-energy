const settingService = require("../services/setting.service");

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentSettings = async (req, res, next) => {
  try {
    const settings =
      await settingService.getDocumentSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingService.updateSettings(
      req.body,
      req.user?._id
    );

    res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const setting = await settingService.updateCompany(
      req.body,
      req.user?._id
    );

    res.status(200).json({
      success: true,
      message: "Company settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

const updateBankDetails = async (req, res, next) => {
  try {
    const setting =
      await settingService.updateBankDetails(
        req.body,
        req.user?._id
      );

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully.",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

const updateSignature = async (req, res, next) => {
  try {
    const setting =
      await settingService.updateSignature(
        req.body,
        req.user?._id
      );

    res.status(200).json({
      success: true,
      message: "Signature settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

const updateProposalSettings = async (req, res, next) => {
  try {
    const setting =
      await settingService.updateProposalSettings(
        req.body,
        req.user?._id
      );

    res.status(200).json({
      success: true,
      message: "Proposal settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

const updateQuotationSettings = async (req, res, next) => {
  try {
    const setting =
      await settingService.updateQuotationSettings(
        req.body,
        req.user?._id
      );

    res.status(200).json({
      success: true,
      message: "Quotation settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoiceSettings = async (req, res, next) => {
  try {
    const setting =
      await settingService.updateInvoiceSettings(
        req.body,
        req.user?._id
      );

    res.status(200).json({
      success: true,
      message: "Invoice settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

const updateTaxSettings = async (req, res, next) => {
  try {
    const setting =
      await settingService.updateTaxSettings(
        req.body,
        req.user?._id
      );

    res.status(200).json({
      success: true,
      message: "Tax settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  getDocumentSettings,
  updateSettings,
  updateCompany,
  updateBankDetails,
  updateSignature,
  updateProposalSettings,
  updateQuotationSettings,
  updateInvoiceSettings,
  updateTaxSettings,
};