import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import { socketService } from '../services/socketService';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [stats, setStats] = useState({
    totalAlerts: 0,
    pending: 0,
    assigned: 0,
    resolved: 0,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'flood',
    location: '',
    severity: 'Medium',
    status: 'Pending',
    affectedArea: '',
    casualties: 0,
  });

  useEffect(() => {
    socketService.initializeSocket();
    fetchAllData();

    const unsubscribeNew = socketService.onNewAlert((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      setStats(prev => ({
        ...prev,
        totalAlerts: prev.totalAlerts + 1,
        pending: prev.pending + (newAlert.status === 'Pending' ? 1 : 0),
        assigned: prev.assigned + (newAlert.status === 'Assigned' ? 1 : 0),
        resolved: prev.resolved + (newAlert.status === 'Resolved' ? 1 : 0),
      }));
      // Show toast notification
      toast.error(`🚨 New ${newAlert.severity} Alert: ${newAlert.title}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    const unsubscribeUpdate = socketService.onUpdateAlert((updatedAlert) => {
      setAlerts(prev => prev.map(alert => alert._id === updatedAlert._id ? updatedAlert : alert));
      fetchAllData();
    });

    const unsubscribeDelete = socketService.onDeleteAlert((payload) => {
      const id = payload?.id || payload;
      setAlerts(prev => prev.filter(alert => alert._id !== id));
      fetchAllData();
    });

    const unsubscribeChat = socketService.onChatMessage((message) => {
      if (message.to === 'admin' && message.from === selectedTeam?._id) {
        setChatMessages(prev => [...prev, message]);
      }
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeDelete();
      unsubscribeChat();
    };
  }, []);

  const fetchAllData = async () => {
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
  };

  const updateStats = (alertList) => {
    setStats({
      totalAlerts: alertList.length,
      pending: alertList.filter(a => a.status === 'Pending').length,
      assigned: alertList.filter(a => a.status === 'Assigned').length,
      resolved: alertList.filter(a => a.status === 'Resolved').length,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'casualties' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/alerts/${editingId}`, {
          ...formData,
          status: formData.status || 'Pending',
        });
        socketService.emitUpdateAlert({ _id: editingId, ...formData });
      } else {
        const payload = {
          ...formData,
          status: 'Pending',
        };
        const response = await API.post('/alerts', payload);
        socketService.emitNewAlert(response.data);
      }
      resetForm();
      fetchAllData();
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to save alert. Please try again.');
    }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await API.delete(`/alerts/${alertId}`);
      socketService.emitDeleteAlert(alertId);
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
      type: alert.type,
      location: alert.location,
      severity: alert.severity,
      status: alert.status || 'Pending',
      affectedArea: alert.affectedArea || '',
      casualties: alert.casualties || 0,
    });
    setEditingId(alert._id);
    setShowForm(true);
  };

  const handleAssignToRescue = async (alertId, rescueTeamId) => {
    try {
      const response = await API.put(`/alerts/${alertId}/assign`, { teamId: rescueTeamId });
      socketService.emitUpdateAlert(response.data);
      fetchAllData();
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
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim() || !selectedTeam) return;

    const message = {
      from: 'admin',
      to: selectedTeam._id,
      message: chatMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, message]);
    socketService.emitChatMessage(message);
    setChatMessage('');
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setChatMessages([]); // Clear messages when switching teams
  };

  // Filter alerts based on severity, status, and search term
  let filteredAlerts = alerts;
  if (filterSeverity !== 'All') {
    filteredAlerts = filteredAlerts.filter(a => a.severity === filterSeverity);
  }
  if (filterStatus !== 'All') {
    filteredAlerts = filteredAlerts.filter(a => a.status === filterStatus);
  }
  if (searchTerm) {
    filteredAlerts = filteredAlerts.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <ToastContainer />
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>👑 Admin Dashboard</h1>
          <p>Complete disaster management control center</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="admin-badge">👑 Admin</span>
            <span className="user-email">{userEmail}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <h3>Total Alerts</h3>
            <div className="stat-value">{stats.totalAlerts}</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <h3>Pending</h3>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-card assigned">
            <div className="stat-icon">👥</div>
            <h3>Assigned</h3>
            <div className="stat-value">{stats.assigned}</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-icon">✅</div>
            <h3>Resolved</h3>
            <div className="stat-value">{stats.resolved}</div>
          </div>
        </section>

        {/* Create/Edit Alert Form */}
        <section className="form-section">
          <h2>
            {editingId ? '✏️ Edit Alert' : '➕ Create New Alert'}
          </h2>

          <button
            className="btn-toggle-form"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✖️ Close' : '➕ Create Alert'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="alert-form">
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
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Alert description"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} required>
                    <option value="flood">🌊 Flood</option>
                    <option value="earthquake">🏚️ Earthquake</option>
                    <option value="cyclone">🌪️ Cyclone</option>
                    <option value="fire">🔥 Fire</option>
                    <option value="landslide">🗻 Landslide</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    required
                  />
                </div>

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
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Resolved">Resolved</option>
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
                <button type="submit" className="btn-submit">
                  {editingId ? '🔄 Update Alert' : '✅ Create Alert'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Filters and Search */}
        <section className="filters-section">
          <div className="filter-group">
            <label>Filter by Severity:</label>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="🔍 Search alerts by title, location, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </section>

        {/* Alerts Table */}
        <section className="alerts-section">
          <h2>📋 All Alerts ({filteredAlerts.length})</h2>

          {loading ? (
            <div className="loading">Loading alerts...</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="empty-state">
              <p>No alerts found matching the filters</p>
            </div>
          ) : (
            <div className="alerts-table-wrapper">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Title</th>
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
                      <td>
                        <strong>{alert.title}</strong>
                        <p className="description">{alert.description}</p>
                      </td>
                      <td>📍 {alert.location}</td>
                      <td>{alert.type}</td>
                      <td>
                        <span
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(alert.severity) }}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={alert.status}
                          onChange={(e) => handleUpdateStatus(alert._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td>{alert.assignedTo ? (rescueTeams.find(t => t._id === alert.assignedTo)?.name || 'Team') : 'Unassigned'}</td>
                      <td>{new Date(alert.createdAt).toLocaleString()}</td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(alert)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(alert._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>

                        {alert.status === 'Pending' && rescueTeams.length > 0 && (
                          <select
                            className="btn-assign"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignToRescue(alert._id, e.target.value);
                              }
                            }}
                          >
                            <option value="">👥 Assign</option>
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
        </section>

        {/* Google Maps Section */}
        <section className="map-section">
          <h2>🗺️ Alert Locations Map</h2>
          <div className="map-container">
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '400px' }}
                center={{ lat: 20.5937, lng: 78.9629 }} // Center of India
                zoom={5}
              >
                {filteredAlerts.map(alert => (
                  alert.coordinates && alert.coordinates.coordinates ? (
                    <Marker
                      key={alert._id}
                      position={{
                        lat: alert.coordinates.coordinates[1],
                        lng: alert.coordinates.coordinates[0]
                      }}
                      onClick={() => setSelectedAlert(alert)}
                    />
                  ) : null
                ))}
                {selectedAlert && selectedAlert.coordinates && selectedAlert.coordinates.coordinates && (
                  <InfoWindow
                    position={{
                      lat: selectedAlert.coordinates.coordinates[1],
                      lng: selectedAlert.coordinates.coordinates[0]
                    }}
                    onCloseClick={() => setSelectedAlert(null)}
                  >
                    <div>
                      <h3>{selectedAlert.title}</h3>
                      <p><strong>Type:</strong> {selectedAlert.type}</p>
                      <p><strong>Severity:</strong> {selectedAlert.severity}</p>
                      <p><strong>Status:</strong> {selectedAlert.status}</p>
                      <p><strong>Location:</strong> {selectedAlert.location}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </section>

        {/* Rescue Teams Tracking */}
        <section className="rescue-section">
          <h2>🚁 Live Rescue Teams Tracking</h2>
          <div className="rescue-teams-grid">
            {rescueTeams.map(team => (
              <div key={team._id} className="rescue-team-card">
                <div className="team-header">
                  <h3>{team.name}</h3>
                  <span className={`status-indicator ${team.active ? 'active' : 'inactive'}`}>
                    {team.active ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>
                <div className="team-details">
                  <p><strong>Contact:</strong> {team.contact || 'N/A'}</p>
                  <p><strong>Members:</strong> {team.members?.length || 0}</p>
                  {team.location?.coordinates && (
                    <p><strong>Location:</strong> {team.location.coordinates[1].toFixed(4)}, {team.location.coordinates[0].toFixed(4)}</p>
                  )}
                </div>
                <div className="team-actions">
                  <button className="btn-track">📍 Track</button>
                  <button className="btn-contact">📞 Contact</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-Time Chat with Rescue Teams */}
        <section className="chat-section">
          <h2>💬 Real-Time Chat with Rescue Teams</h2>
          <div className="chat-container">
            <div className="teams-list">
              <h3>Active Teams</h3>
              {rescueTeams.filter(team => team.active).map(team => (
                <div
                  key={team._id}
                  className={`team-item ${selectedTeam?._id === team._id ? 'active' : ''}`}
                  onClick={() => handleTeamSelect(team)}
                >
                  {team.name}
                </div>
              ))}
            </div>
            <div className="chat-window">
              {selectedTeam ? (
                <>
                  <div className="chat-header">
                    <h3>Chat with {selectedTeam.name}</h3>
                  </div>
                  <div className="chat-messages">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`message ${msg.from === 'admin' ? 'sent' : 'received'}`}>
                        <p>{msg.message}</p>
                        <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="Type your message..."
                    />
                    <button onClick={handleSendChatMessage}>Send</button>
                  </div>
                </>
              ) : (
                <div className="chat-placeholder">
                  <p>Select a rescue team to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
