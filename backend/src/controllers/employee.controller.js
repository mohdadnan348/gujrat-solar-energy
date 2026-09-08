const employeeService = require("../services/employee.service");

const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(
      req.body,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      department,
      role,
      status,
    } = req.query;

    const result = await employeeService.getEmployees({
      page,
      limit,
      search,
      department,
      role,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: result.employees,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const employee = await employeeService.updateEmployeeStatus(
      req.params.id,
      status,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Employee status updated successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployee(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Employee deactivated successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
};