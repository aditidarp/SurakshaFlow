const mongoose = require('mongoose');

const rescueMissionSchema = new mongoose.Schema({
  incident: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
  rescueRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SOSRequest' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'RescueTeam', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['AVAILABLE', 'ASSIGNED', 'ACCEPTED', 'ON THE WAY', 'AT LOCATION', 'RESCUE IN PROGRESS', 'EVACUATION IN PROGRESS', 'RESOURCES NEEDED', 'COMPLETED'], default: 'ASSIGNED' },
  resources: [{ name: String, state: { type: String, enum: ['AVAILABLE', 'IN USE', 'NEEDED'] }, quantity: { type: Number, min: 0 } }],
  updates: [{ message: String, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  startedAt: Date,
  completedAt: Date,
}, { timestamps: true });

rescueMissionSchema.index({ team: 1, status: 1, updatedAt: -1 });
rescueMissionSchema.index({ incident: 1, rescueRequest: 1 });

module.exports = mongoose.model('RescueMission', rescueMissionSchema);