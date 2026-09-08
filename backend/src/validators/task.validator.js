const mongoose = require("mongoose");

const { TASK_STATUS, LEAD_PRIORITY } = require("../config/constants");

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const validateTask = (req, res, next) => {
  const {
    title,
    description,
    lead,
    customer,
    assignedTo,
    priority,
    status,
    dueDate,
    notes,
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Task title is required",
    });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: "Task title cannot exceed 200 characters",
    });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      success: false,
      message: "Description must be a string",
    });
  }

  if (lead !== undefined && lead !== null && !isValidObjectId(lead)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lead ID",
    });
  }

  if (
    customer !== undefined &&
    customer !== null &&
    !isValidObjectId(customer)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }

  if (!assignedTo) {
    return res.status(400).json({
      success: false,
      message: "Assigned employee is required",
    });
  }

  if (!isValidObjectId(assignedTo)) {
    return res.status(400).json({
      success: false,
      message: "Invalid assigned employee ID",
    });
  }

  if (
    priority !== undefined &&
    !Object.values(LEAD_PRIORITY).includes(priority)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid task priority",
    });
  }

  if (
    status !== undefined &&
    !Object.values(TASK_STATUS).includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status",
    });
  }

  if (dueDate !== undefined && dueDate !== null) {
    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }
  }

  if (notes !== undefined && typeof notes !== "string") {
    return res.status(400).json({
      success: false,
      message: "Notes must be a string",
    });
  }

  return next();
};

const validateTaskUpdate = (req, res, next) => {
  const {
    title,
    description,
    lead,
    customer,
    assignedTo,
    priority,
    status,
    dueDate,
    cancellationReason,
    completionNotes,
    notes,
  } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title must be a non-empty string",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Task title cannot exceed 200 characters",
      });
    }
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      success: false,
      message: "Description must be a string",
    });
  }

  if (lead !== undefined && lead !== null && !isValidObjectId(lead)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lead ID",
    });
  }

  if (
    customer !== undefined &&
    customer !== null &&
    !isValidObjectId(customer)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }

  if (assignedTo !== undefined && !isValidObjectId(assignedTo)) {
    return res.status(400).json({
      success: false,
      message: "Invalid assigned employee ID",
    });
  }

  if (
    priority !== undefined &&
    !Object.values(LEAD_PRIORITY).includes(priority)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid task priority",
    });
  }

  if (
    status !== undefined &&
    !Object.values(TASK_STATUS).includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status",
    });
  }

  if (dueDate !== undefined && dueDate !== null) {
    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }
  }

  if (
    cancellationReason !== undefined &&
    typeof cancellationReason !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Cancellation reason must be a string",
    });
  }

  if (
    completionNotes !== undefined &&
    typeof completionNotes !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Completion notes must be a string",
    });
  }

  if (notes !== undefined && typeof notes !== "string") {
    return res.status(400).json({
      success: false,
      message: "Notes must be a string",
    });
  }

  return next();
};

module.exports = {
  validateTask,
  validateTaskUpdate,
};