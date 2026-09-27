import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "./AlertHistory.css";

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAlertHistory();
  }, []);

  const fetchAlertHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/alerts/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure we have an array
      const alertsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to load alert history:", error);
      setAlerts([]); // Set empty array on error to prevent crashes
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return "#dc2626";
      case "High": return "#ea580c";
      case "Medium": return "#ca8a04";
      case "Low": return "#16a34a";
      default: return "#6b7280";
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true;
    return (alert.type || "").toLowerCase() === filter.toLowerCase();
  });

  const alertTypes = ["all", ...new Set(alerts.map(alert => (alert.type || "unknown").toLowerCase()))];

  if (loading) {
    return <div className="history-container"><div className="loading">Loading alert history...</div></div>;
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📋 Alert History</h2>
        <div className="filter-controls">
          <label>Filter by type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {alertTypes.map(type => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="alerts-summary">
        <div className="summary-card">
          <h3>Total Alerts</h3>
          <span className="summary-number">{alerts.length}</span>
        </div>
        <div className="summary-card">
          <h3>Critical Alerts</h3>
          <span className="summary-number critical">
            {alerts.filter(a => a.severity === "Critical").length}
          </span>
        </div>
        <div className="summary-card">
          <h3>This Month</h3>
          <span className="summary-number">
            {alerts.filter(a => {
              const alertDate = new Date(a.date);
              const now = new Date();
              return alertDate.getMonth() === now.getMonth() &&
                     alertDate.getFullYear() === now.getFullYear();
            }).length}
          </span>
        </div>
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <p>No alerts found for the selected filter.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert._id} className="alert-card">
              <div className="alert-header">
                <h3>{alert.title || "Untitled Alert"}</h3>
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(alert.severity) }}
                >
                  {alert.severity || "Unknown"}
                </span>
              </div>
              <p className="alert-description">{alert.description || "No description available"}</p>
              <div className="alert-details">
                <span className="alert-type">{alert.type || "Unknown"}</span>
                <span className="alert-date">
                  {alert.date ? new Date(alert.date).toLocaleDateString() + " at " + new Date(alert.date).toLocaleTimeString() : "Date unknown"}
                </span>
              </div>
              {alert.location && alert.location.coordinates && (
                <div className="alert-location">
                  📍 Location: {alert.location.coordinates[1].toFixed(4)}, {alert.location.coordinates[0].toFixed(4)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertHistory;