import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import './AlertManagement.css';

/**
 * Complete Alert Management System
 * - Admin: Create, Read, Update, Delete alerts
 * - User: Only Read alerts with auto-refresh every 5 seconds
 */

const AlertManagement = () => {
  const [role, setRole] = useState(localStorage.getItem('role') || 'user');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'low'
  });

  // ==================== FETCH ALERTS ====================
  const fetchAlerts = async () => {
    try {
      setError('');
      const response = await axios.get('/alerts/simple/all');
      if (Array.isArray(response.data)) {
        // Normalize alert data: convert _id to id, ensure severity exists
        const normalizedAlerts = response.data.map(alert => {
          // Normalize severity to lowercase
          let severity = (alert.severity || 'low').toString().toLowerCase();
          if (severity === 'critical') severity = 'high';
          
          return {
            id: alert.id || alert._id,
            title: alert.title || 'Untitled Alert',
            description: alert.description || 'No description',
            location: alert.location || 'Unknown location',
            severity: severity,
            createdAt: alert.createdAt || alert.date || new Date().toISOString(),
            disasterType: alert.disasterType || ''
          };
        });
        setAlerts(normalizedAlerts);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Auto-refresh for User (every 5 seconds)
  useEffect(() => {
    if (role === 'user') {
      const interval = setInterval(fetchAlerts, 5000);
      return () => clearInterval(interval);
    }
  }, [role]);

  // ==================== ADMIN CRUD OPERATIONS ====================

  // Create alert
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setError('');
      const response = await axios.post('/alerts/simple/create', formData);
      setAlerts([...alerts, {
        id: response.data._id,
        title: response.data.title,
        description: response.data.description,
        location: response.data.location,
        severity: (response.data.severity || 'medium').toLowerCase(),
        createdAt: response.data.createdAt
      }]);
      resetForm();
      alert('✅ Alert created successfully!');
    } catch (err) {
      setError('Failed to create alert');
      console.error('Create error:', err);
    }
  };

  // Update alert
  const handleUpdateAlert = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      setError('');
      const response = await axios.put(`/alerts/simple/update/${editingId}`, formData);
      setAlerts(alerts.map(a => a.id === editingId ? {
        id: response.data._id,
        title: response.data.title,
        description: response.data.description,
        location: response.data.location,
        severity: (response.data.severity || 'medium').toLowerCase(),
        createdAt: response.data.createdAt
      } : a));
      resetForm();
      alert('✅ Alert updated successfully!');
    } catch (err) {
      setError('Failed to update alert');
      console.error('Update error:', err);
    }
  };

  // Delete alert
  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      setError('');
      await axios.delete(`/alerts/simple/delete/${id}`);
      setAlerts(alerts.filter(a => a.id !== id));
      alert('✅ Alert deleted successfully!');
    } catch (err) {
      setError('Failed to delete alert');
      console.error('Delete error:', err);
    }
  };

  // Edit alert
  const handleEditAlert = (alert) => {
    setEditingId(alert.id);
    setFormData({
      title: alert.title,
      description: alert.description,
      location: alert.location,
      severity: alert.severity
    });
    window.scrollTo(0, 0);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      severity: 'low'
    });
  };

  // ==================== INPUT HANDLERS ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ==================== HELPERS ====================
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high': return '#fee2e2';
      case 'medium': return '#fed7aa';
      case 'low': return '#dcfce7';
      default: return '#f3f4f6';
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="alert-management">
      {/* HEADER */}
      <div className="am-header">
        <h1>🚨 Alert Management System</h1>
        <div className="role-badge" style={{
          background: role === 'admin' ? '#667eea' : '#f5576c',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: 'bold'
        }}>
          {role === 'admin' ? '👑 Admin Panel' : '👤 User View'}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #dc2626'
        }}>
          ❌ {error}
        </div>
      )}

      {/* ADMIN: CREATE/EDIT FORM */}
      {role === 'admin' && (
        <div className="am-form-section">
          <h2>{editingId ? '✏️ Edit Alert' : '➕ Create New Alert'}</h2>

          <form onSubmit={editingId ? handleUpdateAlert : handleCreateAlert} className="am-form">
            <div className="am-form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Heavy Rainfall in Mumbai"
                required
              />
            </div>

            <div className="am-form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Heavy rainfall expected in next 24 hours with wind speed up to 40 km/h"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="am-form-row">
              <div className="am-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>

              <div className="am-form-group">
                <label>Severity</label>
                <select name="severity" value={formData.severity} onChange={handleInputChange}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div className="am-form-actions">
              <button type="submit" className="am-btn-primary">
                {editingId ? '💾 Update Alert' : '➕ Create Alert'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="am-btn-secondary">
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ALERTS LIST */}
      <div className="am-alerts-section">
        <h2>📋 All Alerts ({alerts.length})</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            ⏳ Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            📭 No alerts yet. {role === 'admin' && 'Create one using the form above!'}
          </div>
        ) : (
          <div className="am-alerts-grid">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="am-alert-card"
                style={{
                  borderLeft: `5px solid ${getSeverityColor(alert.severity)}`,
                  background: getSeverityBg(alert.severity)
                }}
              >
                <div className="am-alert-header">
                  <div>
                    <h3>{alert.title}</h3>
                    <p className="am-alert-description">{alert.description}</p>
                  </div>
                  <span
                    className="am-severity-badge"
                    style={{
                      background: getSeverityColor(alert.severity),
                      color: 'white'
                    }}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                </div>

                <div className="am-alert-meta">
                  {alert.location && (
                    <span>📍 {alert.location}</span>
                  )}
                  <span>📅 {new Date(alert.createdAt).toLocaleDateString()}</span>
                </div>

                {/* ADMIN ACTIONS */}
                {role === 'admin' && (
                  <div className="am-alert-actions">
                    <button
                      onClick={() => handleEditAlert(alert)}
                      className="am-btn-edit"
                      title="Edit alert"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="am-btn-delete"
                      title="Delete alert"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}

                {/* USER VIEW: Just ID for reference */}
                {role === 'user' && (
                  <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '10px' }}>
                    ID: {(alert.id || 'unknown').slice(0, 8)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AUTO-REFRESH INDICATOR FOR USER */}
      {role === 'user' && (
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '15px',
          background: '#e0f2fe',
          borderRadius: '6px',
          color: '#0c4a6e',
          fontSize: '0.9rem'
        }}>
          🔄 Auto-refreshing every 5 seconds...
        </div>
      )}
    </div>
  );
};

export default AlertManagement;
