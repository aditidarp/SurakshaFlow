import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import { socketService } from '../services/socketService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, userEmail, isAdmin } = useAuth();

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [isAdmin, navigate]);

  const [alerts, setAlerts] = useState([]);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const [stats, setStats] = useState({
    totalAlerts: 0,
    pending: 0,
    assigned: 0,
    resolved: 0,
    critical: 0,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'flood',
    location: '',
    severity: 'Low',
    status: 'Pending',
    affectedArea: '',
    casualties: 0,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const updateStats = useCallback((alertList) => {
    setStats({
      totalAlerts: alertList.length,
      pending: alertList.filter(a => a.status === 'Pending').length,
      assigned: alertList.filter(a => a.status === 'Assigned').length,
      resolved: alertList.filter(a => a.status === 'Resolved').length,
      critical: alertList.filter(a => a.severity === 'Critical').length,
    });
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsResponse, teamsResponse] = await Promise.all([
        API.get('/alerts'),
        API.get('/rescue/teams'),
      ]);

      const fetchedAlerts = Array.isArray(alertsResponse.data) ? alertsResponse.data : [];
      const fetchedTeams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];

      setAlerts(fetchedAlerts);
      setRescueTeams(fetchedTeams);
      updateStats(fetchedAlerts);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [updateStats]);

  useEffect(() => {
    socketService.initializeSocket();
    fetchAllData();

    const unsubscribeNew = socketService.onNewAlert((newAlert) => {
      setAlerts(prev => {
        if (!newAlert || !newAlert._id) return prev;
        if (prev.some(alert => alert._id === newAlert._id)) return prev;
        const nextAlerts = [newAlert, ...prev];
        updateStats(nextAlerts);
        return nextAlerts;
      });
      showSuccessMessage('New alert received!');
    });

    const unsubscribeUpdate = socketService.onUpdateAlert((updatedAlert) => {
      setAlerts(prev => {
        const nextAlerts = prev.map(alert => alert._id === updatedAlert._id ? updatedAlert : alert);
        updateStats(nextAlerts);
        return nextAlerts;
      });
      showSuccessMessage('Alert updated in real-time!');
    });

    const unsubscribeDelete = socketService.onDeleteAlert((payload) => {
      const id = payload?.id || payload;
      setAlerts(prev => {
        const nextAlerts = prev.filter(alert => alert._id !== id);
        updateStats(nextAlerts);
        return nextAlerts;
      });
      showSuccessMessage('Alert deleted!');
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [fetchAllData, updateStats]);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.type) errors.type = 'Alert type is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'casualties' || name === 'deaths' || name === 'injured') ? parseInt(value) || 0 : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        severity: formData.severity,
        status: formData.status || 'Pending',
        affectedArea: formData.affectedArea,
        casualties: formData.casualties,
      };

      if (editingId) {
        await API.put(`/alerts/${editingId}`, payload);
        showSuccessMessage('Alert updated successfully!');
      } else {
        await API.post('/alerts', payload);
        showSuccessMessage('Alert created successfully!');
      }
      resetForm();
      fetchAllData();
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to save alert. Please try again.');
    }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await API.delete(`/alerts/${alertId}`);
      fetchAllData();
    } catch (err) {
      console.error('Error deleting alert:', err);
      alert('Failed to delete alert. Please try again.');
    }
  };

  const handleEdit = (alert) => {
    setFormData({
      title: alert.title,
      description: alert.description,
      type: alert.type || 'flood',
      location: alert.location,
      severity: alert.severity || 'Medium',
      status: alert.status || 'Pending',
      affectedArea: alert.affectedArea || '',
      casualties: alert.casualties || 0,
    });
    setEditingId(alert._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssignToRescue = async (alertId, rescueTeamId) => {
    try {
      const response = await API.put(`/alerts/${alertId}/assign`, { teamId: rescueTeamId });
      socketService.emitUpdateAlert(response.data);
      fetchAllData();
      showSuccessMessage('Rescue team assigned!');
    } catch (err) {
      console.error('Error assigning alert:', err);
      alert('Failed to assign rescue team.');
    }
  };

  const handleUpdateStatus = async (alertId, status) => {
    try {
      const response = await API.put(`/alerts/${alertId}/status`, { status });
      socketService.emitUpdateAlert(response.data);
      fetchAllData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'flood',
      location: '',
      severity: 'Medium',
      status: 'Pending',
      affectedArea: '',
      casualties: 0,
    });
    setValidationErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Low: '#10b981',
      Medium: '#f59e0b',
      High: '#ef4444',
      Critical: '#dc2626'
    };
    return colors[severity] || '#6b7280';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      Low: '🟢',
      Medium: '🟡',
      High: '🔴',
      Critical: '⚫'
    };
    return icons[severity] || '⚪';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: '⏳',
      Assigned: '👥',
      Resolved: '✅'
    };
    return icons[status] || '📌';
  };

  const getTypeIcon = (type) => {
    if (!type || typeof type !== 'string') return '⚠️';
    const icons = {
      flood: '💧',
      earthquake: '🌍',
      cyclone: '🌪️',
      fire: '🔥',
      landslide: '⛰️'
    };
    return icons[type.toLowerCase()] || '⚠️';
  };

  // Comprehensive filtering
  let filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'All' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || alert.status === filterStatus;
    const matchesType = filterType === 'All' || alert.type === filterType;
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const alertTypes = ['All', ...new Set(alerts.map(a => a.type))];

  if (!isAdmin) {
    return (
      <div className="admin-dashboard access-denied-page">
        <div className="access-denied-container">
          <h2>🔒 Access Denied</h2>
          <p>Only admins can access this dashboard.</p>
          <button onClick={() => navigate('/home')} className="btn-back">
            ← Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🎛️ Control Panel</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-link active">📊 Overview</a>
          <a href="#alerts" className="nav-link">🚨 All Alerts</a>
          <a href="#teams" className="nav-link">👥 Rescue Teams</a>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">👑</div>
          <div className="user-details">
            <p className="user-role">Administrator</p>
            <p className="user-email">{userEmail}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Logout">
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1>Disaster Alert Management System</h1>
          </div>
          <div className="topbar-right">
            {successMessage && (
              <div className="success-toast">
                ✓ {successMessage}
              </div>
            )}
          </div>
        </header>

        {/* Stats Dashboard */}
        <section className="stats-dashboard" id="overview">
          <div className="stat-card stat-total">
            <div className="stat-header">
              <span className="stat-icon">📊</span>
              <span className="stat-label">Total Alerts</span>
            </div>
            <div className="stat-value">{stats.totalAlerts}</div>
            <div className="stat-change">All active alerts</div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-header">
              <span className="stat-icon">⏳</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-change">Awaiting action</div>
          </div>

          <div className="stat-card stat-assigned">
            <div className="stat-header">
              <span className="stat-icon">👥</span>
              <span className="stat-label">Assigned</span>
            </div>
            <div className="stat-value">{stats.assigned}</div>
            <div className="stat-change">To rescue teams</div>
          </div>

          <div className="stat-card stat-resolved">
            <div className="stat-header">
              <span className="stat-icon">✅</span>
              <span className="stat-label">Resolved</span>
            </div>
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-change">Successfully handled</div>
          </div>

          <div className="stat-card stat-critical">
            <div className="stat-header">
              <span className="stat-icon">🔴</span>
              <span className="stat-label">Critical</span>
            </div>
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-change">High severity alerts</div>
          </div>
        </section>

        {/* Create/Edit Form Section */}
        <section className="form-section">
          <div className="form-header">
            <h2>{editingId ? '✏️ Edit Alert' : '➕ Create New Alert'}</h2>
            <button
              className={`btn-primary ${showForm ? 'active' : ''}`}
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) resetForm();
              }}
            >
              {showForm ? '✖️ Cancel' : '➕ Create Alert'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="alert-form">
              <div className="form-grid">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="title">Alert Title *</label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Flood Warning in Mumbai"
                      className={validationErrors.title ? 'error' : ''}
                      required
                    />
                    {validationErrors.title && <span className="error-text">{validationErrors.title}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide detailed information about the alert"
                      rows="4"
                      className={validationErrors.description ? 'error' : ''}
                      required
                    />
                    {validationErrors.description && <span className="error-text">{validationErrors.description}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Mumbai, Maharashtra"
                      className={validationErrors.location ? 'error' : ''}
                      required
                    />
                    {validationErrors.location && <span className="error-text">{validationErrors.location}</span>}
                  </div>
                </div>

                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="type">Alert Type *</label>
                    <select id="type" name="type" value={formData.type} onChange={handleInputChange} required>
                      <option value="flood">🌊 Flood</option>
                      <option value="earthquake">🏚️ Earthquake</option>
                      <option value="cyclone">🌪️ Cyclone</option>
                      <option value="fire">🔥 Fire</option>
                      <option value="landslide">🗻 Landslide</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="severity">Severity *</label>
                    <select id="severity" name="severity" value={formData.severity} onChange={handleInputChange}>
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                      <option value="Critical">⚫ Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Assigned">👥 Assigned</option>
                      <option value="Resolved">✅ Resolved</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="affectedArea">Affected Area</label>
                    <input
                      id="affectedArea"
                      type="text"
                      name="affectedArea"
                      value={formData.affectedArea}
                      onChange={handleInputChange}
                      placeholder="e.g., 5 districts"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="casualties">Casualties</label>
                    <input
                      id="casualties"
                      type="number"
                      name="casualties"
                      value={formData.casualties}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? '🔄 Update Alert' : '✅ Create Alert'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Clear Form
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Alerts Management Section */}
        <section className="alerts-section" id="alerts">
          <div className="section-header">
            <h2>🚨 Alerts Management</h2>
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                📋
              </button>
              <button
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                🗂️
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="filters-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search alerts by title, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-row">
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
                  <option value="All">All</option>
                  <option value="Low">🟢 Low</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="High">🔴 High</option>
                  <option value="Critical">⚫ Critical</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Assigned">👥 Assigned</option>
                  <option value="Resolved">✅ Resolved</option>
                </select>
              </div>

              <button className="btn-reset-filters" onClick={() => {
                setFilterSeverity('All');
                setFilterStatus('All');
                setFilterType('All');
                setSearchQuery('');
              }}>
                ↺ Reset Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-info">
            <p>Showing <strong>{filteredAlerts.length}</strong> of <strong>{alerts.length}</strong> alerts</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading alerts...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAlerts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Alerts Found</h3>
              <p>Try adjusting your filters or create a new alert to get started.</p>
            </div>
          )}

          {/* Table View */}
          {!loading && filteredAlerts.length > 0 && viewMode === 'table' && (
            <div className="alerts-table-container">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Alert</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map(alert => (
                    <tr key={alert._id} className="alert-row">
                      <td className="alert-title-cell">
                        <strong>{alert.title}</strong>
                        <span className="alert-desc">{alert.description.substring(0, 40)}...</span>
                      </td>
                      <td className="location-cell">📍 {alert.location}</td>
                      <td className="type-cell">{getTypeIcon(alert.type)} {alert.type}</td>
                      <td className="severity-cell">
                        <span
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(alert.severity) }}
                        >
                          {getSeverityIcon(alert.severity)} {alert.severity}
                        </span>
                      </td>
                      <td className="status-cell">
                        <select
                          className="status-select"
                          value={alert.status}
                          onChange={(e) => handleUpdateStatus(alert._id, e.target.value)}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Assigned">👥 Assigned</option>
                          <option value="Resolved">✅ Resolved</option>
                        </select>
                      </td>
                      <td className="assigned-cell">
                        {alert.assignedTo ? (
                          <span className="assigned-badge">
                            {rescueTeams.find(t => t._id === alert.assignedTo)?.name || 'Team'}
                          </span>
                        ) : (
                          <span className="unassigned-badge">Unassigned</span>
                        )}
                      </td>
                      <td className="date-cell">
                        {new Date(alert.createdAt).toLocaleDateString()} <br/>
                        <small>{new Date(alert.createdAt).toLocaleTimeString()}</small>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon edit"
                          onClick={() => handleEdit(alert)}
                          title="Edit alert"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(alert._id)}
                          title="Delete alert"
                        >
                          🗑️
                        </button>
                        {alert.status === 'Pending' && rescueTeams.length > 0 && (
                          <select
                            className="btn-assign-select"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignToRescue(alert._id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            title="Assign to rescue team"
                          >
                            <option value="">👥</option>
                            {rescueTeams.map(team => (
                              <option key={team._id} value={team._id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Card View */}
          {!loading && filteredAlerts.length > 0 && viewMode === 'cards' && (
            <div className="alerts-cards-grid">
              {filteredAlerts.map(alert => (
                <div key={alert._id} className="alert-card">
                  <div className="card-header" style={{ borderTopColor: getSeverityColor(alert.severity) }}>
                    <div className="card-title">
                      <h3>{alert.title}</h3>
                      <span className="card-type">{getTypeIcon(alert.type)} {alert.type}</span>
                    </div>
                    <span
                      className="card-severity"
                      style={{ backgroundColor: getSeverityColor(alert.severity) }}
                    >
                      {getSeverityIcon(alert.severity)}
                    </span>
                  </div>

                  <div className="card-body">
                    <p className="card-description">{alert.description}</p>

                    <div className="card-info">
                      <div className="info-item">
                        <span className="label">Location:</span>
                        <span className="value">📍 {alert.location}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Status:</span>
                        <span className="value">{getStatusIcon(alert.status)} {alert.status}</span>
                      </div>
                      {alert.affectedArea && (
                        <div className="info-item">
                          <span className="label">Affected:</span>
                          <span className="value">{alert.affectedArea}</span>
                        </div>
                      )}
                      {alert.casualties > 0 && (
                        <div className="info-item">
                          <span className="label">Casualties:</span>
                          <span className="value critical">{alert.casualties}</span>
                        </div>
                      )}
                    </div>

                    <div className="card-assigned">
                      {alert.assignedTo ? (
                        <span className="assigned">✅ Assigned to {rescueTeams.find(t => t._id === alert.assignedTo)?.name || 'Team'}</span>
                      ) : (
                        <span className="unassigned">⚠️ Not assigned yet</span>
                      )}
                    </div>
                  </div>

                  <div className="card-footer">
                    <select
                      className="card-status-select"
                      value={alert.status}
                      onChange={(e) => handleUpdateStatus(alert._id, e.target.value)}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Assigned">👥 Assigned</option>
                      <option value="Resolved">✅ Resolved</option>
                    </select>

                    <div className="card-actions">
                      <button
                        className="card-btn edit"
                        onClick={() => handleEdit(alert)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="card-btn delete"
                        onClick={() => handleDelete(alert._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                      {alert.status === 'Pending' && rescueTeams.length > 0 && (
                        <select
                          className="card-assign-select"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignToRescue(alert._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">👥</option>
                          {rescueTeams.map(team => (
                            <option key={team._id} value={team._id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
