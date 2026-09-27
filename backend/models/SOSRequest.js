const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String },
  phone: { type: String },
  message: { type: String },
  disasterType: { type: String },
  peopleAffected: { type: Number, min: 0 },
  urgency: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lon, lat]
  },
  status: { type: String, enum: ['Pending','Assigned','In Progress','Rescued','Closed'], default: 'Pending' },
  assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'RescueTeam' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

sosSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOSRequest', sosSchema);
