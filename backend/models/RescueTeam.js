const mongoose = require('mongoose');

const rescueTeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  members: [{ name: String, phone: String }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }, // [lon, lat]
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

rescueTeamSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RescueTeam', rescueTeamSchema);
