const Task = require("../models/Task");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const User = require("../models/User");

const {
  TASK_STATUS,
  LEAD_PRIORITY,
  ROLES,
} = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateReferences = async ({
  lead,
  customer,
  assignedTo,
  assignedBy,
}) => {
  if (lead) {
    const exists = await Lead.exists({
      _id: lead,
    });

    if (!exists) {
      throw createError("Lead not found", 404);
    }
  }

  if (customer) {
    const exists = await Customer.exists({
      _id: customer,
    });

    if (!exists) {
      throw createError("Customer not found", 404);
    }
  }

  /*
   * Task.assignedTo references Employee.
   */
  if (assignedTo) {
    const employee = await Employee.findById(
      assignedTo
    ).select(
      "_id employeeId name email department designation status user"
    );

    if (!employee) {
      throw createError(
        "Assigned employee not found",
        404
      );
    }

    if (employee.status !== "Active") {
      throw createError(
        "Assigned employee is inactive",
        400
      );
    }
  }

  /*
   * assignedBy references User.
   */
  if (assignedBy) {
    const userExists = await User.exists({
      _id: assignedBy,
    });

    if (!userExists) {
      throw createError(
        "Assigned by user not found",
        404
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| Task ID
|--------------------------------------------------------------------------
|
| Generates:
| TSK-0001
| TSK-0002
| TSK-0003
|
| Existing malformed task IDs are ignored safely.
|
*/

const generateTaskId = async () => {
  const tasks = await Task.find({
    taskId: {
      $regex: /^TSK-\d+$/i,
    },
  })
    .select("taskId")
    .sort({
      taskId: -1,
    })
    .limit(1)
    .lean();

  let nextNumber = 1;

  if (tasks.length > 0) {
    const match = tasks[0].taskId.match(
      /^TSK-(\d+)$/i
    );

    if (match) {
      nextNumber =
        Number(match[1]) + 1;
    }
  }

  let taskId = `TSK-${String(
    nextNumber
  ).padStart(4, "0")}`;

  /*
   * Extra safety against duplicate IDs.
   */
  while (
    await Task.exists({
      taskId,
    })
  ) {
    nextNumber += 1;

    taskId = `TSK-${String(
      nextNumber
    ).padStart(4, "0")}`;
  }

  return taskId;
};

/*
|--------------------------------------------------------------------------
| Employee / User Mapping
|--------------------------------------------------------------------------
*/

/*
 * JWT gives User ID.
 * Task stores Employee ID.
 *
 * User
 *   ↓
 * Employee.user
 *   ↓
 * Employee._id
 */

const getEmployeeByUserId = async (
  userId
) => {
  const employee =
    await Employee.findOne({
      user: userId,
    }).select(
      "_id employeeId name email department designation status user"
    );

  if (!employee) {
    throw createError(
      "Employee profile not found",
      404
    );
  }

  if (employee.status !== "Active") {
    throw createError(
      "Employee account is inactive",
      403
    );
  }

  return employee;
};

/*
|--------------------------------------------------------------------------
| Employee Authorization
|--------------------------------------------------------------------------
*/

const canManageTask = async (
  userId
) => {
  const user = await User.findById(
    userId
  ).select("role status");

  if (!user) {
    throw createError(
      "User not found",
      404
    );
  }

  return (
    user.role === ROLES.ADMIN ||
    user.role === ROLES.MANAGER
  );
};

const ensureEmployeeOwnsTask = async (
  task,
  userId
) => {
  const employee =
    await getEmployeeByUserId(
      userId
    );

  /*
   * assignedTo normally contains the
   * Employee ObjectId here.
   *
   * Also support populated assignedTo
   * safely.
   */
  const assignedToId =
    task.assignedTo?._id ||
    task.assignedTo;

  if (
    String(assignedToId) !==
    String(employee._id)
  ) {
    throw createError(
      "You are not authorized to access this task",
      403
    );
  }

  return employee;
};

/*
|--------------------------------------------------------------------------
| Task Access
|--------------------------------------------------------------------------
*/

const ensureTaskAccess = async (
  task,
  userId
) => {
  const managerAccess =
    await canManageTask(userId);

  if (managerAccess) {
    return true;
  }

  await ensureEmployeeOwnsTask(
    task,
    userId
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
*/

const createTask = async (
  data,
  createdBy
) => {
  await validateReferences({
    lead: data.lead,
    customer: data.customer,
    assignedTo: data.assignedTo,
    assignedBy:
      data.assignedBy ||
      createdBy,
  });

  const taskId =
    await generateTaskId();

  const task =
    await Task.create({
      taskId,

      title: data.title,

      description:
        data.description || "",

      lead: data.lead || null,

      customer:
        data.customer || null,

      /*
       * Employee ID
       */
      assignedTo:
        data.assignedTo,

      /*
       * User ID
       */
      assignedBy:
        data.assignedBy ||
        createdBy,

      priority:
        data.priority ||
        LEAD_PRIORITY.MEDIUM,

      status:
        data.status ||
        TASK_STATUS.PENDING,

      dueDate:
        data.dueDate || null,

      notes:
        data.notes || "",

      createdBy,
    });

  return getTaskById(
    task._id
  );
};

/*
|--------------------------------------------------------------------------
| Build Filter
|--------------------------------------------------------------------------
*/

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
  startDate,
  endDate,
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

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (lead) {
    filter.lead = lead;
  }

  if (customer) {
    filter.customer = customer;
  }

  if (assignedTo) {
    filter.assignedTo =
      assignedTo;
  }

  if (assignedBy) {
    filter.assignedBy =
      assignedBy;
  }

  const from =
    dueDateFrom || startDate;

  const to =
    dueDateTo || endDate;

  if (from || to) {
    filter.dueDate = {};

    if (from) {
      filter.dueDate.$gte =
        new Date(from);
    }

    if (to) {
      filter.dueDate.$lte =
        new Date(to);
    }
  }

  return filter;
};

/*
|--------------------------------------------------------------------------
| Get All Tasks
|--------------------------------------------------------------------------
*/

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
  startDate,
  endDate,
}) => {
  const filter =
    buildFilter({
      search,
      status,
      priority,
      lead,
      customer,
      assignedTo,
      assignedBy,
      dueDateFrom,
      dueDateTo,
      startDate,
      endDate,
    });

  const pageNumber =
    Math.max(
      Number(page),
      1
    );

  const limitNumber =
    Math.max(
      Number(limit),
      1
    );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [
    tasks,
    total,
  ] = await Promise.all([
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
        "employeeId name email department designation status user"
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

    Task.countDocuments(
      filter
    ),
  ]);

  return {
    tasks,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages:
        Math.ceil(
          total /
            limitNumber
        ),
    },
  };
};

/*
|--------------------------------------------------------------------------
| Get Single Task
|--------------------------------------------------------------------------
*/

const getTaskById = async (
  taskId,
  userId = null
) => {
  /*
   * Check authorization BEFORE
   * populating assignedTo.
   *
   * Task.assignedTo references Employee.
   */

  const rawTask =
    await Task.findById(
      taskId
    );

  if (!rawTask) {
    throw createError(
      "Task not found",
      404
    );
  }

  /*
   * Authorization is performed
   * against the raw Employee ObjectId.
   */
  if (userId) {
    await ensureTaskAccess(
      rawTask,
      userId
    );
  }

  /*
   * Populate relations only
   * after authorization.
   */
  const task =
    await Task.findById(
      taskId
    )
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
        "employeeId name email department designation status user"
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

  return task;
};

/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
*/

const updateTask = async (
  taskId,
  data,
  updatedBy
) => {
  const task =
    await Task.findById(
      taskId
    );

  if (!task) {
    throw createError(
      "Task not found",
      404
    );
  }

  /*
   * Only Admin/Manager should
   * update assignment details.
   */
  const managerAccess =
    await canManageTask(
      updatedBy
    );

  if (!managerAccess) {
    await ensureEmployeeOwnsTask(
      task,
      updatedBy
    );

    /*
     * Employee cannot change
     * task ownership.
     */
    if (
      data.assignedTo !==
      undefined
    ) {
      throw createError(
        "Employee cannot reassign a task",
        403
      );
    }

    if (
      data.assignedBy !==
      undefined
    ) {
      throw createError(
        "Employee cannot change task assignment",
        403
      );
    }

    /*
     * Employee cannot directly
     * cancel through updateTask.
     */
    if (
      data.status ===
      TASK_STATUS.CANCELLED
    ) {
      throw createError(
        "Only Admin or Manager can cancel tasks",
        403
      );
    }
  }

  await validateReferences({
    lead: data.lead,
    customer: data.customer,
    assignedTo:
      data.assignedTo,
    assignedBy:
      data.assignedBy,
  });

  const oldStatus =
    task.status;

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

  allowedFields.forEach(
    (field) => {
      if (
        data[field] !==
        undefined
      ) {
        task[field] =
          data[field];
      }
    }
  );

  if (
    data.status !==
    undefined
  ) {
    if (
      !Object.values(
        TASK_STATUS
      ).includes(
        data.status
      )
    ) {
      throw createError(
        "Invalid task status",
        400
      );
    }

    /*
     * Employee cancellation
     * is blocked above.
     */
    if (
      data.status ===
        TASK_STATUS.CANCELLED &&
      !managerAccess
    ) {
      throw createError(
        "Only Admin or Manager can cancel tasks",
        403
      );
    }

    task.status =
      data.status;
  }

  if (
    data.status ===
      TASK_STATUS.IN_PROGRESS &&
    oldStatus !==
      TASK_STATUS.IN_PROGRESS
  ) {
    task.startedAt =
      new Date();
  }

  if (
    data.status ===
      TASK_STATUS.COMPLETED &&
    oldStatus !==
      TASK_STATUS.COMPLETED
  ) {
    task.completedAt =
      new Date();
  }

  if (
    data.status ===
      TASK_STATUS.CANCELLED &&
    oldStatus !==
      TASK_STATUS.CANCELLED
  ) {
    task.cancelledAt =
      new Date();
  }

  task.updatedBy =
    updatedBy;

  await task.save();

  return getTaskById(
    task._id
  );
};

/*
|--------------------------------------------------------------------------
| Update Task Status
|--------------------------------------------------------------------------
*/

const updateTaskStatus = async (
  taskId,
  status,
  updatedBy,
  extraData = {}
) => {
  if (
    !Object.values(
      TASK_STATUS
    ).includes(status)
  ) {
    throw createError(
      "Invalid task status",
      400
    );
  }

  const task =
    await Task.findById(
      taskId
    );

  if (!task) {
    throw createError(
      "Task not found",
      404
    );
  }

  /*
   * First verify access.
   */
  await ensureTaskAccess(
    task,
    updatedBy
  );

  /*
   * Employee cannot bypass
   * the cancellation restriction
   * through the status endpoint.
   */
  const managerAccess =
    await canManageTask(
      updatedBy
    );

  if (
    status ===
      TASK_STATUS.CANCELLED &&
    !managerAccess
  ) {
    throw createError(
      "Only Admin or Manager can cancel tasks",
      403
    );
  }

  const oldStatus =
    task.status;

  task.status =
    status;

  task.updatedBy =
    updatedBy;

  if (
    status ===
      TASK_STATUS.IN_PROGRESS &&
    oldStatus !==
      TASK_STATUS.IN_PROGRESS
  ) {
    task.startedAt =
      new Date();
  }

  if (
    status ===
      TASK_STATUS.COMPLETED &&
    oldStatus !==
      TASK_STATUS.COMPLETED
  ) {
    task.completedAt =
      new Date();

    if (
      extraData.completionNotes
    ) {
      task.completionNotes =
        extraData.completionNotes;
    }
  }

  if (
    status ===
      TASK_STATUS.CANCELLED &&
    oldStatus !==
      TASK_STATUS.CANCELLED
  ) {
    task.cancelledAt =
      new Date();

    if (
      extraData.cancellationReason
    ) {
      task.cancellationReason =
        extraData.cancellationReason;
    }
  }

  await task.save();

  return getTaskById(
    task._id
  );
};

/*
|--------------------------------------------------------------------------
| Assign / Reassign Task
|--------------------------------------------------------------------------
*/

const assignTask = async (
  taskId,
  assignedTo,
  assignedBy
) => {
  await validateReferences({
    assignedTo,
    assignedBy,
  });

  const task =
    await Task.findById(
      taskId
    );

  if (!task) {
    throw createError(
      "Task not found",
      404
    );
  }

  const managerAccess =
    await canManageTask(
      assignedBy
    );

  if (!managerAccess) {
    throw createError(
      "Only Admin or Manager can assign tasks",
      403
    );
  }

  task.assignedTo =
    assignedTo;

  task.assignedBy =
    assignedBy;

  task.updatedBy =
    assignedBy;

  await task.save();

  return getTaskById(
    task._id
  );
};

/*
|--------------------------------------------------------------------------
| Start Task
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Complete Task
|--------------------------------------------------------------------------
*/

const completeTask = async (
  taskId,
  updatedBy,
  completionNotes = ""
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

/*
|--------------------------------------------------------------------------
| Cancel Task
|--------------------------------------------------------------------------
*/

const cancelTask = async (
  taskId,
  updatedBy,
  cancellationReason = ""
) => {
  const task =
    await Task.findById(
      taskId
    );

  if (!task) {
    throw createError(
      "Task not found",
      404
    );
  }

  /*
   * Employee cannot cancel.
   * Service also protects this
   * even if route permissions change.
   */
  const managerAccess =
    await canManageTask(
      updatedBy
    );

  if (!managerAccess) {
    throw createError(
      "Only Admin or Manager can cancel tasks",
      403
    );
  }

  return updateTaskStatus(
    taskId,
    TASK_STATUS.CANCELLED,
    updatedBy,
    {
      cancellationReason,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Employee - My Tasks
|--------------------------------------------------------------------------
*/

const getMyTasks = async (
  userId,
  options = {}
) => {
  /*
   * Convert:
   *
   * User ID
   *   ↓
   * Employee ID
   *
   * because Task.assignedTo = Employee
   */
  const employee =
    await getEmployeeByUserId(
      userId
    );

  return getTasks({
    page:
      options.page ||
      1,

    limit:
      options.limit ||
      10,

    search:
      options.search ||
      "",

    status:
      options.status,

    priority:
      options.priority,

    lead:
      options.lead,

    customer:
      options.customer,

    assignedTo:
      employee._id,

    dueDateFrom:
      options.dueDateFrom,

    dueDateTo:
      options.dueDateTo,

    startDate:
      options.startDate,

    endDate:
      options.endDate,
  });
};

/*
|--------------------------------------------------------------------------
| Tasks By Employee
|--------------------------------------------------------------------------
*/

const getTasksByEmployee = async (
  employeeId,
  options = {}
) => {
  await validateReferences({
    assignedTo:
      employeeId,
  });

  const filter = {
    assignedTo:
      employeeId,
  };

  if (options.status) {
    filter.status =
      options.status;
  }

  if (options.priority) {
    filter.priority =
      options.priority;
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
      "employeeId name email department designation status user"
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

/*
|--------------------------------------------------------------------------
| Tasks By Lead
|--------------------------------------------------------------------------
*/

const getTasksByLead = async (
  leadId
) => {
  return Task.find({
    lead: leadId,
  })
    .populate(
      "assignedTo",
      "employeeId name email department designation status user"
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

/*
|--------------------------------------------------------------------------
| Tasks By Customer
|--------------------------------------------------------------------------
*/

const getTasksByCustomer =
  async (
    customerId
  ) => {
    return Task.find({
      customer: customerId,
    })
      .populate(
        "assignedTo",
        "employeeId name email department designation status user"
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

/*
|--------------------------------------------------------------------------
| Overdue Tasks
|--------------------------------------------------------------------------
*/

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
    filter.assignedTo =
      assignedTo;
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
      "employeeId name email department designation status user"
    )
    .populate(
      "assignedBy",
      "username email role"
    )
    .sort({
      dueDate: 1,
    })
    .limit(
      Number(limit)
    )
    .lean();
};

/*
|--------------------------------------------------------------------------
| Task Stats
|--------------------------------------------------------------------------
*/

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

  const [
    statusStats,
    priorityStats,
  ] = await Promise.all([
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
    byStatus:
      statusStats,

    byPriority:
      priorityStats,
  };
};

/*
|--------------------------------------------------------------------------
| Delete / Deactivate Task
|--------------------------------------------------------------------------
*/

const deleteTask = async (
  taskId,
  updatedBy
) => {
  const task =
    await Task.findById(
      taskId
    );

  if (!task) {
    throw createError(
      "Task not found",
      404
    );
  }

  const managerAccess =
    await canManageTask(
      updatedBy
    );

  if (!managerAccess) {
    throw createError(
      "Only Admin or Manager can deactivate tasks",
      403
    );
  }

  if (
    task.status ===
    TASK_STATUS.COMPLETED
  ) {
    throw createError(
      "Completed task cannot be deleted",
      400
    );
  }

  task.status =
    TASK_STATUS.CANCELLED;

  task.cancelledAt =
    new Date();

  task.cancellationReason =
    "Task deactivated";

  task.updatedBy =
    updatedBy;

  await task.save();

  return {
    message:
      "Task cancelled successfully",
  };
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

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
  getMyTasks,
  getTasksByEmployee,
  getTasksByLead,
  getTasksByCustomer,
  getOverdueTasks,
  getTaskStats,
  deleteTask,
};