const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

const getDateRange = (from, to) => {
  const start = from
    ? new Date(from)
    : new Date(
        new Date().setHours(0, 0, 0, 0)
      );

  const end = to
    ? new Date(to)
    : new Date();

  if (Number.isNaN(start.getTime())) {
    const error = new Error(
      "Invalid from date"
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(end.getTime())) {
    const error = new Error(
      "Invalid to date"
    );
    error.statusCode = 400;
    throw error;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (end < start) {
    const error = new Error(
      "To date cannot be before from date"
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    start,
    end,
  };
};

const createLog = async (data) => {
  const log =
    await ActivityLog.create({
      user: data.user,
      action: data.action,
      module: data.module,
      description:
        data.description,
      entityType:
        data.entityType,
      entityId:
        data.entityId,
      oldData:
        data.oldData,
      newData:
        data.newData,
      metadata:
        data.metadata,
      ipAddress:
        data.ipAddress,
      userAgent:
        data.userAgent,
    });

  return log;
};

const createActivityLog = async ({
  user,
  action,
  module,
  description,
  entityType,
  entityId,
  oldData,
  newData,
  metadata,
  ipAddress,
  userAgent,
}) => {
  return createLog({
    user,
    action,
    module,
    description,
    entityType,
    entityId,
    oldData,
    newData,
    metadata,
    ipAddress,
    userAgent,
  });
};

const getLogs = async ({
  page = 1,
  limit = 20,
  user,
  action,
  module,
  entityType,
  entityId,
  from,
  to,
  search = "",
} = {}) => {
  const filter = {};

  if (user) {
    filter.user = user;
  }

  if (action) {
    filter.action = action;
  }

  if (module) {
    filter.module = module;
  }

  if (entityType) {
    filter.entityType =
      entityType;
  }

  if (entityId) {
    filter.entityId = entityId;
  }

  if (from || to) {
    const { start, end } =
      getDateRange(from, to);

    filter.createdAt = {
      $gte: start,
      $lte: end,
    };
  }

  if (search) {
    filter.$or = [
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
      {
        module: {
          $regex: search,
          $options: "i",
        },
      },
      {
        entityType: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

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

  const [
    logs,
    total,
  ] = await Promise.all([
    ActivityLog.find(filter)
      .populate(
        "user",
        "username email role"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    ActivityLog.countDocuments(
      filter
    ),
  ]);

  return {
    logs,

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

const getLogById = async (
  logId
) => {
  const log =
    await ActivityLog.findById(
      logId
    )
      .populate(
        "user",
        "username email role status"
      )
      .lean();

  if (!log) {
    const error = new Error(
      "Activity log not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return log;
};

const getEntityLogs = async (
  entityType,
  entityId,
  options = {}
) => {
  const filter = {
    entityType,
    entityId,
  };

  if (options.action) {
    filter.action =
      options.action;
  }

  const limit = Math.max(
    Number(options.limit || 100),
    1
  );

  return ActivityLog.find(filter)
    .populate(
      "user",
      "username email role"
    )
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();
};

const getUserLogs = async (
  userId,
  options = {}
) => {
  const user =
    await User.findById(userId)
      .select("_id")
      .lean();

  if (!user) {
    const error = new Error(
      "User not found"
    );
    error.statusCode = 404;
    throw error;
  }

  const filter = {
    user: userId,
  };

  if (options.action) {
    filter.action =
      options.action;
  }

  if (options.module) {
    filter.module =
      options.module;
  }

  if (
    options.from ||
    options.to
  ) {
    const { start, end } =
      getDateRange(
        options.from,
        options.to
      );

    filter.createdAt = {
      $gte: start,
      $lte: end,
    };
  }

  const limit = Math.max(
    Number(options.limit || 100),
    1
  );

  return ActivityLog.find(filter)
    .populate(
      "user",
      "username email role"
    )
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();
};

const getModuleLogs = async (
  module,
  options = {}
) => {
  const filter = {
    module,
  };

  if (options.action) {
    filter.action =
      options.action;
  }

  if (
    options.from ||
    options.to
  ) {
    const { start, end } =
      getDateRange(
        options.from,
        options.to
      );

    filter.createdAt = {
      $gte: start,
      $lte: end,
    };
  }

  const limit = Math.max(
    Number(options.limit || 100),
    1
  );

  return ActivityLog.find(filter)
    .populate(
      "user",
      "username email role"
    )
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();
};

const getActivitySummary = async ({
  from,
  to,
} = {}) => {
  const filter = {};

  if (from || to) {
    const { start, end } =
      getDateRange(from, to);

    filter.createdAt = {
      $gte: start,
      $lte: end,
    };
  }

  const [
    actionSummary,
    moduleSummary,
    userSummary,
    dailySummary,
  ] = await Promise.all([
    ActivityLog.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$action",
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

    ActivityLog.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$module",
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

    ActivityLog.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$user",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username:
            "$user.username",
          email: "$user.email",
          role: "$user.role",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    ActivityLog.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),
  ]);

  return {
    actions: actionSummary,
    modules: moduleSummary,
    users: userSummary,
    daily: dailySummary,
  };
};

const deleteOldLogs = async (
  beforeDate
) => {
  const date = new Date(
    beforeDate
  );

  if (Number.isNaN(date.getTime())) {
    const error = new Error(
      "Invalid date"
    );
    error.statusCode = 400;
    throw error;
  }

  // Audit logs are historical records.
  // Do not delete them automatically.
  return {
    deleted: 0,
    message:
      "Audit logs are retained as historical records and are not deleted.",
  };
};

module.exports = {
  createLog,
  createActivityLog,
  getLogs,
  getLogById,
  getEntityLogs,
  getUserLogs,
  getModuleLogs,
  getActivitySummary,
  deleteOldLogs,
};