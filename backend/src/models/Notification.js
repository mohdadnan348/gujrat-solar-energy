const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },

    type: {
      type: String,
      required: [true, "Notification type is required"],
      trim: true,
      lowercase: true,
      enum: [
        "lead",
        "follow_up",
        "quotation",
        "invoice",
        "payment",
        "task",
        "attendance",
        "leave",
        "system",
        "other",
      ],
      default: "system",
    },

    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: 1000,
    },

    module: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
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

    actionUrl: {
      type: String,
      trim: true,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Main notification listing
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

// Unread notifications
notificationSchema.index({
  recipient: 1,
  isRead: 1,
});

// Type-wise notifications
notificationSchema.index({
  recipient: 1,
  type: 1,
  createdAt: -1,
});

// Module / record history
notificationSchema.index({
  module: 1,
  recordId: 1,
  createdAt: -1,
});

// Expiry
notificationSchema.index({
  expiresAt: 1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;