const quotationService = require("../services/quotation.service");

/*
|--------------------------------------------------------------------------
| Create Quotation
|--------------------------------------------------------------------------
*/

const createQuotation = async (req, res, next) => {
  try {
    const quotation =
      await quotationService.createQuotation(
        req.body,
        req.user._id
      );

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Quotations
|--------------------------------------------------------------------------
*/

const getQuotations = async (req, res, next) => {
  try {
    const result =
      await quotationService.getQuotations(
        req.query
      );

    return res.status(200).json({
      success: true,
      message: "Quotations fetched successfully",
      data: result.quotations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Quotation
|--------------------------------------------------------------------------
*/

const getQuotation = async (req, res, next) => {
  try {
    const quotation =
      await quotationService.getQuotationById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Quotation fetched successfully",
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Quotation
|--------------------------------------------------------------------------
*/

const updateQuotation = async (req, res, next) => {
  try {
    const quotation =
      await quotationService.updateQuotation(
        req.params.id,
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Send Quotation
|--------------------------------------------------------------------------
*/

const sendQuotation = async (req, res, next) => {
  try {
    const quotation =
      await quotationService.sendQuotation(
        req.params.id,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Quotation sent successfully",
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Accept Quotation
|--------------------------------------------------------------------------
*/

const acceptQuotation = async (req, res, next) => {
  try {
    const quotation =
      await quotationService.acceptQuotation(
        req.params.id,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Quotation accepted successfully",
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Reject Quotation
|--------------------------------------------------------------------------
*/

const rejectQuotation = async (req, res, next) => {
  try {
    const quotation =
      await quotationService.rejectQuotation(
        req.params.id,
        req.body.reason,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Quotation rejected successfully",
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Quotation Items
|--------------------------------------------------------------------------
*/

const getQuotationItems = async (req, res, next) => {
  try {
    const items =
      await quotationService.getQuotationItems(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Quotation items fetched successfully",
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Quotation BOM
|--------------------------------------------------------------------------
*/

const getQuotationBOM = async (req, res, next) => {
  try {
    const bom =
      await quotationService.getQuotationBOM(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Quotation BOM fetched successfully",
      data: bom,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Mark Expired Quotations
|--------------------------------------------------------------------------
*/

const markExpiredQuotations = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await quotationService.markExpiredQuotations();

    return res.status(200).json({
      success: true,
      message:
        "Expired quotations updated successfully",
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotation,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  getQuotationItems,
  getQuotationBOM,
  markExpiredQuotations,
};