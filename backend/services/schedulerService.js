const cron = require("node-cron");
const scheduledAlertProcessor = require("./scheduledAlertProcessor");

let schedulerJob = null;

/**
 * Initialize the scheduled alert scheduler
 * Runs every minute to check and send pending alerts
 */
exports.initializeScheduler = () => {
  try {
    // Schedule to run every minute
    schedulerJob = cron.schedule("* * * * *", async () => {
      console.log("[Scheduler] Running scheduled alert processor...");
      await scheduledAlertProcessor.processPendingAlerts();
    });

    console.log("[Scheduler] Scheduled alert processor initialized");
    return true;
  } catch (error) {
    console.error("[Scheduler] Failed to initialize:", error.message);
    return false;
  }
};

/**
 * Stop the scheduler
 */
exports.stopScheduler = () => {
  if (schedulerJob) {
    schedulerJob.stop();
    console.log("[Scheduler] Scheduler stopped");
    return true;
  }
  return false;
};

/**
 * Check scheduler status
 */
exports.getSchedulerStatus = () => {
  return {
    running: schedulerJob !== null,
    nextRun: schedulerJob ? "Every minute" : "Not running",
  };
};

/**
 * Force immediate processing (for testing)
 */
exports.forceProcessing = async () => {
  try {
    console.log("[Scheduler] Force processing triggered");
    await scheduledAlertProcessor.processPendingAlerts();
    return { success: true, message: "Processing completed" };
  } catch (error) {
    console.error("[Scheduler] Force processing error:", error.message);
    return { success: false, error: error.message };
  }
};
