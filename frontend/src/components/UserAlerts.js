import React, { useState, useEffect } from 'react';
import API from '../api';
import { socketService } from '../services/socketService';
import './UserAlerts.css';

const UserAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Initialize socket and fetch alerts
  useEffect(() => {
    socketService.initializeSocket();
    fetchAlerts();

    // Listen to real-time alert updates
    const unsubscribeNew = socketService.onNewAlert((newAlert) => {
      console.log('📢 New alert received:', newAlert);
      setAlerts(prev => [newAlert, ...prev]);
    });

    const unsubscribeUpdate = socketService.onUpdateAlert((updatedAlert) => {
      console.log('🔄 Alert updated:', updatedAlert);
      setAlerts(prev =>
        prev.map(alert => alert._id === updatedAlert._id ? updatedAlert : alert)
      );
    });

    const unsubscribeDelete = socketService.onDeleteAlert((alertData) => {
      console.log('🗑️ Alert deleted:', alertData);
      const alertId = alertData.id || alertData;
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
      if (selectedAlert?._id === alertId) {
        setSelectedAlert(null);
      }
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [selectedAlert?._id]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...alerts];

    // Type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(alert => alert.type === filterType);
    }

    // Severity filter
    if (filterSeverity !== 'All') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'severity':
          const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        default:
          return 0;
      }
    });

    setFilteredAlerts(filtered);
  }, [alerts, filterType, filterSeverity, sortBy]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/alerts');
      setAlerts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444',
      'Critical': '#8b1a1a'
    };
    return colors[severity] || '#6b7280';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Flood': '💧',
      'Earthquake': '🌍',
      'Cyclone': '🌪️',
      'Fire': '🔥',
      'Landslide': '⛰️'
    };
    return icons[type] || '⚠️';
  };

  const formatDate = (date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diff = Math.floor((now - alertDate) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return alertDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: alertDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const alertTypes = ['All', ...new Set(alerts.map(a => a.type))];
  const severityLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="user-alerts">
      <header className="alerts-header">
        <div>
          <h1>🚨 Live Disaster Alerts</h1>
          <p className="subtitle">Real-time alerts to keep you informed</p>
        </div>
        <div className="alert-count">
          <span className="count-badge">{alerts.length}</span>
          <span className="count-text">Active Alerts</span>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      {/* Filters & Controls */}
      <div className="filters-panel">
        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {alertTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            {severityLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="severity">Highest Severity</option>
          </select>
        </div>

        <button onClick={fetchAlerts} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Alerts View */}
      <div className="alerts-container">
        {loading && <div className="loading">Loading alerts...</div>}
        {error && !loading && <div className="no-alerts">Unable to load alerts. Please try again.</div>}
        {!loading && filteredAlerts.length === 0 && (
          <div className="no-alerts">✅ No alerts at this moment. Stay safe!</div>
        )}

        {!loading && filteredAlerts.length > 0 && (
          <div className="alerts-list">
            {filteredAlerts.map(alert => (
              <div
                key={alert._id}
                className="alert-item"
                style={{ borderLeftColor: getSeverityColor(alert.severity) }}
              >
                <div className="alert-item-header">
                  <div className="alert-title">
                    <span className="type-icon">{getTypeIcon(alert.type)}</span>
                    <h3>{alert.title}</h3>
                  </div>
                  <div className="alert-meta">
                    <span
                      className="severity"
                      style={{ backgroundColor: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity}
                    </span>
                    <span className="time">{formatDate(alert.createdAt)}</span>
                  </div>
                </div>

                <div className="alert-item-body">
                  <p className="description">{alert.description}</p>

                  <div className="alert-details">
                    <div className="detail-item">
                      <span className="label">Location:</span>
                      <span className="value">📍 {alert.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">{alert.type}</span>
                    </div>
                    {alert.affectedArea && (
                      <div className="detail-item">
                        <span className="label">Affected Area:</span>
                        <span className="value">{alert.affectedArea}</span>
                      </div>
                    )}
                    {alert.casualties > 0 && (
                      <div className="detail-item">
                        <span className="label">Casualties:</span>
                        <span className="value critical">{alert.casualties}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="view-btn"
                  onClick={() => setSelectedAlert(alert)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for detailed view */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedAlert(null)}>✕</button>

            <div className="modal-header" style={{ backgroundColor: getSeverityColor(selectedAlert.severity) }}>
              <h2>{getTypeIcon(selectedAlert.type)} {selectedAlert.title}</h2>
              <span className="severity-large">{selectedAlert.severity}</span>
            </div>

            <div className="modal-body">
              <p className="description">{selectedAlert.description}</p>

              <div className="details-grid">
                <div className="detail">
                  <h4>Location</h4>
                  <p>📍 {selectedAlert.location}</p>
                </div>
                <div className="detail">
                  <h4>Type</h4>
                  <p>{selectedAlert.type}</p>
                </div>
                <div className="detail">
                  <h4>Severity</h4>
                  <p>{selectedAlert.severity}</p>
                </div>
                <div className="detail">
                  <h4>Created</h4>
                  <p>{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                </div>
                {selectedAlert.affectedArea && (
                  <div className="detail">
                    <h4>Affected Area</h4>
                    <p>{selectedAlert.affectedArea}</p>
                  </div>
                )}
                {selectedAlert.casualties > 0 && (
                  <div className="detail">
                    <h4>Casualties</h4>
                    <p className="critical">{selectedAlert.casualties}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={() => setSelectedAlert(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAlerts;
