const userService = require("../services/user.service");

/**
 * Create a new user
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(
      req.body,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role,
      status,
    } = req.query;

    const result = await userService.getUsers({
      page,
      limit,
      search,
      role,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user
 */
const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee profile linked to a user
 */
const getUserEmployee = async (
  req,
  res,
  next
) => {
  try {
    const employee =
      await userService.getUserEmployee(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Employee profile fetched successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const user = await userService.updateUserStatus(
      req.params.id,
      status,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createUser,
  updateUserStatus,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserEmployee,
};