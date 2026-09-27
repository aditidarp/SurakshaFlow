import { useState, useEffect, useCallback } from "react";
import API from "../api";
import io from "socket.io-client";
import "./RealTimeAlerts.css";

const RealTimeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sourceUnavailable, setSourceUnavailable] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (!date || isNaN(date.getTime())) return "Just now";
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const normalizeAlert = (data) => {
    const severityMap = {
      Critical: "High",
      critical: "High",
      High: "High",
      high: "High",
      Medium: "Medium",
      medium: "Medium",
      Low: "Low",
      low: "Low"
    };

    const textSeverity = data.severity
      ? (typeof data.severity === 'number'
          ? data.severity >= 4 ? 'High' : data.severity >= 3 ? 'Medium' : 'Low'
          : severityMap[data.severity] || data.severity)
      : 'Low';

    // Ensure location is always a string
    let locationStr = 'Unknown Location';
    if (typeof data.location === 'string') {
      locationStr = data.location;
    } else if (data.location && typeof data.location === 'object') {
      // Handle MongoDB location object or other location objects
      locationStr = data.state || data.district || data.city || 'Unknown Location';
    } else if (data.state || data.district) {
      locationStr = `${data.state || ''} ${data.district || ''}`.trim();
    }

    return {
      id: data.id || data._id || `${data.type || 'alert'}-${locationStr}-${data.time || data.timestamp || Date.now()}`,
      type: (data.type || data.alert || 'General').toString(),
      location: locationStr,
      severityText: textSeverity,
      severity: textSeverity === 'High' ? 3 : textSeverity === 'Medium' ? 2 : 1,
      time: data.time || formatTime(data.timestamp) || 'Just now',
      timestamp: data.timestamp || new Date().toISOString(),
    };
  };

  const getSeverityColor = (severityText) => {
    if (severityText === 'High') return '#dc2626';
    if (severityText === 'Medium') return '#ea580c';
    return '#10b981';
  };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/real-alerts/combined');
      const sourceAlerts = res.data?.alerts || [];
      if (Array.isArray(sourceAlerts)) {
        const parsed = sourceAlerts
          .filter((a) => a.status?.toLowerCase() !== 'resolved')
          .slice(0, 10)
          .map((a) => normalizeAlert({
            ...a,
            severity: a.severity || 'Low',
            time: a.time || formatTime(a.createdAt || a.updatedAt || new Date().toISOString()),
          }));
        setAlerts(parsed);
        setSourceUnavailable(false);
      }
    } catch (err) {
      console.error('Official alert source temporarily unavailable:', err);
      setAlerts([]);
      setSourceUnavailable(true);
    } finally {
      setLastUpdated(new Date().toLocaleString());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 60000);

    let socket;
    try {
      socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000');
      socket.on('live-alert', (newAlert) => {
        const next = normalizeAlert(newAlert);
        setAlerts((prev) => {
          const merged = [next, ...prev.filter((a) => a.id !== next.id)];
          return merged.slice(0, 10);
        });
        setLastUpdated(new Date().toLocaleString());
      });
    } catch (err) {
      console.warn('Socket connection not available:', err);
    }

    return () => {
      clearInterval(intervalId);
      if (socket) socket.disconnect();
    };
  }, [fetchAlerts]);

  return (
    <div className="realtime-alerts" aria-live="polite">
      <div className="live-alerts-heading">
        <div><p className="section-kicker">REAL-TIME MONITOR</p><h4>Live alerts</h4></div>
        <span className="live-state"><span className="status-dot" /> Connected</span>
      </div>
      <p className="last-updated">Last updated: {lastUpdated || 'Fetching latest alerts...'}</p>

      <div className="alerts-count">
        <span className="active-count">{alerts.length}</span> Active Alerts
      </div>

      <div className="alerts-list">
        {loading ? (
          <div className="alerts-loading"><span className="loading-bar" /><span className="loading-bar short" /><p>Fetching latest alerts...</p></div>
        ) : sourceUnavailable ? (
          <div className="no-alerts source-error"><p>Official alert source temporarily unavailable</p><button onClick={fetchAlerts}>Try again</button></div>
        ) : alerts.length === 0 ? (
          <div className="no-alerts"><span className="empty-mark">OK</span><p>No active disaster alerts</p><small>Continue monitoring official alerts for updates.</small></div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-card" style={{ borderLeft: `4px solid ${getSeverityColor(alert.severityText)}` }}>
              <div className="alert-card-header">
                <span className="alert-emoji">{alert.type === 'Flood' ? '💧' : alert.type === 'Heatwave' ? '☀️' : '⚠️'}</span>
                <span className="alert-card-title">{alert.type}</span>
                <span className="alert-severity-pill" style={{ backgroundColor: getSeverityColor(alert.severityText) }}>{alert.severityText}</span>
              </div>
              <div className="alert-card-body">
                <strong className="alert-headline">{alert.title || alert.type}</strong>
                <div className="alert-card-location">📍 {alert.location}</div>
                <div className="alert-card-time">🕒 {alert.time}</div>
                <button className="alert-detail-button" onClick={() => setSelectedAlert(alert)}>View details</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="alerts-footer">
        <button className="view-all-btn" onClick={() => window.location.href = '/home#/live-dashboard'}>View Full Dashboard →</button>
      </div>
      {selectedAlert && (
        <div className="alert-detail-backdrop" role="presentation" onClick={() => setSelectedAlert(null)}>
          <section className="alert-detail-modal" role="dialog" aria-modal="true" aria-labelledby="alert-detail-title" onClick={(event) => event.stopPropagation()}>
            <button className="alert-detail-close" onClick={() => setSelectedAlert(null)} aria-label="Close alert details">X</button>
            <p className="section-kicker">OFFICIAL ALERT</p>
            <h3 id="alert-detail-title">{selectedAlert.title || selectedAlert.type}</h3>
            <div className="detail-grid"><span>Disaster</span><strong>{selectedAlert.type}</strong><span>Location</span><strong>{selectedAlert.location}</strong><span>Severity</span><strong>{selectedAlert.severityText}</strong><span>Issued</span><strong>{selectedAlert.time}</strong></div>
            {selectedAlert.description && <p>{selectedAlert.description}</p>}
          </section>
        </div>
      )}
    </div>
  );
};

export default RealTimeAlerts;
