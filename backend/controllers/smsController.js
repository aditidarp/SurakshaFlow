const User = require("../models/User");
const AlertLog = require("../models/AlertLog");
const { sendBulkSMS, formatAlertMessage } = require("../services/smsService");
const rateLimit = require("express-rate-limit");

/**
 * Send SMS Alert to affected users
 * POST /api/sms-alerts/send
 */
exports.sendSMSAlert = async (req, res) => {
  try {
    const { disasterType, location, state, severity, message, description } =
      req.body;
    const adminId = req.user.id;

    // Validation
    if (!disasterType || !location || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: disasterType, location, message",
      });
    }

    // Check if user is admin
    const user = await User.findById(adminId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can send alerts",
      });
    }

    // Create alert log entry
    const alertLog = new AlertLog({
      disasterType,
      location,
      state,
      severity,
      message,
      description,
      createdBy: adminId,
      status: "pending",
      startTime: new Date(),
    });

    // Find affected users (same location/state with SMS opt-in)
    const affectedUsers = await User.find({
      $or: [
        { location: { $regex: location, $options: "i" } },
        { state: { $regex: state || "" } },
      ],
      optInSMS: true,
      role: { $ne: "admin" }, // Don't send to admins
    }).select("_id name phone");

    if (affectedUsers.length === 0) {
      alertLog.status = "completed";
      alertLog.totalUsersTargeted = 0;
      await alertLog.save();

      return res.status(400).json({
        success: false,
        message: "No users found in the affected area",
        alertLogId: alertLog._id,
      });
    }

    alertLog.totalUsersTargeted = affectedUsers.length;
    alertLog.status = "sending";
    alertLog.alertMessage = formatAlertMessage({
      type: disasterType,
      location,
      severity,
      message,
    });

    await alertLog.save();

    // Send SMS asynchronously (don't block the response)
    setImmediate(async () => {
      try {
        const smsResults = await sendBulkSMS(
          affectedUsers,
          alertLog.alertMessage
        );

        // Process results
        let successful = 0,
          failed = 0;
        const smsLogEntries = smsResults.map((result) => {
          if (result.success) {
            successful++;
          } else {
            failed++;
          }

          return {
            userId: result.userId,
            phone: result.phone,
            status: result.success ? "sent" : "failed",
            messageId: result.messageId || null,
            error: result.error || null,
            timestamp: result.timestamp,
          };
        });

        // Update alert log
        alertLog.smsAttempted = smsResults.length;
        alertLog.smsSuccessful = successful;
        alertLog.smsFailed = failed;
        alertLog.smsLog = smsLogEntries;
        alertLog.status = "completed";
        alertLog.completedAt = new Date();
        alertLog.endTime = new Date();

        await alertLog.save();

        console.log(
          `Alert ${alertLog._id}: Sent to ${successful}/${smsResults.length} users`
        );
      } catch (error) {
        console.error("Error sending bulk SMS:", error);
        alertLog.status = "failed";
        alertLog.smsFailed = alertLog.totalUsersTargeted || smsResults.length;
        await alertLog.save();
      }
    });

    res.status(200).json({
      success: true,
      message: `Alert queued for sending to ${affectedUsers.length} users`,
      alertLogId: alertLog._id,
      totalUsers: affectedUsers.length,
    });
  } catch (error) {
    console.error("Send SMS Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get alert history with SMS status
 * GET /api/sms-alerts/history
 */
exports.getAlertHistory = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const alerts = await AlertLog.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Get Alert History Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get alert details with SMS log
 * GET /api/sms-alerts/:alertId
 */
exports.getAlertDetails = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await AlertLog.findById(alertId)
      .populate("createdBy", "name email")
      .populate("smsLog.userId", "name phone");

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error("Get Alert Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get SMS stats for a specific alert
 * GET /api/sms-alerts/:alertId/stats
 */
exports.getAlertStats = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await AlertLog.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    const stats = {
      alertId: alert._id,
      disasterType: alert.disasterType,
      location: alert.location,
      severity: alert.severity,
      totalUsersTargeted: alert.totalUsersTargeted,
      smsAttempted: alert.smsAttempted,
      smsSuccessful: alert.smsSuccessful,
      smsFailed: alert.smsFailed,
      successRate:
        alert.smsAttempted > 0
          ? ((alert.smsSuccessful / alert.smsAttempted) * 100).toFixed(2) + "%"
          : "N/A",
      status: alert.status,
      createdAt: alert.createdAt,
      completedAt: alert.completedAt,
      duration:
        alert.endTime && alert.startTime
          ? ((alert.endTime - alert.startTime) / 1000).toFixed(2) + " seconds"
          : "In progress",
    };

    res.status(200).json({
      success: true,
      stats,
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
 * Delete failed SMS logs (Admin cleanup)
 * POST /api/sms-alerts/:alertId/retry-failed
 */
exports.retryFailedSMS = async (req, res) => {
  try {
    const { alertId } = req.params;
    const adminId = req.user.id;

    const user = await User.findById(adminId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can retry alerts",
      });
    }

    const alert = await AlertLog.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Get failed SMS entries
    const failedEntries = alert.smsLog.filter((log) => log.status === "failed");

    if (failedEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No failed SMS entries to retry",
      });
    }

    // Get user details for failed entries
    const failedUserIds = failedEntries.map((entry) => entry.userId);
    const failedUsers = await User.find({ _id: { $in: failedUserIds } });

    // Retry sending
    setImmediate(async () => {
      const retryResults = await sendBulkSMS(failedUsers, alert.alertMessage);

      let retrySuccessful = 0;
      retryResults.forEach((result) => {
        const originalIndex = alert.smsLog.findIndex(
          (log) => log.phone === result.phone
        );
        if (originalIndex !== -1) {
          alert.smsLog[originalIndex].status = result.success
            ? "sent"
            : "failed";
          alert.smsLog[originalIndex].messageId = result.messageId || null;
          alert.smsLog[originalIndex].error = result.error || null;
          alert.smsLog[originalIndex].timestamp = result.timestamp;

          if (result.success) retrySuccessful++;
        }
      });

      alert.smsSuccessful += retrySuccessful;
      alert.smsFailed -= retrySuccessful;
      await alert.save();
    });

    res.status(200).json({
      success: true,
      message: `Retrying ${failedEntries.length} failed SMS messages`,
    });
  } catch (error) {
    console.error("Retry Failed SMS Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Make a voice call for alerts
 * POST /api/sms-alerts/voice-call
 * or
 * POST /api/sms-alerts/emergency-voice-call
 */
exports.makeVoiceCall = async (req, res) => {
  try {
    const { toNumber, message } = req.body;

    if (!toNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: toNumber, message",
      });
    }

    // Import the service
    const { makeVoiceCall: makeVoiceCallService } = require("../services/smsService");
    
    const result = await makeVoiceCallService(toNumber, message);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Voice call initiated",
        callSid: result.callSid,
        status: result.status,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to initiate voice call",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Make Voice Call Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
