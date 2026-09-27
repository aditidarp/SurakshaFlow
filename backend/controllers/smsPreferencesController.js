const User = require("../models/User");

/**
 * Get User SMS Preferences
 * GET /api/user/sms-preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "smsPreferences optInSMS phone location"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      preferences: {
        optInSMS: user.optInSMS,
        phone: user.phone,
        location: user.location,
        ...user.smsPreferences.toObject(),
      },
    });
  } catch (error) {
    console.error("Get SMS Preferences Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update User SMS Preferences
 * PUT /api/user/sms-preferences
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { optInSMS, smsPreferences } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update opt-in status
    if (optInSMS !== undefined) {
      user.optInSMS = optInSMS;
    }

    // Update preferences
    if (smsPreferences) {
      user.smsPreferences = {
        ...user.smsPreferences.toObject(),
        ...smsPreferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "SMS preferences updated successfully",
      preferences: {
        optInSMS: user.optInSMS,
        ...user.smsPreferences.toObject(),
      },
    });
  } catch (error) {
    console.error("Update SMS Preferences Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Toggle Disaster Type Alerts
 * POST /api/user/sms-preferences/toggle/:disasterType
 */
exports.toggleDisasterAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { disasterType } = req.params;

    const validTypes = [
      "floodAlerts",
      "earthquakeAlerts",
      "cycloneAlerts",
      "fireAlerts",
      "landslideAlerts",
    ];

    if (!validTypes.includes(disasterType + "Alerts")) {
      return res.status(400).json({
        success: false,
        message: "Invalid disaster type",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const key = disasterType + "Alerts";
    user.smsPreferences[key] = !user.smsPreferences[key];

    await user.save();

    res.status(200).json({
      success: true,
      message: `${disasterType} alerts ${
        user.smsPreferences[key] ? "enabled" : "disabled"
      }`,
      preferences: user.smsPreferences,
    });
  } catch (error) {
    console.error("Toggle Disaster Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Set Quiet Hours
 * POST /api/user/sms-preferences/quiet-hours
 */
exports.setQuietHours = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled, startTime, endTime } = req.body;

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (enabled && (!timeRegex.test(startTime) || !timeRegex.test(endTime))) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:MM (24-hour format)",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.smsPreferences.quietHours = {
      enabled,
      startTime: enabled ? startTime : null,
      endTime: enabled ? endTime : null,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Quiet hours updated successfully",
      quietHours: user.smsPreferences.quietHours,
    });
  } catch (error) {
    console.error("Set Quiet Hours Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Set Minimum Severity Level
 * POST /api/user/sms-preferences/severity
 */
exports.setMinimumSeverity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { severity } = req.body;

    const validSeverities = ["Low", "Medium", "High", "Critical"];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity level",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.smsPreferences.minimumSeverity = severity;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Minimum severity set to ${severity}`,
      minimumSeverity: user.smsPreferences.minimumSeverity,
    });
  } catch (error) {
    console.error("Set Severity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Check if user should receive alert (based on preferences)
 * Called internally and via API for testing
 * POST /api/user/sms-preferences/check
 */
exports.checkAlertEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { disasterType, severity } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.optInSMS) {
      return res.status(200).json({
        eligible: false,
        reason: "User has opted out of SMS alerts",
      });
    }

    const disasterKey = disasterType + "Alerts";
    if (!user.smsPreferences[disasterKey]) {
      return res.status(200).json({
        eligible: false,
        reason: `${disasterType} alerts are disabled`,
      });
    }

    const severityLevels = ["Low", "Medium", "High", "Critical"];
    const incomingSeverityIndex = severityLevels.indexOf(severity);
    const minimumSeverityIndex = severityLevels.indexOf(
      user.smsPreferences.minimumSeverity
    );

    if (incomingSeverityIndex < minimumSeverityIndex) {
      return res.status(200).json({
        eligible: false,
        reason: `Alert severity (${severity}) is below minimum threshold (${user.smsPreferences.minimumSeverity})`,
      });
    }

    // Check quiet hours
    if (user.smsPreferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      if (currentTime >= user.smsPreferences.quietHours.startTime &&
          currentTime < user.smsPreferences.quietHours.endTime) {
        return res.status(200).json({
          eligible: false,
          reason: "Currently in quiet hours",
        });
      }
    }

    res.status(200).json({
      eligible: true,
      reason: "User is eligible to receive this alert",
    });
  } catch (error) {
    console.error("Check Eligibility Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get SMS Activity Stats
 * GET /api/user/sms-preferences/activity
 */
exports.getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("smsActivity");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      activity: user.smsActivity,
    });
  } catch (error) {
    console.error("Get Activity Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
