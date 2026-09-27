import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { alertService } from '../services/alertService';
import { socketService } from '../services/socketService';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  // State Management - MUST be at top level, before any conditional logic
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'Medium',
    affectedArea: '',
    casualties: 0
  });

  // Role-based access check
  useEffect(() => {
    if (!isAdmin) {
      // Redirect non-admin users
      navigate('/home', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Fetch alerts on mount
  // Initialize Socket.io listeners
  const initializeSocket = useCallback(() => {
    try {
      // Listen for real-time updates from other admins or backend
      socketService.onNewAlert((newAlert) => {
        console.log('📦 New alert received via socket:', newAlert);
        setAlerts(prev => {
          // Avoid duplicates
          if (!prev.some(a => a._id === newAlert._id)) {
            return [newAlert, ...prev];
          }
          return prev;
        });
        showSuccessMessage('New alert added in real-time!');
      });

      socketService.onUpdateAlert((updatedAlert) => {
        console.log('🔄 Alert updated via socket:', updatedAlert);
        setAlerts(prev =>
          prev.map(a => a._id === updatedAlert._id ? updatedAlert : a)
        );
        showSuccessMessage('Alert updated in real-time!');
      });

      socketService.onDeleteAlert((data) => {
        console.log('🗑️ Alert deleted via socket:', data.id);
        setAlerts(prev => prev.filter(a => a._id !== data.id));
        showSuccessMessage('Alert deleted in real-time!');
      });
    } catch (err) {
      console.warn('Socket.io not available, using polling only');
    }
  }, []);

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch alerts. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    initializeSocket();
    
    return () => {
      // Cleanup on unmount
    };
  }, [fetchAlerts, initializeSocket]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'casualties' ? parseInt(value) || 0 : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Update existing alert
        await alertService.updateAlert(editingId, formData);
        socketService.emitUpdateAlert(formData);
        showSuccessMessage('Alert updated successfully!');
      } else {
        // Create new alert
        await alertService.createAlert(formData);
        socketService.emitNewAlert(formData);
        showSuccessMessage('Alert created successfully!');
      }

      // Reset form
      resetForm();
      fetchAlerts();
    } catch (err) {
      setError(err.message || 'Failed to save alert');
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      setError(null);
      await alertService.deleteAlert(alertId);
      socketService.emitDeleteAlert(alertId);
      showSuccessMessage('Alert deleted successfully!');
      setAlerts(prev => prev.filter(a => a._id !== alertId));
    } catch (err) {
      setError(err.message || 'Failed to delete alert');
      console.error(err);
    }
  };

  // Handle edit
  const handleEdit = (alert) => {
    setFormData({
      title: alert.title,
      description: alert.description,
      location: alert.location,
      severity: alert.severity,
      affectedArea: alert.affectedArea || '',
      casualties: alert.casualties || 0
    });
    setEditingId(alert._id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      severity: 'Medium',
      affectedArea: '',
      casualties: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Show success message
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444',
      'Critical': '#7c2d12'
    };
    return colors[severity] || '#6b7280';
  };

  const handleCancel = () => {
    resetForm();
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="admin-panel-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page. Only admins can manage alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      {/* Header */}
      <div className="admin-panel-header">
        <div>
          <h1>🎛️ Alert Management Dashboard</h1>
          <p>Create, edit, and manage disaster alerts in real-time</p>
          <div className="role-badge">
            🔐 Logged in as <strong>Admin</strong> | <button onClick={logout} className="logout-link">Logout</button>
          </div>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖️ Close Form' : '➕ Create New Alert'}
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="message message-success">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="message message-error">
          ❌ {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="admin-form-section">
          <h2>{editingId ? '✏️ Edit Alert' : '➕ Create New Alert'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Title *</label>
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
                placeholder="Enter alert details"
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai"
                  required
                />
              </div>

              <div className="form-group">
                <label>Severity *</label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
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
                  placeholder="e.g., 5 districts"
                />
              </div>

              <div className="form-group">
                <label>Casualties</label>
                <input
                  type="number"
                  name="casualties"
                  value={formData.casualties}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success">
                {editingId ? '🔄 Update Alert' : '✅ Create Alert'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      <div className="admin-alerts-section">
        <h2>📋 All Alerts ({alerts.length})</h2>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <p>🎯 No alerts yet. Create one by clicking the button above!</p>
          </div>
        ) : (
          <div className="alerts-table-wrapper">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Affected Area</th>
                  <th>Casualties</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert._id} className="alert-row">
                    <td className="alert-title">
                      <div>
                        <strong>{alert.title}</strong>
                        <p className="alert-desc">{alert.description}</p>
                      </div>
                    </td>
                    <td>{alert.location}</td>
                    <td>
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td>{alert.affectedArea || '-'}</td>
                    <td>{alert.casualties || 0}</td>
                    <td className="created-at">
                      {new Date(alert.createdAt).toLocaleString()}
                    </td>
                    <td className="actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(alert)}
                        title="Edit alert"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(alert._id)}
                        title="Delete alert"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-Time Indicator */}
      <div className="realtime-indicator">
        <span className="pulse"></span> Live Real-Time Sync Enabled
      </div>
    </div>
  );
};

export default AdminPanel;
