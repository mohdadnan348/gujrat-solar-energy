const taskService = require("../services/task.service");

/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
*/

const createTask = async (
  req,
  res,
  next
) => {
  try {
    const task =
      await taskService.createTask(
        req.body,
        req.user.userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Task
|--------------------------------------------------------------------------
*/

const getTask = async (
  req,
  res,
  next
) => {
  try {
    const task =
      await taskService.getTaskById(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Tasks
|--------------------------------------------------------------------------
*/

const getTasks = async (
  req,
  res,
  next
) => {
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
      dueDateFrom,
      dueDateTo,
    } = req.query;

    const result =
      await taskService.getTasks({
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
        dueDateFrom,
        dueDateTo,
      });

    return res.status(200).json({
      success: true,
      message:
        "Tasks fetched successfully",
      data: result.tasks,
      pagination:
        result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get My Tasks
|--------------------------------------------------------------------------
*/

const getMyTasks = async (
  req,
  res,
  next
) => {
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
      dueDateFrom,
      dueDateTo,
    } = req.query;

    const result =
      await taskService.getMyTasks(
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
          dueDateFrom,
          dueDateTo,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "My tasks fetched successfully",
      data: result.tasks,
      pagination:
        result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
*/

const updateTask = async (
  req,
  res,
  next
) => {
  try {
    const task =
      await taskService.updateTask(
        req.params.id,
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Task Status
|--------------------------------------------------------------------------
*/

const updateTaskStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      completionNotes,
      cancellationReason,
    } = req.body;

    if (!status) {
      const error = new Error(
        "Task status is required"
      );

      error.statusCode = 400;

      throw error;
    }

    const task =
      await taskService.updateTaskStatus(
        req.params.id,
        status,
        req.user.userId,
        {
          completionNotes,
          cancellationReason,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Complete Task
|--------------------------------------------------------------------------
*/

const completeTask = async (
  req,
  res,
  next
) => {
  try {
    const {
      completionNotes = "",
    } = req.body;

    const task =
      await taskService.completeTask(
        req.params.id,
        req.user.userId,
        completionNotes
      );

    return res.status(200).json({
      success: true,
      message:
        "Task completed successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Cancel Task
|--------------------------------------------------------------------------
*/

const cancelTask = async (
  req,
  res,
  next
) => {
  try {
    const {
      cancellationReason = "",
    } = req.body;

    const task =
      await taskService.cancelTask(
        req.params.id,
        req.user.userId,
        cancellationReason
      );

    return res.status(200).json({
      success: true,
      message:
        "Task cancelled successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Overdue Tasks
|--------------------------------------------------------------------------
*/

const getOverdueTasks = async (
  req,
  res,
  next
) => {
  try {
    /*
     * Employee should only receive
     * their own overdue tasks.
     *
     * Admin/Manager can receive
     * all overdue tasks.
     */
    let assignedTo;

    if (
      req.user.role ===
      "EMPLOYEE"
    ) {
      const Employee =
        require("../models/Employee");

      const employee =
        await Employee.findOne({
          user: req.user.userId,
        }).select("_id");

      if (!employee) {
        const error = new Error(
          "Employee profile not found"
        );

        error.statusCode = 404;

        throw error;
      }

      assignedTo =
        employee._id;
    }

    const tasks =
      await taskService.getOverdueTasks({
        assignedTo,
      });

    return res.status(200).json({
      success: true,
      message:
        "Overdue tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Delete / Deactivate Task
|--------------------------------------------------------------------------
*/

const deleteTask = async (
  req,
  res,
  next
) => {
  try {
    const task =
      await taskService.deleteTask(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Task deactivated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

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