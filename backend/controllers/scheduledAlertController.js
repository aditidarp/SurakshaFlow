const ScheduledAlert = require("../models/ScheduledAlert");
const User = require("../models/User");
const smsService = require("../services/smsService");

/**
 * Schedule an SMS Alert for Future Delivery
 * POST /api/scheduled-alerts
 */
exports.scheduleAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      disasterType,
      location,
      state,
      severity,
      message,
      templateId,
      scheduledFor,
      recurPattern,
      recurrenceEnd,
    } = req.body;

    // Validate required fields
    if (
      !disasterType ||
      !location ||
      !state ||
      !severity ||
      !message ||
      !scheduledFor
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate message length (SMS limit)
    if (message.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Message exceeds 160 character SMS limit",
      });
    }

    // Validate scheduled date
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time must be in the future",
      });
    }

    // Validate recurrence pattern
    const validPatterns = ["once", "daily", "weekly", "monthly"];
    if (recurPattern && !validPatterns.includes(recurPattern)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid recurrence pattern. Must be: once, daily, weekly, or monthly",
      });
    }

    // Validate severity
    const validSeverities = ["Low", "Medium", "High", "Critical"];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity level",
      });
    }

    // Create scheduled alert
    const scheduledAlert = new ScheduledAlert({
      disasterType,
      location,
      state,
      severity,
      message,
      templateId: templateId || null,
      scheduledFor: scheduledDate,
      recurPattern: recurPattern || "once",
      recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
      createdBy: userId,
      status: "scheduled",
    });

    await scheduledAlert.save();

    res.status(201).json({
      success: true,
      message: "Alert scheduled successfully",
      alert: scheduledAlert,
    });
  } catch (error) {
    console.error("Schedule Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get Scheduled Alerts
 * GET /api/scheduled-alerts
 * Query params: status, disasterType, state, page, limit
 */
exports.getScheduledAlerts = async (req, res) => {
  try {
    const { status, disasterType, state, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (disasterType) filter.disasterType = disasterType;
    if (state) filter.state = state;

    const skip = (page - 1) * limit;

    const alerts = await ScheduledAlert.find(filter)
      .populate("createdBy", "name email")
      .populate("templateId", "name message")
      .sort({ scheduledFor: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ScheduledAlert.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: alerts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: alerts.length,
      },
    });
  } catch (error) {
    console.error("Get Scheduled Alerts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get Single Scheduled Alert
 * GET /api/scheduled-alerts/:id
 */
exports.getScheduledAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await ScheduledAlert.findById(id)
      .populate("createdBy", "name email")
      .populate("templateId", "name message");

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Scheduled alert not found",
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Get Scheduled Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update Scheduled Alert
 * PUT /api/scheduled-alerts/:id
 */
exports.updateScheduledAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledFor, message, recurPattern, recurrenceEnd, status } =
      req.body;

    const alert = await ScheduledAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Scheduled alert not found",
      });
    }

    // Only allow updates if alert is still scheduled
    if (alert.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Can only update scheduled alerts",
      });
    }

    // Update fields if provided
    if (scheduledFor) {
      const newDate = new Date(scheduledFor);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }
      if (newDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Scheduled time must be in the future",
        });
      }
      alert.scheduledFor = newDate;
    }

    if (message) {
      if (message.length > 160) {
        return res.status(400).json({
          success: false,
          message: "Message exceeds 160 character SMS limit",
        });
      }
      alert.message = message;
    }

    if (recurPattern) {
      const validPatterns = ["once", "daily", "weekly", "monthly"];
      if (!validPatterns.includes(recurPattern)) {
        return res.status(400).json({
          success: false,
          message: "Invalid recurrence pattern",
        });
      }
      alert.recurPattern = recurPattern;
    }

    if (recurrenceEnd) {
      alert.recurrenceEnd = new Date(recurrenceEnd);
    }

    await alert.save();

    res.status(200).json({
      success: true,
      message: "Scheduled alert updated successfully",
      data: alert,
    });
  } catch (error) {
    console.error("Update Scheduled Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Cancel Scheduled Alert
 * POST /api/scheduled-alerts/:id/cancel
 */
exports.cancelScheduledAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await ScheduledAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Scheduled alert not found",
      });
    }

    if (alert.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Can only cancel scheduled alerts",
      });
    }

    alert.status = "cancelled";
    await alert.save();

    res.status(200).json({
      success: true,
      message: "Scheduled alert cancelled successfully",
      data: alert,
    });
  } catch (error) {
    console.error("Cancel Scheduled Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get Scheduled Alerts Statistics
 * GET /api/scheduled-alerts/stats/overview
 */
exports.getAlertStats = async (req, res) => {
  try {
    const stats = await ScheduledAlert.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const disasterStats = await ScheduledAlert.aggregate([
      {
        $group: {
          _id: "$disasterType",
          count: { $sum: 1 },
        },
      },
    ]);

    const upcomingAlerts = await ScheduledAlert.countDocuments({
      status: "scheduled",
      scheduledFor: { $gt: new Date() },
    });

    res.status(200).json({
      success: true,
      stats: {
        byStatus: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byDisasterType: disasterStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        upcomingAlerts,
      },
    });
  } catch (error) {
    console.error("Get Alert Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get Pending Alerts (for scheduler to process)
 * Internal use - called by scheduler job
 * GET /api/scheduled-alerts/pending
 */
exports.getPendingAlerts = async (req, res) => {
  try {
    const now = new Date();

    const pendingAlerts = await ScheduledAlert.find({
      status: "scheduled",
      scheduledFor: { $lte: now },
    }).populate("createdBy", "name");

    res.status(200).json({
      success: true,
      data: pendingAlerts,
    });
  } catch (error) {
    console.error("Get Pending Alerts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
