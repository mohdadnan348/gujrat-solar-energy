const taskService = require("../services/task.service");

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(
      req.body,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      assignedTo,
      assignedBy,
      lead,
      customer,
      startDate,
      endDate,
    } = req.query;

    const result = await taskService.getTasks({
      page,
      limit,
      search,
      status,
      priority,
      assignedTo,
      assignedBy,
      lead,
      customer,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      lead,
      customer,
      startDate,
      endDate,
    } = req.query;

    const result = await taskService.getMyTasks(
      req.user.userId,
      {
        page,
        limit,
        search,
        status,
        priority,
        lead,
        customer,
        startDate,
        endDate,
      }
    );

    return res.status(200).json({
      success: true,
      message: "My tasks fetched successfully",
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    const task =
      await taskService.updateTaskStatus(
        req.params.id,
        status,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const { completionNotes = "" } = req.body;

    const task =
      await taskService.completeTask(
        req.params.id,
        completionNotes,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Task completed successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const cancelTask = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const task =
      await taskService.cancelTask(
        req.params.id,
        cancellationReason,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Task cancelled successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getOverdueTasks = async (
  req,
  res,
  next
) => {
  try {
    const tasks =
      await taskService.getOverdueTasks();

    return res.status(200).json({
      success: true,
      message: "Overdue tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task =
      await taskService.deleteTask(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Task deactivated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTask,
  getTasks,
  getMyTasks,
  updateTask,
  updateTaskStatus,
  completeTask,
  cancelTask,
  getOverdueTasks,
  deleteTask,
};