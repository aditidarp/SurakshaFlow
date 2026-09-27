const mongoose = require("mongoose");

const scheduledAlertSchema = new mongoose.Schema({
  disasterType: {
    type: String,
    enum: ["flood", "earthquake", "cyclone", "fire", "landslide"],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  state: String,
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  message: {
    type: String,
    required: true,
  },
  description: String,
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SMSTemplate",
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  recurPattern: {
    type: String,
    enum: ["once", "daily", "weekly", "monthly"],
    default: "once",
  },
  recurrenceEnd: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "sent", "cancelled", "failed"],
    default: "scheduled",
  },
  sentAt: Date,
  failureReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for scheduled alerts that need to be sent
scheduledAlertSchema.index({ scheduledFor: 1, status: 1 });

module.exports = mongoose.model("ScheduledAlert", scheduledAlertSchema);
