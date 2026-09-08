const invoiceService = require("../services/invoice.service");

const createInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.createInvoice(
      req.body,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const createInvoiceFromQuotation = async (req, res, next) => {
  try {
    const invoice =
      await invoiceService.createInvoiceFromQuotation(
        req.params.quotationId,
        req.body,
        req.user._id
      );

    return res.status(201).json({
      success: true,
      message:
        "Invoice created successfully from quotation",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice =
      await invoiceService.getInvoiceById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Invoice fetched successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const result = await invoiceService.getInvoices(
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice =
      await invoiceService.updateInvoice(
        req.params.id,
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const issueInvoice = async (req, res, next) => {
  try {
    const invoice =
      await invoiceService.issueInvoice(
        req.params.id,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Invoice issued successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const cancelInvoice = async (req, res, next) => {
  try {
    const invoice =
      await invoiceService.cancelInvoice(
        req.params.id,
        req.body.reason,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Invoice cancelled successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceItems = async (req, res, next) => {
  try {
    const items =
      await invoiceService.getInvoiceItems(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Invoice items fetched successfully",
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

const markInvoicesOverdue = async (req, res, next) => {
  try {
    const result =
      await invoiceService.markInvoicesOverdue();

    return res.status(200).json({
      success: true,
      message: "Overdue invoices updated successfully",
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
  createInvoice,
  createInvoiceFromQuotation,
  getInvoice,
  getInvoices,
  updateInvoice,
  issueInvoice,
  cancelInvoice,
  getInvoiceItems,
  markInvoicesOverdue,
};1