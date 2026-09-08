const mongoose = require("mongoose");

const {
  TASK_STATUS,
  LEAD_PRIORITY,
} = require("../config/constants");

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: [true, "Task ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional relation with lead
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },

    // Optional relation with customer
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    // Employee responsible for completing task
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned employee is required"],
      index: true,
    },

    // User who created/assigned the task
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by is required"],
    },

    priority: {
      type: String,
      enum: Object.values(LEAD_PRIORITY),
      default: LEAD_PRIORITY.MEDIUM,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
      index: true,
    },

    dueDate: {
      type: Date,
      default: null,
      index: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    completionNotes: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes

// taskId par unique: true already index create karta hai.
// Isliye separate taskId index remove kiya gaya hai.

taskSchema.index({
  assignedTo: 1,
  status: 1,
});

taskSchema.index({
  assignedBy: 1,
});

taskSchema.index({
  createdAt: -1,
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;