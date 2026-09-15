const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "VIEW",
        "EXPORT",
        "APPROVE",
        "REJECT",
        "SEND",
        "CANCEL",
        "ISSUE",
      ],
    },

    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    entityType: {
      type: String,
      trim: true,
      default: "",
    },

    ipAddress: {
      type: String,
      trim: true,
      default: "",
    },

    userAgent: {
      type: String,
      trim: true,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({
  user: 1,
  createdAt: -1,
});

activityLogSchema.index({
  module: 1,
  createdAt: -1,
});

activityLogSchema.index({
  entityId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ActivityLog",
  activityLogSchema
);