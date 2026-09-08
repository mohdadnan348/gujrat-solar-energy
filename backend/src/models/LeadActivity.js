const mongoose = require("mongoose");

const leadActivitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },

    activityType: {
      type: String,
      required: [true, "Activity type is required"],
      trim: true,
    },

    title: {
      type: String,
      required: [true, "Activity title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      trim: true,
      default: "",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadActivitySchema.index({ lead: 1, createdAt: -1 });
leadActivitySchema.index({ activityType: 1 });
leadActivitySchema.index({ followUpDate: 1 });
leadActivitySchema.index({ createdBy: 1 });
leadActivitySchema.index({ assignedTo: 1 });

const LeadActivity = mongoose.model(
  "LeadActivity",
  leadActivitySchema
);

module.exports = LeadActivity;