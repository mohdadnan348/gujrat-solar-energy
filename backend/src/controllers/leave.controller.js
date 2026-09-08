const leaveService = require("../services/leave.service");

const createLeaveRequest = async (
  req,
  res,
  next
) => {
  try {
    const leaveRequest =
      await leaveService.createLeaveRequest(
        req.body,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveRequest = async (
  req,
  res,
  next
) => {
  try {
    const leaveRequest =
      await leaveService.getLeaveRequestById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Leave request fetched successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveRequests = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee,
      leaveType,
      status,
      startDate,
      endDate,
    } = req.query;

    const result =
      await leaveService.getLeaveRequests({
        page,
        limit,
        employee,
        leaveType,
        status,
        startDate,
        endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Leave requests fetched successfully",
      data: result.leaveRequests,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMyLeaveRequests = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      leaveType,
      status,
      startDate,
      endDate,
    } = req.query;

    const result =
      await leaveService.getMyLeaveRequests(
        req.user.userId,
        {
          page,
          limit,
          leaveType,
          status,
          startDate,
          endDate,
        }
      );

    return res.status(200).json({
      success: true,
      message: "My leave requests fetched successfully",
      data: result.leaveRequests,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveRequest = async (
  req,
  res,
  next
) => {
  try {
    const leaveRequest =
      await leaveService.updateLeaveRequest(
        req.params.id,
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Leave request updated successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const approveLeaveRequest = async (
  req,
  res,
  next
) => {
  try {
    const leaveRequest =
      await leaveService.approveLeaveRequest(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const rejectLeaveRequest = async (
  req,
  res,
  next
) => {
  try {
    const { reason } = req.body;

    const leaveRequest =
      await leaveService.rejectLeaveRequest(
        req.params.id,
        reason,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Leave request rejected successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const cancelLeaveRequest = async (
  req,
  res,
  next
) => {
  try {
    const { reason } = req.body;

    const leaveRequest =
      await leaveService.cancelLeaveRequest(
        req.params.id,
        reason,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Leave request cancelled successfully",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveBalance = async (
  req,
  res,
  next
) => {
  try {
    const {
      year = new Date().getFullYear(),
    } = req.query;

    const balance =
      await leaveService.getLeaveBalanceForEmployee(
        req.params.employeeId,
        Number(year)
      );

    return res.status(200).json({
      success: true,
      message: "Leave balance fetched successfully",
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

const getMyLeaveBalance = async (
  req,
  res,
  next
) => {
  try {
    const {
      year = new Date().getFullYear(),
    } = req.query;

    const balance =
      await leaveService.getLeaveBalanceForEmployee(
        req.user.userId,
        Number(year)
      );

    return res.status(200).json({
      success: true,
      message: "My leave balance fetched successfully",
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveRequest,
  getLeaveRequest,
  getLeaveRequests,
  getMyLeaveRequests,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance,
  getMyLeaveBalance,
};