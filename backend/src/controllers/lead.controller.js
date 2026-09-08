const leadService = require("../services/lead.service");

const createLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(
      req.body,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      leadSource,
      assignedTo,
      followUpDate,
      startDate,
      endDate,
    } = req.query;

    const result = await leadService.getLeads({
      page,
      limit,
      search,
      status,
      priority,
      leadSource,
      assignedTo,
      followUpDate,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: result.leads,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMyLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = req.query;

    const employeeId = req.user.employeeId;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile is not linked with this user",
      });
    }

    const result = await leadService.getMyLeads({
      employeeId,
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "My leads fetched successfully",
      data: result.leads,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(
      req.params.id,
      req.body,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const assignLead = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const lead = await leadService.assignLead(
      req.params.id,
      assignedTo,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const transferLead = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const lead = await leadService.transferLead(
      req.params.id,
      assignedTo,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Lead transferred successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const {
      status,
      closedReason,
    } = req.body;

    const lead = await leadService.updateLeadStatus(
      req.params.id,
      status,
      closedReason,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const closeLead = async (req, res, next) => {
  try {
    const { closedReason } = req.body;

    const lead = await leadService.closeLead(
      req.params.id,
      closedReason,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Lead closed successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLead,
  getLeads,
  getMyLeads,
  updateLead,
  assignLead,
  transferLead,
  updateLeadStatus,
  closeLead,
};