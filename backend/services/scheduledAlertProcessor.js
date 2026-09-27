const ScheduledAlert = require("../models/ScheduledAlert");
const AlertLog = require("../models/AlertLog");
const User = require("../models/User");
const smsService = require("./smsService");

/**
 * Scheduled Alert Processor Service
 * Processes scheduled alerts and sends SMS to eligible users
 */

/**
 * Check if user is eligible to receive the alert
 */
const isUserEligible = (user, alert) => {
  // Check if user opted in
  if (!user.optInSMS) return false;

  // Check disaster type preference
  const disasterKey = alert.disasterType + "Alerts";
  if (user.smsPreferences && user.smsPreferences[disasterKey] === false) {
    return false;
  }

  // Check minimum severity threshold
  if (user.smsPreferences) {
    const severityLevels = ["Low", "Medium", "High", "Critical"];
    const alertSeverityIndex = severityLevels.indexOf(alert.severity);
    const minimumSeverityIndex = severityLevels.indexOf(
      user.smsPreferences.minimumSeverity || "Low"
    );

    if (alertSeverityIndex < minimumSeverityIndex) {
      return false;
    }
  }

  // Check quiet hours
  if (user.smsPreferences && user.smsPreferences.quietHours?.enabled) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    if (
      currentTime >= user.smsPreferences.quietHours.startTime &&
      currentTime < user.smsPreferences.quietHours.endTime
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Calculate next occurrence for recurring alerts
 */
const calculateNextOccurrence = (currentDate, pattern) => {
  const next = new Date(currentDate);

  switch (pattern) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null; // No next occurrence for 'once'
  }

  return next;
};

/**
 * Process pending scheduled alerts
 * This function should be called by a scheduler (e.g., node-cron or Agenda)
 * every minute to check and send pending alerts
 */
exports.processPendingAlerts = async () => {
  try {
    const now = new Date();

    // Find all scheduled alerts that are due
    const pendingAlerts = await ScheduledAlert.find({
      status: "scheduled",
      scheduledFor: { $lte: now },
    })
      .populate("createdBy", "name email")
      .populate("templateId", "name message");

    console.log(
      `[ScheduledAlertProcessor] Found ${pendingAlerts.length} pending alerts`
    );

    for (const alert of pendingAlerts) {
      try {
        await processAlert(alert);
      } catch (error) {
        console.error(
          `[ScheduledAlertProcessor] Error processing alert ${alert._id}:`,
          error.message
        );
        // Update alert with failure reason
        alert.status = "failed";
        alert.failureReason = error.message;
        await alert.save();
      }
    }

    console.log("[ScheduledAlertProcessor] Processing completed");
  } catch (error) {
    console.error(
      "[ScheduledAlertProcessor] Fatal error in processing:",
      error.message
    );
  }
};

/**
 * Process individual alert
 */
async function processAlert(alert) {
  // Find eligible users in the alert's location
  const query = {
    optInSMS: true,
    $or: [
      { location: { $regex: alert.location, $options: "i" } },
      { state: alert.state },
    ],
  };

  const users = await User.find(query).select(
    "phone location state smsPreferences optInSMS"
  );

  console.log(
    `[ScheduledAlertProcessor] Alert ${alert._id} targeting ${users.length} users in ${alert.location}`
  );

  // Filter eligible users
  const eligibleUsers = users.filter((user) => isUserEligible(user, alert));

  console.log(
    `[ScheduledAlertProcessor] ${eligibleUsers.length} users are eligible after preference filtering`
  );

  if (eligibleUsers.length === 0) {
    // No eligible users, mark as sent anyway
    alert.status = "sent";
    alert.sentAt = new Date();
    await alert.save();
    return;
  }

  // Send SMS to eligible users in batches
  const phoneNumbers = eligibleUsers.map((u) => u.phone);

  try {
    const result = await smsService.sendBulkSMS(
      phoneNumbers,
      alert.message,
      alert.disasterType
    );

    // Log each message
    for (const user of eligibleUsers) {
      await AlertLog.create({
        alertId: alert._id,
        userId: user._id,
        phoneNumber: user.phone,
        message: alert.message,
        status: "sent",
        disasterType: alert.disasterType,
        sentAt: new Date(),
      });

      // Update user SMS activity
      user.smsActivity.lastAlertReceived = new Date();
      user.smsActivity.totalAlertsReceived =
        (user.smsActivity.totalAlertsReceived || 0) + 1;

      // Update monthly counter
      const thisMonth = new Date().toISOString().slice(0, 7);
      user.smsActivity.alertsThisMonth =
        (user.smsActivity.alertsThisMonth || 0) + 1;

      await user.save();
    }

    // Mark alert as sent
    alert.status = "sent";
    alert.sentAt = new Date();

    // Handle recurring alerts
    if (alert.recurPattern !== "once") {
      // Check if recurrence should continue
      const nextOccurrence = calculateNextOccurrence(
        alert.scheduledFor,
        alert.recurPattern
      );

      if (nextOccurrence) {
        // Check recurrence end date
        if (!alert.recurrenceEnd || nextOccurrence <= alert.recurrenceEnd) {
          // Create new occurrence
          const newAlert = new ScheduledAlert({
            disasterType: alert.disasterType,
            location: alert.location,
            state: alert.state,
            severity: alert.severity,
            message: alert.message,
            templateId: alert.templateId,
            scheduledFor: nextOccurrence,
            recurPattern: alert.recurPattern,
            recurrenceEnd: alert.recurrenceEnd,
            createdBy: alert.createdBy,
            status: "scheduled",
          });

          await newAlert.save();
          console.log(
            `[ScheduledAlertProcessor] Created next occurrence at ${nextOccurrence}`
          );
        }
      }
    }

    await alert.save();
    console.log(
      `[ScheduledAlertProcessor] Alert ${alert._id} sent successfully to ${eligibleUsers.length} users`
    );
  } catch (error) {
    console.error(
      `[ScheduledAlertProcessor] SMS send failed for alert ${alert._id}:`,
      error.message
    );

    // Log failed messages
    for (const user of eligibleUsers) {
      await AlertLog.create({
        alertId: alert._id,
        userId: user._id,
        phoneNumber: user.phone,
        message: alert.message,
        status: "failed",
        disasterType: alert.disasterType,
        failureReason: error.message,
        sentAt: new Date(),
      });
    }

    alert.status = "failed";
    alert.failureReason = error.message;
    await alert.save();

    throw error;
  }
}

/**
 * Get delayed alerts (for monitoring)
 * Returns alerts that were scheduled but are still pending
 */
exports.getDelayedAlerts = async (delayMinutes = 5) => {
  try {
    const threshold = new Date(Date.now() - delayMinutes * 60 * 1000);

    const delayedAlerts = await ScheduledAlert.find({
      status: "scheduled",
      scheduledFor: { $lt: threshold },
    });

    return delayedAlerts;
  } catch (error) {
    console.error("[ScheduledAlertProcessor] Error getting delayed alerts:", error);
    return [];
  }
};

/**
 * Get processing statistics
 */
exports.getProcessingStats = async () => {
  try {
    const stats = await ScheduledAlert.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      scheduled: 0,
      sent: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const item of stats) {
      result[item._id] = item.count;
      result.total += item.count;
    }

    return result;
  } catch (error) {
    console.error("[ScheduledAlertProcessor] Error getting stats:", error);
    return null;
  }
};
