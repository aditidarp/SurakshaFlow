import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import "./AdminSMSAlert.css";

const AdminSMSAlert = () => {
  const locationState = useLocation().state;

  const [formData, setFormData] = useState({
    disasterType: locationState?.prefillType || "flood",
    location: locationState?.prefillLocation || "",
    state: locationState?.prefillState || "",
    severity: locationState?.prefillSeverity || "Medium",
    message: locationState ? `Emergency Alert for ${locationState.prefillLocation}` : "",
    description: "",
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [stats, setStats] = useState(null);

  const disasterTypes = [
    { value: "flood", label: "🌊 Flood", icon: "🌊" },
    { value: "earthquake", label: "📍 Earthquake", icon: "📍" },
    { value: "cyclone", label: "🌪️ Cyclone", icon: "🌪️" },
    { value: "fire", label: "🔥 Fire", icon: "🔥" },
    { value: "landslide", label: "⛰️ Landslide", icon: "⛰️" },
  ];

  const severityLevels = [
    { value: "Low", color: "#10b981" },
    { value: "Medium", color: "#f59e0b" },
    { value: "High", color: "#ef4444" },
    { value: "Critical", color: "#8b0000" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitAlert = async (e) => {
    e.preventDefault();

    if (!formData.location.trim()) {
      alert("Please enter a location");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/sms-alerts/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert(
          `✅ Alert queued! Will be sent to ${response.data.totalUsers} users.`
        );

        // Reset form
        setFormData({
          disasterType: "flood",
          location: "",
          state: "",
          severity: "Medium",
          message: "",
          description: "",
        });

        // Refresh alert history
        fetchAlertHistory();
      }
    } catch (error) {
      alert(
        "❌ Error: " +
          (error.response?.data?.message || "Failed to send alert")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/sms-alerts/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAlerts(response.data.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const fetchAlertStats = async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/sms-alerts/${alertId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStats(response.data.stats);
        setSelectedAlert(alertId);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const retryFailed = async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`/sms-alerts/${alertId}/retry-failed`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert("✅ Retrying failed SMS messages...");
        fetchAlertHistory();
      }
    } catch (error) {
      alert("❌ Error: " + (error.response?.data?.message || "Retry failed"));
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchAlertHistory();
    }
  }, [showHistory]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "sending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "sending":
        return "⏳";
      case "failed":
        return "❌";
      default:
        return "⚪";
    }
  };

  return (
    <div className="admin-sms-alert-container">
      <div className="sms-header">
        <h1>🚨 SMS Disaster Alert System</h1>
        <p>Create and send emergency SMS alerts to affected users</p>
      </div>

      {!showHistory ? (
        <div className="sms-form-section">
          <form onSubmit={handleSubmitAlert} className="sms-form">
            <div className="form-header">
              <h2>📤 Create New Alert</h2>
            </div>

            {/* Disaster Type Selection */}
            <div className="form-section">
              <label>Disaster Type *</label>
              <div className="disaster-types-grid">
                {disasterTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`disaster-type-btn ${
                      formData.disasterType === type.value ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, disasterType: type.value })
                    }
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Severity */}
            <div className="form-row">
              <div className="form-group">
                <label>Location (City/District) *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Aurangabad, Mumbai"
                  required
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., Maharashtra"
                />
              </div>
            </div>

            {/* Severity Level */}
            <div className="form-section">
              <label>Severity Level</label>
              <div className="severity-buttons">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    className={`severity-btn ${
                      formData.severity === level.value ? "active" : ""
                    }`}
                    style={{
                      borderColor: level.color,
                      backgroundColor:
                        formData.severity === level.value
                          ? level.color
                          : "transparent",
                    }}
                    onClick={() =>
                      setFormData({ ...formData, severity: level.value })
                    }
                  >
                    {level.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Message */}
            <div className="form-group">
              <label>Alert Message *</label>
              <input
                type="text"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="e.g., Immediate evacuation required"
                required
                maxLength="160"
              />
              <small>
                {formData.message.length}/160 characters (SMS limit)
              </small>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description/Details</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional details about the disaster..."
                rows="4"
              />
            </div>

            {/* Preview */}
            <div className="alert-preview">
              <h4>📱 SMS Preview:</h4>
              <div className="preview-box">
                {disasterTypes.find((t) => t.value === formData.disasterType)
                  ?.icon}{" "}
                ALERT [{formData.severity.toUpperCase()}]: {formData.disasterType} in{" "}
                {formData.location || "location"}. {formData.message}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-send"
                disabled={loading || !formData.location.trim()}
              >
                {loading ? "📤 Sending..." : "🚀 Send Alert to Users"}
              </button>
              <button
                type="button"
                className="btn-history"
                onClick={() => setShowHistory(true)}
              >
                📋 View History
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="sms-history-section">
          <div className="history-header">
            <h2>📋 Alert History & Status</h2>
            <button
              className="btn-back"
              onClick={() => {
                setShowHistory(false);
                setStats(null);
              }}
            >
              ← Back to Create Alert
            </button>
          </div>

          {stats && selectedAlert ? (
            <div className="alert-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Users Targeted</div>
                  <div className="stat-value">{stats.totalUsersTargeted}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">SMS Successful</div>
                  <div className="stat-value success">
                    {stats.smsSuccessful}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">SMS Failed</div>
                  <div className="stat-value failed">{stats.smsFailed}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Success Rate</div>
                  <div className="stat-value">{stats.successRate}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Duration</div>
                  <div className="stat-value">{stats.duration}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Status</div>
                  <div
                    className="stat-value"
                    style={{ color: getStatusColor(stats.status) }}
                  >
                    {getStatusIcon(stats.status)} {stats.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {stats.smsFailed > 0 && stats.status === "completed" && (
                <div className="retry-section">
                  <button
                    className="btn-retry"
                    onClick={() => retryFailed(selectedAlert)}
                  >
                    🔄 Retry Failed SMS ({stats.smsFailed})
                  </button>
                </div>
              )}
            </div>
          ) : null}

          <div className="alerts-list">
            {alerts.length === 0 ? (
              <p className="no-alerts">No alerts sent yet</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert._id} className="alert-item">
                  <div className="alert-item-header">
                    <div className="alert-title">
                      {disasterTypes.find((t) => t.value === alert.disasterType)
                        ?.icon}{" "}
                      {alert.disasterType.toUpperCase()} - {alert.location}
                    </div>
                    <div
                      className="alert-status"
                      style={{ color: getStatusColor(alert.status) }}
                    >
                      {getStatusIcon(alert.status)} {alert.status}
                    </div>
                  </div>

                  <div className="alert-item-info">
                    <span className="alert-severity">
                      [{alert.severity}]
                    </span>
                    <span className="alert-date">
                      {new Date(alert.createdAt).toLocaleDateString()}{" "}
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="alert-item-stats">
                    <span>
                      ✅ {alert.smsSuccessful}/{alert.smsAttempted} SMS Sent
                    </span>
                    <span>❌ {alert.smsFailed} Failed</span>
                  </div>

                  <button
                    className="btn-view-stats"
                    onClick={() => fetchAlertStats(alert._id)}
                  >
                    📊 View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSMSAlert;
