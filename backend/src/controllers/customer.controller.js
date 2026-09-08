const customerService = require("../services/customer.service");

const createCustomer = async (req, res, next) => {
  try {
    const customer =
      await customerService.createCustomer(
        req.body,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const customer =
      await customerService.getCustomerById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      customerType,
      lead,
      city,
      state,
    } = req.query;

    const result =
      await customerService.getCustomers({
        page,
        limit,
        search,
        status,
        customerType,
        lead,
        city,
        state,
      });

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerByLead = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await customerService.getCustomerByLead(
        req.params.leadId
      );

    return res.status(200).json({
      success: true,
      message:
        "Customer linked with lead fetched successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await customerService.updateCustomer(
        req.params.id,
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomerStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    const customer =
      await customerService.updateCustomerStatus(
        req.params.id,
        status,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Customer status updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const deactivateCustomer = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await customerService.deactivateCustomer(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getCustomer,
  getCustomers,
  getCustomerByLead,
  updateCustomer,
  updateCustomerStatus,
  deactivateCustomer,
};