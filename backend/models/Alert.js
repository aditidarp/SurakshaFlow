const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true }, // flood, earthquake, cyclone, fire, landslide
  location: { type: String, required: true }, // Location name (e.g., "Mumbai", "Aurangabad")
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }, // [lon, lat] - optional for geospatial queries
  },
  severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
  status: { type: String, enum: ["Active", "Resolved", "Pending", "Assigned", "Cancelled", "Expired"], default: "Pending" },
  source: { type: String, default: "ADMIN" },
  externalAlertId: { type: String },
  sender: { type: String },
  event: { type: String },
  headline: { type: String },
  instruction: { type: String },
  urgency: { type: String },
  certainty: { type: String },
  sentAt: { type: Date },
  effectiveAt: { type: Date },
  onsetAt: { type: Date },
  expiresAt: { type: Date },
  areaDescription: { type: String },
  polygon: { type: [[Number]] },
  references: { type: [String], default: [] },
  rawPayload: { type: mongoose.Schema.Types.Mixed },
  affectedArea: { type: String }, // Description of affected area
  casualties: { type: Number, default: 0 }, // Number of casualties
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // user/admin who created
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // rescue team assigned
  assignedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  resolutionNotes: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create geospatial index if coordinates are provided
alertSchema.index({ "coordinates": '2dsphere' });
alertSchema.index({ externalAlertId: 1 }, { unique: true, sparse: true });
alertSchema.index({ source: 1, status: 1, expiresAt: 1 });

module.exports = mongoose.model("Alert", alertSchema);
