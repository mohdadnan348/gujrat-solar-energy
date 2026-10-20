const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    type: {
      type: String,
      enum: ["lead", "quotation", "invoice", "task", "attendance", "leave", "system"],
      default: "system",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    module: { type: String, trim: true, default: "notifications" },
    recordId: { type: mongoose.Schema.Types.ObjectId, default: null },
    recordType: { type: String, trim: true, default: null },
    actionUrl: { type: String, trim: true, default: null },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    expiresAt: { type: Date, default: null },
    isBroadcast: { type: Boolean, default: false, index: true },
    broadcastId: { type: String, default: null, index: true },
    audienceRole: { type: String, enum: ["EMPLOYEE", "MANAGER", "ALL", null], default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdBy: 1, isBroadcast: 1, broadcastId: 1, createdAt: -1 });
notificationSchema.pre("save", function (next) {
  if (this.isModified("isRead")) this.readAt = this.isRead ? new Date() : null;
  next();
});

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
