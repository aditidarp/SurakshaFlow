const mongoose = require("mongoose");

const smsTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  disasterType: {
    type: String,
    enum: ["flood", "earthquake", "cyclone", "fire", "landslide"],
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 160,
  },
  description: String,
  variables: [
    {
      name: { type: String }, // e.g., "location", "severity"
      placeholder: { type: String }, // e.g., "{location}", "{severity}"
    },
  ],
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SMSTemplate", smsTemplateSchema);
