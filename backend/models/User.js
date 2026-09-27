const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "rescue_team"], default: "user" },
  rescueProfile: {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "RescueTeam" },
    teamName: { type: String },
    organization: { type: String },
    teamType: { type: String },
    operatingState: { type: String },
    operatingDistrict: { type: String },
    status: { type: String, enum: ["AVAILABLE", "BUSY", "OFFLINE"], default: "AVAILABLE" },
    locationSharingEnabled: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] }
    }
  },
  phone: { type: String, required: false, unique: true, sparse: true }, // Phone number with country code (e.g., +91XXXXXXXXXX)
  location: { type: String, required: false }, // City/District name
  state: { type: String }, // State name
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  optInSMS: { type: Boolean, default: true }, // User opted in for SMS alerts
  
  // SMS Notification Preferences
  smsPreferences: {
    floodAlerts: { type: Boolean, default: true },
    earthquakeAlerts: { type: Boolean, default: true },
    cycloneAlerts: { type: Boolean, default: true },
    fireAlerts: { type: Boolean, default: true },
    landslideAlerts: { type: Boolean, default: true },
    
    // Severity filter - send only for specified levels
    minimumSeverity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
    
    // Frequency settings
    alertsPerDay: { type: Number, default: 100 }, // Max alerts per day
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String }, // HH:MM format (24-hour)
      endTime: { type: String }
    },
    
    // Language preference
    language: { type: String, enum: ["english", "hindi", "marathi"], default: "english" },
  },
  
  // SMS Activity Tracking
  smsActivity: {
    lastAlertReceived: Date,
    totalAlertsReceived: { type: Number, default: 0 },
    alertsThisMonth: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
