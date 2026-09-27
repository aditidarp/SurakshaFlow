import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import { socketService } from '../services/socketService';
import VoiceAssistant from './VoiceAssistant';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { logout, userEmail } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'flood',
    location: '',
    severity: 'Medium',
  });

  useEffect(() => {
    socketService.initializeSocket();
    fetchAlerts();

    const unsubscribeNew = socketService.onNewAlert((newAlert) => {
      setAlerts(prev => {
        if (!newAlert || !newAlert._id) return prev;
        if (prev.some(alert => alert._id === newAlert._id)) return prev;
        return [newAlert, ...prev];
      });
    });

    const unsubscribeUpdate = socketService.onUpdateAlert((updatedAlert) => {
      setAlerts(prev => prev.map(alert => alert._id === updatedAlert._id ? updatedAlert : alert));
    });

    const unsubscribeDelete = socketService.onDeleteAlert((payload) => {
      const id = payload?.id || payload;
      setAlerts(prev => prev.filter(alert => alert._id !== id));
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/alerts');
      setAlerts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!navigator.geolocation) throw new Error('Location is required to submit a rescue request.');
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
      await API.post('/sos', {
        name: userEmail,
        message: formData.description,
        disasterType: formData.type,
        urgency: formData.severity === 'Critical' ? 'CRITICAL' : formData.severity === 'High' ? 'HIGH' : formData.severity === 'Medium' ? 'MEDIUM' : 'LOW',
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      setFormData({
        title: '',
        description: '',
        type: 'flood',
        location: '',
        severity: 'Medium',
      });
      setShowForm(false);
      fetchAlerts();
    } catch (err) {
      console.error('Error submitting alert:', err);
      alert(err.message || 'Failed to submit rescue request. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏠 User Dashboard</h1>
          <p>Send emergency alerts and track status</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-email">{userEmail}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Send Alert Section */}
        <section className="send-alert-section">
          <div className="section-header">
            <h2>📢 Send Emergency Alert</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✖️ Close' : '➕ Create Alert'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="alert-form">
              <div className="form-group">
                <label>Alert Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Flood Warning"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the emergency situation"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Alert Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="flood">🌊 Flood</option>
                    <option value="earthquake">🏚️ Earthquake</option>
                    <option value="cyclone">🌪️ Cyclone</option>
                    <option value="fire">🔥 Fire</option>
                    <option value="landslide">🗻 Landslide</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Severity *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                    <option value="Critical">⚫ Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai, Maharashtra"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  ✅ Send Alert
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* My Alerts Section */}
        <section className="my-alerts-section">
          <h2>📋 My Alerts ({alerts.length})</h2>
          
          {loading ? (
            <div className="loading">Loading your alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              <p>No alerts sent yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert._id} className="alert-card">
                  <div className="alert-header">
                    <h3>{alert.title}</h3>
                    <span className={`status-badge status-${alert.status}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="alert-description">{alert.description}</p>
                  <div className="alert-meta">
                    <span className="location">📍 {alert.location}</span>
                    <span className={`severity severity-${alert.severity}`}>
                      {alert.severity}
                    </span>
                  </div>
                  {alert.assignedTo && (
                    <div className="assigned-info">
                      ✅ Assigned to rescue team
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <VoiceAssistant mode="embedded" />
    </div>
  );
};

export default UserDashboard;
