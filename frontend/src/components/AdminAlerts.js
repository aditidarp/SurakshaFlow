import React, { useState, useEffect } from 'react';
import API from '../api';
import { initializeSocket, getSocket, onUpdateAlert, onDeleteAlert } from '../services/socketService';
import './AdminAlerts.css';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Flood',
    severity: 'Medium',
    affectedArea: '',
    casualties: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize socket and fetch alerts
  useEffect(() => {
    initializeSocket();
    fetchAlerts();

    // Listen to real-time updates from other admins
    const unsubscribeUpdate = onUpdateAlert((updatedAlert) => {
      setAlerts(prev => 
        prev.map(alert => alert._id === updatedAlert._id ? updatedAlert : alert)
      );
    });

    const unsubscribeDelete = onDeleteAlert((alertId) => {
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/alerts');
      setAlerts(response.data);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error(err);
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

  const handleCasualtiesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      casualties: parseInt(e.target.value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);

      if (editingId) {
        // Update alert
        const response = await API.put(`/api/alerts/${editingId}`, formData);
        const socket = getSocket();
        socket.emit('updateAlert', response.data);
        setSuccess('Alert updated successfully!');
      } else {
        // Create new alert
        const response = await API.post('/api/alerts', formData);
        const socket = getSocket();
        socket.emit('newAlert', response.data);
        setSuccess('Alert created successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        type: 'Flood',
        severity: 'Medium',
        affectedArea: '',
        casualties: 0
      });
      setEditingId(null);
      
      // Refresh alerts
      await fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save alert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alert) => {
    setFormData({
      title: alert.title,
      description: alert.description,
      location: alert.location,
      type: alert.type,
      severity: alert.severity,
      affectedArea: alert.affectedArea || '',
      casualties: alert.casualties || 0
    });
    setEditingId(alert._id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      setLoading(true);
      await API.delete(`/api/alerts/${id}`);
      const socket = getSocket();
      socket.emit('deleteAlert', id);
      setSuccess('Alert deleted successfully!');
      await fetchAlerts();
    } catch (err) {
      setError('Failed to delete alert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      type: 'Flood',
      severity: 'Medium',
      affectedArea: '',
      casualties: 0
    });
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-alerts">
      <h1>📢 Alert Management</h1>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Create/Edit Form */}
      <div className="alert-form">
        <h2>{editingId ? '✏️ Edit Alert' : '➕ Create New Alert'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Alert title"
                required
              />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleInputChange} required>
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Fire">Fire</option>
                <option value="Landslide">Landslide</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Severity *</label>
              <select name="severity" value={formData.severity} onChange={handleInputChange} required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Mumbai, Pune"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Affected Area</label>
              <input
                type="text"
                name="affectedArea"
                value={formData.affectedArea}
                onChange={handleInputChange}
                placeholder="e.g., Eastern District"
              />
            </div>
            <div className="form-group">
              <label>Casualties</label>
              <input
                type="number"
                name="casualties"
                value={formData.casualties}
                onChange={handleCasualtiesChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the alert"
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '⏳ Saving...' : editingId ? '💾 Update Alert' : '➕ Create Alert'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Alerts List */}
      <div className="alerts-dashboard">
        <h2>📋 All Alerts ({alerts.length})</h2>
        {loading && <p className="loading">Loading alerts...</p>}
        {alerts.length === 0 ? (
          <p className="no-alerts">No alerts yet. Create one to get started!</p>
        ) : (
          <div className="alerts-grid">
            {alerts.map(alert => (
              <div key={alert._id} className="alert-card">
                <div className="card-header">
                  <h3>{alert.title}</h3>
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                </div>

                <div className="card-body">
                  <p><strong>Type:</strong> {alert.type}</p>
                  <p><strong>Location:</strong> 📍 {alert.location}</p>
                  <p><strong>Description:</strong> {alert.description}</p>
                  {alert.affectedArea && <p><strong>Affected Area:</strong> {alert.affectedArea}</p>}
                  {alert.casualties > 0 && (
                    <p><strong>Casualties:</strong> {alert.casualties}</p>
                  )}
                  <p className="timestamp">
                    Created: {formatDate(alert.createdAt)}
                  </p>
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => handleEdit(alert)} 
                    className="btn-edit"
                    disabled={loading}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(alert._id)} 
                    className="btn-delete"
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;
