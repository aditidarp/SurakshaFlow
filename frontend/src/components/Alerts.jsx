import React, { useEffect, useState } from "react";
import API from "../api";
import "./AlertCards.css";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/alerts");
      setAlerts(res.data || []);
    } catch (err) {
      setError(err.data?.message || err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const id = setInterval(loadAlerts, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <div className="alerts-list">Loading alerts...</div>;
  if (error) return <div className="alerts-list">Error: {error}</div>;
  if (!alerts.length) return <div className="alerts-list">No active alerts</div>;

  return (
    <div className="alerts-list">
      {alerts.map((a) => (
        <div key={a._id || `${a.lat}-${a.lng}-${a.time || a.date || a.temperature}`} className="alert-item">
          <h4>{a.alert || a.title || "Alert"}</h4>
          <p>{a.description}</p>
          {a.temperature && <p>Temp: {a.temperature}°C</p>}
          {a.city && <p>City: {a.city}</p>}
        </div>
      ))}
    </div>
  );
}
