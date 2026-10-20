const leaveService = require("../services/leave.service");
const Employee = require("../models/Employee");
const LeaveRequest = require("../models/LeaveRequest");
const { ROLES, LEAVE_STATUS } = require("../config/constants");

const getLeaveTypes = async (req, res, next) => {
  try {
    const types = await leaveService.getActiveLeaveTypes(req.user.userId);
    return res.status(200).json({ success: true, message: "Leave types fetched successfully", data: types });
  } catch (error) { next(error); }
};

const getOwnEmployee = async (userId) => Employee.findOne({ user: userId });

const canAccessRequest = async (req, request, { managerTeam = false } = {}) => {
  const role = req.user.role;
  if ([ROLES.ADMIN, ROLES.ADMIN].includes(role)) return true;
  const ownEmployee = await getOwnEmployee(req.user.userId);
  if (!ownEmployee) return false;
  if (String(request.employee?._id || request.employee) === String(ownEmployee._id)) return true;
  if (role === ROLES.ADMIN && managerTeam) {
    const targetEmployee = await Employee.findById(request.employee?._id || request.employee).select("manager").lean();
    return Boolean(targetEmployee && String(targetEmployee.manager || "") === String(ownEmployee._id));
  }
  return false;
};

const createLeaveRequest = async (
  req,
  res,
  next
) => {
  try {
    const payload = { ...req.body };

    // Employees can only submit leave for their own employee profile.
    // Admins may submit a request for the employee selected in the admin form;
    // they do not need a separate Employee profile for their admin account.
    if (req.user.role === ROLES.EMPLOYEE) {
      const ownEmployee = await getOwnEmployee(req.user.userId);
      if (!ownEmployee) {
        return res.status(404).json({ success: false, message: "Employee profile not found for this account." });
      }
      payload.employee = ownEmployee._id.toString();
      payload.status = LEAVE_STATUS.PENDING;
    }

    if (req.user.role === ROLES.ADMIN && !payload.employee) {
      return res.status(400).json({
        success: false,
        message: "Select an employee for the leave request.",
      });
    }
    const leaveRequest = await leaveService.createLeaveRequest(payload, req.user.userId);

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
    const leaveRequest = await leaveService.getLeaveRequestById(req.params.id);
    if (!(await canAccessRequest(req, leaveRequest, { managerTeam: true }))) {
      return res.status(403).json({ success: false, message: "You do not have permission to view this leave request." });
    }

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

    // Admin leave management must show all company requests. Do not require
    // the admin account to also have an Employee document (that caused the
    // "Manager employee profile not found" error on /admin/leaves).
    // Respect an explicit employee filter if the admin selected one.
    const employeeFilter = employee || undefined;
    const result = await leaveService.getLeaveRequests({ page, limit, employee: employeeFilter, leaveType, status, dateFrom: startDate, dateTo: endDate });

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
    const existing = await leaveService.getLeaveRequestById(req.params.id);
    if (!(await canAccessRequest(req, existing, { managerTeam: false }))) {
      return res.status(403).json({ success: false, message: "You can only edit your own leave request." });
    }
    const payload = { ...req.body };
    delete payload.status;
    delete payload.employee;
    const leaveRequest = await leaveService.updateLeaveRequest(req.params.id, payload, req.user.userId);

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
    const existing = await leaveService.getLeaveRequestById(req.params.id);
    if (!(await canAccessRequest(req, existing, { managerTeam: true })) || req.user.role === ROLES.EMPLOYEE) {
      return res.status(403).json({ success: false, message: "You do not have permission to approve this leave request." });
    }
    if (req.user.role === ROLES.ADMIN && String(existing.employee?._id || existing.employee) === String((await getOwnEmployee(req.user.userId))?._id)) {
      return res.status(403).json({ success: false, message: "Managers cannot approve their own leave request." });
    }
    const leaveRequest = await leaveService.approveLeaveRequest(req.params.id, req.user.userId);

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

    const existing = await leaveService.getLeaveRequestById(req.params.id);
    if (!(await canAccessRequest(req, existing, { managerTeam: true })) || req.user.role === ROLES.EMPLOYEE) {
      return res.status(403).json({ success: false, message: "You do not have permission to reject this leave request." });
    }
    if (req.user.role === ROLES.ADMIN && String(existing.employee?._id || existing.employee) === String((await getOwnEmployee(req.user.userId))?._id)) {
      return res.status(403).json({ success: false, message: "Managers cannot reject their own leave request." });
    }
    const leaveRequest = await leaveService.rejectLeaveRequest(req.params.id, req.user.userId, reason || req.body.rejectionReason);

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

    const existing = await leaveService.getLeaveRequestById(req.params.id);
    if (!(await canAccessRequest(req, existing, { managerTeam: false }))) {
      return res.status(403).json({ success: false, message: "You can only cancel your own leave request." });
    }
    if (![ROLES.ADMIN, ROLES.ADMIN].includes(req.user.role) && existing.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: "Only pending leave requests can be cancelled by the requester." });
    }
    const leaveRequest = await leaveService.cancelLeaveRequest(req.params.id, req.user.userId, reason || req.body.cancellationReason);

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

    // Admins can review leave balances across the company; they are not
    // required to have a linked Employee profile.
    const balance = await leaveService.getLeaveBalanceForEmployee(req.params.employeeId, Number(year));

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

    const ownEmployee = await getOwnEmployee(req.user.userId);
    if (!ownEmployee) return res.status(404).json({ success: false, message: "Employee profile not found for this account." });
    const balance = await leaveService.getLeaveBalanceForEmployee(ownEmployee._id, Number(year));

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
  getLeaveTypes,
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