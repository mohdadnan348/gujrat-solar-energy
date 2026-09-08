const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },

    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      uppercase: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "STATUS_CHANGE",
        "ASSIGN",
        "APPROVE",
        "REJECT",
        "CANCEL",
        "SEND",
        "PAYMENT",
        "UPLOAD",
        "DOWNLOAD",
        "OTHER",
      ],
      default: "OTHER",
    },

    module: {
      type: String,
      required: [true, "Module is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    recordType: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    beforeData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    afterData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ recordId: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema
);

module.exports = ActivityLog;