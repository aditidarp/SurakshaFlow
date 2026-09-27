const mongoose = require("mongoose");

const alertLogSchema = new mongoose.Schema({
  disasterType: {
    type: String,
    enum: ["flood", "earthquake", "cyclone", "fire", "landslide"],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  message: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalUsersTargeted: {
    type: Number,
    default: 0,
  },
  smsAttempted: {
    type: Number,
    default: 0,
  },
  smsSuccessful: {
    type: Number,
    default: 0,
  },
  smsFailed: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "sending", "completed", "failed"],
    default: "pending",
  },
  alertMessage: {
    type: String,
  },
  smsLog: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      phone: String,
      status: { type: String, enum: ["sent", "failed"], default: "sent" },
      messageId: String,
      error: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  startTime: Date,
  endTime: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

// Index for faster queries
alertLogSchema.index({ location: 1, createdAt: -1 });
alertLogSchema.index({ status: 1 });

module.exports = mongoose.model("AlertLog", alertLogSchema);
