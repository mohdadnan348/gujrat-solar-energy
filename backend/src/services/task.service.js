const Task = require("../models/Task");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const User = require("../models/User");

const {
  TASK_STATUS,
  LEAD_PRIORITY,
} = require("../config/constants");

const { generateId } = require("../utils/generateId");

const validateReferences = async ({
  lead,
  customer,
  assignedTo,
  assignedBy,
}) => {
  if (lead) {
    const exists = await Lead.exists({ _id: lead });

    if (!exists) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (customer) {
    const exists = await Customer.exists({
      _id: customer,
    });

    if (!exists) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }
  }

  /*
   * assignedTo ko Employee ke saath map kar rahe hain.
   * Isse Lead aur Task dono ka assignment
   * same employee system use karega.
   */
  if (assignedTo) {
    const employee = await Employee.findById(
      assignedTo
    );

    if (!employee) {
      const error = new Error(
        "Assigned employee not found"
      );
      error.statusCode = 404;
      throw error;
    }

    if (employee.status !== "Active") {
      const error = new Error(
        "Assigned employee is inactive"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (assignedBy) {
    const userExists = await User.exists({
      _id: assignedBy,
    });

    if (!userExists) {
      const error = new Error(
        "Assigned by user not found"
      );
      error.statusCode = 404;
      throw error;
    }
  }
};

const createTask = async (data, createdBy) => {
  await validateReferences({
    lead: data.lead,
    customer: data.customer,
    assignedTo: data.assignedTo,
    assignedBy: data.assignedBy || createdBy,
  });

  const taskId = await generateId(
    Task,
    "taskId",
    "TSK"
  );

  const task = await Task.create({
    taskId,

    title: data.title,

    description: data.description,

    lead: data.lead,

    customer: data.customer,

    assignedTo: data.assignedTo,

    assignedBy:
      data.assignedBy || createdBy,

    priority:
      data.priority ||
      LEAD_PRIORITY.MEDIUM,

    status:
      data.status ||
      TASK_STATUS.PENDING,

    dueDate: data.dueDate,

    notes: data.notes,

    createdBy,
  });

  return getTaskById(task._id);
};

const buildFilter = ({
  search,
  status,
  priority,
  lead,
  customer,
  assignedTo,
  assignedBy,
  dueDateFrom,
  dueDateTo,
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      {
        taskId: {
          $regex: search,
          $options: "i",
        },
      },
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (status) filter.status = status;

  if (priority) filter.priority = priority;

  if (lead) filter.lead = lead;

  if (customer) filter.customer = customer;

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (assignedBy) {
    filter.assignedBy = assignedBy;
  }

  if (dueDateFrom || dueDateTo) {
    filter.dueDate = {};

    if (dueDateFrom) {
      filter.dueDate.$gte =
        new Date(dueDateFrom);
    }

    if (dueDateTo) {
      filter.dueDate.$lte =
        new Date(dueDateTo);
    }
  }

  return filter;
};

const getTasks = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  priority,
  lead,
  customer,
  assignedTo,
  assignedBy,
  dueDateFrom,
  dueDateTo,
}) => {
  const filter = buildFilter({
    search,
    status,
    priority,
    lead,
    customer,
    assignedTo,
    assignedBy,
    dueDateFrom,
    dueDateTo,
  });

  const pageNumber = Math.max(
    Number(page),
    1
  );

  const limitNumber = Math.max(
    Number(limit),
    1
  );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [tasks, total] =
    await Promise.all([
      Task.find(filter)
        .populate(
          "lead",
          "leadId customerName companyName mobile status"
        )
        .populate(
          "customer",
          "customerId name companyName mobile status"
        )
        .populate(
          "assignedTo",
          "employeeId name email department designation status"
        )
        .populate(
          "assignedBy",
          "username email role"
        )
        .populate(
          "createdBy",
          "username email role"
        )
        .populate(
          "updatedBy",
          "username email role"
        )
        .sort({
          dueDate: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Task.countDocuments(filter),
    ]);

  return {
    tasks,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate(
      "lead",
      "leadId customerName companyName mobile email status"
    )
    .populate(
      "customer",
      "customerId name companyName mobile email status"
    )
    .populate(
      "assignedTo",
      "employeeId name email department designation status"
    )
    .populate(
      "assignedBy",
      "username email role"
    )
    .populate(
      "createdBy",
      "username email role"
    )
    .populate(
      "updatedBy",
      "username email role"
    );

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};

const updateTask = async (
  taskId,
  data,
  updatedBy
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  await validateReferences({
    lead: data.lead,
    customer: data.customer,
    assignedTo: data.assignedTo,
    assignedBy: data.assignedBy,
  });

  const oldStatus = task.status;

  const allowedFields = [
    "title",
    "description",
    "lead",
    "customer",
    "assignedTo",
    "assignedBy",
    "priority",
    "dueDate",
    "notes",
    "completionNotes",
    "cancellationReason",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      task[field] = data[field];
    }
  });

  if (data.status !== undefined) {
    task.status = data.status;
  }

  if (
    data.status === TASK_STATUS.IN_PROGRESS &&
    oldStatus !== TASK_STATUS.IN_PROGRESS
  ) {
    task.startedAt = new Date();
  }

  if (
    data.status === TASK_STATUS.COMPLETED &&
    oldStatus !== TASK_STATUS.COMPLETED
  ) {
    task.completedAt = new Date();
  }

  if (
    data.status === TASK_STATUS.CANCELLED &&
    oldStatus !== TASK_STATUS.CANCELLED
  ) {
    task.cancelledAt = new Date();
  }

  task.updatedBy = updatedBy;

  await task.save();

  return getTaskById(task._id);
};

const updateTaskStatus = async (
  taskId,
  status,
  updatedBy,
  extraData = {}
) => {
  if (
    !Object.values(TASK_STATUS).includes(
      status
    )
  ) {
    const error = new Error(
      "Invalid task status"
    );
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findById(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = task.status;

  task.status = status;
  task.updatedBy = updatedBy;

  if (
    status === TASK_STATUS.IN_PROGRESS &&
    oldStatus !== TASK_STATUS.IN_PROGRESS
  ) {
    task.startedAt = new Date();
  }

  if (
    status === TASK_STATUS.COMPLETED &&
    oldStatus !== TASK_STATUS.COMPLETED
  ) {
    task.completedAt = new Date();

    if (extraData.completionNotes) {
      task.completionNotes =
        extraData.completionNotes;
    }
  }

  if (
    status === TASK_STATUS.CANCELLED &&
    oldStatus !== TASK_STATUS.CANCELLED
  ) {
    task.cancelledAt = new Date();

    if (extraData.cancellationReason) {
      task.cancellationReason =
        extraData.cancellationReason;
    }
  }

  await task.save();

  return getTaskById(task._id);
};

const assignTask = async (
  taskId,
  assignedTo,
  assignedBy
) => {
  await validateReferences({
    assignedTo,
    assignedBy,
  });

  const task = await Task.findById(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  task.assignedTo = assignedTo;
  task.assignedBy = assignedBy;
  task.updatedBy = assignedBy;

  await task.save();

  return getTaskById(task._id);
};

const startTask = async (
  taskId,
  updatedBy
) => {
  return updateTaskStatus(
    taskId,
    TASK_STATUS.IN_PROGRESS,
    updatedBy
  );
};

const completeTask = async (
  taskId,
  updatedBy,
  completionNotes
) => {
  return updateTaskStatus(
    taskId,
    TASK_STATUS.COMPLETED,
    updatedBy,
    {
      completionNotes,
    }
  );
};

const cancelTask = async (
  taskId,
  updatedBy,
  cancellationReason
) => {
  return updateTaskStatus(
    taskId,
    TASK_STATUS.CANCELLED,
    updatedBy,
    {
      cancellationReason,
    }
  );
};

const getTasksByEmployee = async (
  employeeId,
  options = {}
) => {
  const filter = {
    assignedTo: employeeId,
  };

  if (options.status) {
    filter.status = options.status;
  }

  if (options.priority) {
    filter.priority = options.priority;
  }

  return Task.find(filter)
    .populate(
      "lead",
      "leadId customerName companyName mobile status"
    )
    .populate(
      "customer",
      "customerId name companyName mobile status"
    )
    .populate(
      "assignedTo",
      "employeeId name email department designation status"
    )
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .lean();
};

const getTasksByLead = async (leadId) => {
  return Task.find({
    lead: leadId,
  })
    .populate(
      "assignedTo",
      "employeeId name email department designation status"
    )
    .populate(
      "assignedBy",
      "username email role"
    )
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .lean();
};

const getTasksByCustomer = async (
  customerId
) => {
  return Task.find({
    customer: customerId,
  })
    .populate(
      "assignedTo",
      "employeeId name email department designation status"
    )
    .populate(
      "assignedBy",
      "username email role"
    )
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .lean();
};

const getOverdueTasks = async ({
  assignedTo,
  limit = 50,
} = {}) => {
  const filter = {
    dueDate: {
      $lt: new Date(),
    },
    status: {
      $nin: [
        TASK_STATUS.COMPLETED,
        TASK_STATUS.CANCELLED,
      ],
    },
  };

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  return Task.find(filter)
    .populate(
      "lead",
      "leadId customerName companyName mobile status"
    )
    .populate(
      "customer",
      "customerId name companyName mobile status"
    )
    .populate(
      "assignedTo",
      "employeeId name email department designation status"
    )
    .sort({
      dueDate: 1,
    })
    .limit(Number(limit))
    .lean();
};

const getTaskStats = async ({
  assignedTo,
  assignedBy,
} = {}) => {
  const match = {};

  if (assignedTo) {
    match.assignedTo =
      assignedTo;
  }

  if (assignedBy) {
    match.assignedBy =
      assignedBy;
  }

  const [statusStats, priorityStats] =
    await Promise.all([
      Task.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Task.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: "$priority",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),
    ]);

  return {
    byStatus: statusStats,
    byPriority: priorityStats,
  };
};

const deleteTask = async (
  taskId,
  updatedBy
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    task.status === TASK_STATUS.COMPLETED
  ) {
    const error = new Error(
      "Completed task cannot be deleted"
    );
    error.statusCode = 400;
    throw error;
  }

  task.status =
    TASK_STATUS.CANCELLED;

  task.cancelledAt = new Date();

  task.cancellationReason =
    "Task deactivated";

  task.updatedBy = updatedBy;

  await task.save();

  return {
    message:
      "Task cancelled successfully",
  };
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  startTask,
  completeTask,
  cancelTask,
  getTasksByEmployee,
  getTasksByLead,
  getTasksByCustomer,
  getOverdueTasks,
  getTaskStats,
  deleteTask,
};