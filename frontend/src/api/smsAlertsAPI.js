/**
 * SMS Alert API Helper
 * Frontend utility for SMS alert system API calls
 */

import axios from "./axios";

const SMS_ALERTS_API = "/sms-alerts";

/**
 * Send SMS alert to affected users
 * @param {Object} alertData - Alert details
 * @returns {Promise}
 */
export const sendSMSAlert = async (alertData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${SMS_ALERTS_API}/send`, alertData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to send alert",
      details: error.response?.data,
    };
  }
};

/**
 * Get alert history with optional filters
 * @param {Object} filters - Query filters (status, startDate, endDate)
 * @returns {Promise}
 */
export const getAlertHistory = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${SMS_ALERTS_API}/history?${params}` : `${SMS_ALERTS_API}/history`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch history",
      details: error.response?.data,
    };
  }
};

/**
 * Get detailed alert information with SMS logs
 * @param {string} alertId - Alert ID
 * @returns {Promise}
 */
export const getAlertDetails = async (alertId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${SMS_ALERTS_API}/${alertId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch alert details",
      details: error.response?.data,
    };
  }
};

/**
 * Get alert statistics (success rate, timing, etc.)
 * @param {string} alertId - Alert ID
 * @returns {Promise}
 */
export const getAlertStats = async (alertId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${SMS_ALERTS_API}/${alertId}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch stats",
      details: error.response?.data,
    };
  }
};

/**
 * Retry failed SMS messages for an alert
 * @param {string} alertId - Alert ID
 * @returns {Promise}
 */
export const retryFailedSMS = async (alertId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${SMS_ALERTS_API}/${alertId}/retry-failed`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to retry SMS",
      details: error.response?.data,
    };
  }
};

/**
 * Validate alert form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors
 */
export const validateAlertForm = (formData) => {
  const errors = {};

  if (!formData.disasterType) {
    errors.disasterType = "Disaster type is required";
  }

  if (!formData.location || formData.location.trim().length === 0) {
    errors.location = "Location is required";
  }

  if (!formData.message || formData.message.trim().length === 0) {
    errors.message = "Message is required";
  }

  if (formData.message && formData.message.length > 160) {
    errors.message = "Message must be 160 characters or less";
  }

  if (!formData.severity) {
    errors.severity = "Severity level is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format SMS message preview
 * @param {Object} alert - Alert details
 * @returns {string} - Formatted message
 */
export const formatAlertPreview = (alert) => {
  const emoji = {
    flood: "🌊",
    earthquake: "📍",
    cyclone: "🌪️",
    fire: "🔥",
    landslide: "⛰️",
  };

  const icon = emoji[alert.disasterType?.toLowerCase()] || "🚨";
  const severity = alert.severity ? `[${alert.severity.toUpperCase()}]` : "";

  return `${icon} ALERT ${severity}: ${alert.disasterType} in ${alert.location}. ${alert.message}`;
};

/**
 * Get disaster type color
 * @param {string} type - Disaster type
 * @returns {string} - Hex color code
 */
export const getDisasterTypeColor = (type) => {
  const colors = {
    flood: "#3b82f6",
    earthquake: "#ef4444",
    cyclone: "#8b5cf6",
    fire: "#f97316",
    landslide: "#6366f1",
  };
  return colors[type?.toLowerCase()] || "#6b7280";
};

/**
 * Get severity level color
 * @param {string} severity - Severity level
 * @returns {string} - Hex color code
 */
export const getSeverityColor = (severity) => {
  const colors = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
    critical: "#8b0000",
  };
  return colors[severity?.toLowerCase()] || "#6b7280";
};

/**
 * Export alert history as CSV
 * @param {Array} alerts - Alert data
 */
export const exportAlertsAsCSV = (alerts) => {
  const headers = [
    "Disaster Type",
    "Location",
    "Severity",
    "Total Users",
    "SMS Successful",
    "SMS Failed",
    "Success Rate",
    "Status",
    "Created At",
  ];

  const rows = alerts.map((alert) => [
    alert.disasterType,
    alert.location,
    alert.severity,
    alert.totalUsersTargeted,
    alert.smsSuccessful,
    alert.smsFailed,
    `${((alert.smsSuccessful / alert.smsAttempted) * 100).toFixed(2)}%`,
    alert.status,
    new Date(alert.createdAt).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sms-alerts-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

/**
 * Calculate success statistics
 * @param {Array} smsLog - SMS log array
 * @returns {Object} - Statistics object
 */
export const calculateStats = (smsLog = []) => {
  const total = smsLog.length;
  const successful = smsLog.filter((log) => log.status === "sent").length;
  const failed = total - successful;

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0,
  };
};

export default {
  sendSMSAlert,
  getAlertHistory,
  getAlertDetails,
  getAlertStats,
  retryFailedSMS,
  validateAlertForm,
  formatAlertPreview,
  getDisasterTypeColor,
  getSeverityColor,
  exportAlertsAsCSV,
  calculateStats,
};
