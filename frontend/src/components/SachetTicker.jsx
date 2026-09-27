import React, { useState, useEffect } from 'react';
import API from '../api';
import './SachetTicker.css';

const SachetTicker = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      try {
        const res = await API.get('/real-alerts/combined');
        const sourceAlerts = Array.isArray(res.data?.alerts) ? res.data.alerts : [];
        const criticalAlerts = sourceAlerts.filter((alert) => {
          const severity = String(alert.severity || '').toLowerCase();
          return !['Resolved', 'Cancelled', 'Expired'].includes(alert.status) && ['critical', 'high', 'severe'].includes(severity);
        });
        setAlerts(criticalAlerts.slice(0, 10)); // Limit to top 10 recent
      } catch (err) {
        console.error("Failed to fetch ticker alerts", err);
      }
    };
    fetchActiveAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="sachet-ticker-container">
      <div className="ticker-label">
        <strong>LATEST ALERTS 🚨</strong>
      </div>
      <div className="ticker-scroll">
        <div className="ticker-track">
          {[...alerts, ...alerts].map((alert, idx) => (
            <span key={`${alert._id || alert.id || idx}-${idx}`} className="ticker-item">
              <strong style={{ color: String(alert.severity).toLowerCase() === 'critical' ? '#EF4444' : '#F97316' }}>[{alert.areaDescription || alert.location}]</strong> {alert.title} - {alert.location}
              <span className="ticker-separator">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SachetTicker;
