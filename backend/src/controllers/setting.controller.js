const settingService = require("../services/setting.service");

/*
|--------------------------------------------------------------------------
| Get Settings
|--------------------------------------------------------------------------
*/

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getSettings();

    return res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Document Settings
|--------------------------------------------------------------------------
| Quotation / Proposal / Invoice PDF ke liye
|--------------------------------------------------------------------------
*/

const getDocumentSettings = async (req, res, next) => {
  try {
    const settings =
      await settingService.getDocumentSettings();

    return res.status(200).json({
      success: true,
      message: "Document settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update All Settings
|--------------------------------------------------------------------------
*/

const updateSettings = async (req, res, next) => {
  try {
    const settings =
      await settingService.updateSettings(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Company Information
|--------------------------------------------------------------------------
*/

const updateCompany = async (req, res, next) => {
  try {
    const settings =
      await settingService.updateCompany(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Company information updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Bank Details
|--------------------------------------------------------------------------
*/

const updateBankDetails = async (req, res, next) => {
  try {
    const settings =
      await settingService.updateBankDetails(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Authorized Signature
|--------------------------------------------------------------------------
*/

const updateSignature = async (req, res, next) => {
  try {
    const settings =
      await settingService.updateSignature(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Authorized signature updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Proposal Settings
|--------------------------------------------------------------------------
*/

const updateProposalSettings = async (
  req,
  res,
  next
) => {
  try {
    const settings =
      await settingService.updateProposalSettings(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Proposal settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Quotation Settings
|--------------------------------------------------------------------------
*/

const updateQuotationSettings = async (
  req,
  res,
  next
) => {
  try {
    const settings =
      await settingService.updateQuotationSettings(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Quotation settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Invoice Settings
|--------------------------------------------------------------------------
*/

const updateInvoiceSettings = async (
  req,
  res,
  next
) => {
  try {
    const settings =
      await settingService.updateInvoiceSettings(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Invoice settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Tax Settings
|--------------------------------------------------------------------------
*/

const updateTaxSettings = async (
  req,
  res,
  next
) => {
  try {
    const settings =
      await settingService.updateTaxSettings(
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Tax settings updated successfully",
      data: settings,
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