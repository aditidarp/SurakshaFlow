import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ScheduledAlertsForm.css';

const ScheduledAlertsForm = () => {
  const [alerts, setAlerts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    disasterType: 'flood',
    location: '',
    state: '',
    severity: 'Medium',
    message: '',
    templateId: '',
    scheduledFor: '',
    recurPattern: 'once',
    recurrenceEnd: '',
  });

  const [filterStatus, setFilterStatus] = useState('scheduled');
  const [stats, setStats] = useState(null);

  const disasterTypes = ['flood', 'earthquake', 'cyclone', 'fire', 'landslide'];
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const recurPatterns = [
    { value: 'once', label: 'One Time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Fetch data
  useEffect(() => {
    fetchAlerts();
    fetchTemplates();
    fetchStats();
  }, [filterStatus]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/scheduled-alerts', {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAlerts(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch scheduled alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/sms-templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTemplates(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/scheduled-alerts/stats/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUseTemplate = (template) => {
    setFormData({
      ...formData,
      message: template.message,
      templateId: template._id,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.location || !formData.state || !formData.scheduledFor) {
        setError('Location, state, and scheduled time are required');
        return;
      }

      if (!formData.message) {
        setError('Message is required');
        return;
      }

      if (formData.message.length > 160) {
        setError('Message cannot exceed 160 characters');
        return;
      }

      const url = editingId
        ? `/api/scheduled-alerts/${editingId}`
        : '/api/scheduled-alerts';

      const method = editingId ? 'PUT' : 'POST';

      await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess(
        editingId
          ? 'Scheduled alert updated successfully'
          : 'Alert scheduled successfully'
      );

      // Reset form
      setFormData({
        disasterType: 'flood',
        location: '',
        state: '',
        severity: 'Medium',
        message: '',
        templateId: '',
        scheduledFor: '',
        recurPattern: 'once',
        recurrenceEnd: '',
      });
      setEditingId(null);
      setShowForm(false);

      // Refresh data
      fetchAlerts();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule alert');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alert) => {
    setFormData({
      disasterType: alert.disasterType,
      location: alert.location,
      state: alert.state,
      severity: alert.severity,
      message: alert.message,
      templateId: alert.templateId?._id || '',
      scheduledFor: new Date(alert.scheduledFor).toISOString().slice(0, 16),
      recurPattern: alert.recurPattern,
      recurrenceEnd: alert.recurrenceEnd
        ? new Date(alert.recurrenceEnd).toISOString().slice(0, 10)
        : '',
    });
    setEditingId(alert._id);
    setShowForm(true);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this scheduled alert?')) {
      return;
    }

    try {
      await axios.post(`/api/scheduled-alerts/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess('Alert cancelled successfully');
      fetchAlerts();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel alert');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      disasterType: 'flood',
      location: '',
      state: '',
      severity: 'Medium',
      message: '',
      templateId: '',
      scheduledFor: '',
      recurPattern: 'once',
      recurrenceEnd: '',
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="scheduled-alerts">
      <div className="alerts-header">
        <h2>Scheduled SMS Alerts</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Schedule Alert'}
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.upcomingAlerts}</div>
            <div className="stat-label">Upcoming Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.byStatus?.scheduled || 0}</div>
            <div className="stat-label">Scheduled</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.byStatus?.sent || 0}</div>
            <div className="stat-label">Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.byStatus?.failed || 0}</div>
            <div className="stat-label">Failed</div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="schedule-form">
          <h3>{editingId ? 'Edit Scheduled Alert' : 'Schedule New Alert'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Disaster Type *</label>
                <select
                  name="disasterType"
                  value={formData.disasterType}
                  onChange={handleInputChange}
                >
                  {disasterTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Severity *</label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                >
                  {severities.map((sev) => (
                    <option key={sev} value={sev}>
                      {sev}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai, Chennai"
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., Maharashtra, Tamil Nadu"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Alert Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter alert message (max 160 characters)"
                rows="3"
                maxLength="160"
              />
              <small>{formData.message.length}/160 characters</small>
            </div>

            <div className="form-section">
              <h4>Use Template (Optional)</h4>
              {templates.length > 0 ? (
                <div className="templates-quick-list">
                  {templates.map((template) => (
                    <button
                      key={template._id}
                      type="button"
                      className="template-quick-btn"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <strong>{template.name}</strong>
                      <small>{template.message}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-templates">No templates available. Create one first!</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Scheduled For *</label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Recurrence Pattern</label>
                <select
                  name="recurPattern"
                  value={formData.recurPattern}
                  onChange={handleInputChange}
                >
                  {recurPatterns.map((pattern) => (
                    <option key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.recurPattern !== 'once' && (
              <div className="form-group">
                <label>Recurrence End Date (Optional)</label>
                <input
                  type="date"
                  name="recurrenceEnd"
                  value={formData.recurrenceEnd}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Scheduling...' : 'Schedule Alert'}
              </button>
              <button
                type="button"
                onClick={handleFormCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-buttons">
          {['scheduled', 'sent', 'failed', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="alerts-list">
        {loading && !showForm ? (
          <div className="loading">Loading scheduled alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <p>No {filterStatus} alerts scheduled</p>
          </div>
        ) : (
          <div className="alerts-table">
            {alerts.map((alert) => (
              <div key={alert._id} className="alert-row">
                <div className="alert-info">
                  <div className="alert-title">
                    <strong>{alert.disasterType.toUpperCase()}</strong>
                    <span className={`severity-badge severity-${alert.severity}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="alert-details">
                    <span>{alert.location}, {alert.state}</span>
                    <span className="separator">•</span>
                    <span>{formatDate(alert.scheduledFor)}</span>
                  </div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-meta">
                    <span className={`status-badge status-${alert.status}`}>
                      {alert.status}
                    </span>
                    {alert.recurPattern !== 'once' && (
                      <span className="recurring-badge">
                        Recurring: {alert.recurPattern}
                      </span>
                    )}
                  </div>
                </div>

                <div className="alert-actions">
                  {alert.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleEdit(alert)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancel(alert._id)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledAlertsForm;
