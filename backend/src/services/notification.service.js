const Notification = require("../models/Notification");
const User = require("../models/User");

const createNotification = async (data) => {
  if (!data.recipient) {
    const error = new Error(
      "Notification recipient is required"
    );
    error.statusCode = 400;
    throw error;
  }

  const recipient =
    await User.findById(data.recipient)
      .select("_id")
      .lean();

  if (!recipient) {
    const error = new Error(
      "Notification recipient not found"
    );
    error.statusCode = 404;
    throw error;
  }

  const notification =
    await Notification.create({
      recipient: data.recipient,
      type: data.type || "other",
      title: data.title,
      message: data.message,
      priority: data.priority || "normal",
      metadata: data.metadata || {},
      expiresAt: data.expiresAt,
      createdBy: data.createdBy,
    });

  return notification;
};

const getNotifications = async ({
  recipient,
  page = 1,
  limit = 20,
  isRead,
  type,
  priority,
} = {}) => {
  const filter = {};

  if (recipient) {
    filter.recipient = recipient;
  }

  if (isRead !== undefined) {
    filter.isRead =
      isRead === true ||
      isRead === "true";
  }

  if (type) {
    filter.type = type;
  }

  if (priority) {
    filter.priority = priority;
  }

  filter.$or = [
    {
      expiresAt: {
        $exists: false,
      },
    },
    {
      expiresAt: null,
    },
    {
      expiresAt: {
        $gte: new Date(),
      },
    },
  ];

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
    notifications,
    total,
  ] = await Promise.all([
    Notification.find(filter)
      .populate(
        "recipient",
        "username email role"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .sort({
        isRead: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Notification.countDocuments(
      filter
    ),
  ]);

  return {
    notifications,

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

const getNotificationById = async (
  notificationId
) => {
  const notification =
    await Notification.findById(
      notificationId
    )
      .populate(
        "recipient",
        "username email role"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .lean();

  if (!notification) {
    const error = new Error(
      "Notification not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

const markAsRead = async (
  notificationId,
  userId
) => {
  const notification =
    await Notification.findById(
      notificationId
    );

  if (!notification) {
    const error = new Error(
      "Notification not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    String(notification.recipient) !==
    String(userId)
  ) {
    const error = new Error(
      "You are not allowed to update this notification"
    );
    error.statusCode = 403;
    throw error;
  }

  notification.isRead = true;
  notification.readAt = new Date();

  await notification.save();

  return notification;
};

const markAsUnread = async (
  notificationId,
  userId
) => {
  const notification =
    await Notification.findById(
      notificationId
    );

  if (!notification) {
    const error = new Error(
      "Notification not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    String(notification.recipient) !==
    String(userId)
  ) {
    const error = new Error(
      "You are not allowed to update this notification"
    );
    error.statusCode = 403;
    throw error;
  }

  notification.isRead = false;
  notification.readAt = undefined;

  await notification.save();

  return notification;
};

const markAllAsRead = async (
  userId
) => {
  const result =
    await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

  return {
    modifiedCount:
      result.modifiedCount || 0,
  };
};

const getUnreadCount = async (
  userId
) => {
  const count =
    await Notification.countDocuments({
      recipient: userId,
      isRead: false,
      $or: [
        {
          expiresAt: {
            $exists: false,
          },
        },
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            $gte: new Date(),
          },
        },
      ],
    });

  return {
    count,
  };
};

const deleteNotification = async (
  notificationId,
  userId
) => {
  const notification =
    await Notification.findById(
      notificationId
    );

  if (!notification) {
    const error = new Error(
      "Notification not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    String(notification.recipient) !==
    String(userId)
  ) {
    const error = new Error(
      "You are not allowed to delete this notification"
    );
    error.statusCode = 403;
    throw error;
  }

  await Notification.deleteOne({
    _id: notificationId,
  });

  return {
    message:
      "Notification deleted successfully",
  };
};

const deleteExpiredNotifications =
  async () => {
    const result =
      await Notification.deleteMany({
        expiresAt: {
          $lt: new Date(),
        },
      });

    return {
      deleted:
        result.deletedCount || 0,
    };
  };

const createBulkNotifications =
  async ({
    recipients,
    type,
    title,
    message,
    priority = "normal",
    metadata = {},
    expiresAt,
    createdBy,
  }) => {
    if (
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      const error = new Error(
        "Recipients are required"
      );
      error.statusCode = 400;
      throw error;
    }

    const uniqueRecipients = [
      ...new Set(
        recipients.map(
          (id) => String(id)
        )
      ),
    ];

    const users =
      await User.find({
        _id: {
          $in: uniqueRecipients,
        },
      })
        .select("_id")
        .lean();

    if (
      users.length !==
      uniqueRecipients.length
    ) {
      const error = new Error(
        "One or more recipients were not found"
      );
      error.statusCode = 404;
      throw error;
    }

    const documents =
      uniqueRecipients.map(
        (recipient) => ({
          recipient,
          type: type || "other",
          title,
          message,
          priority,
          metadata,
          expiresAt,
          createdBy,
        })
      );

    return Notification.insertMany(
      documents
    );
  };

const notifyUser = async ({
  userId,
  type,
  title,
  message,
  priority,
  metadata,
  expiresAt,
  createdBy,
}) => {
  return createNotification({
    recipient: userId,
    type,
    title,
    message,
    priority,
    metadata,
    expiresAt,
    createdBy,
  });
};

const notifyUsers = async ({
  userIds,
  type,
  title,
  message,
  priority,
  metadata,
  expiresAt,
  createdBy,
}) => {
  return createBulkNotifications({
    recipients: userIds,
    type,
    title,
    message,
    priority,
    metadata,
    expiresAt,
    createdBy,
  });
};

module.exports = {
  createNotification,
  createBulkNotifications,

  getNotifications,
  getNotificationById,

  markAsRead,
  markAsUnread,
  markAllAsRead,

  getUnreadCount,

  deleteNotification,
  deleteExpiredNotifications,

  notifyUser,
  notifyUsers,
};