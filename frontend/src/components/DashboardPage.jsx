import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./DashboardPage.css";
import {
  FaHouse,
  FaBell,
  FaChartLine,
  FaUser,
  FaRightFromBracket,
  FaTriangleExclamation,
  FaCloudRain,
  FaWind,
  FaThermometer,
  FaLocationDot,
  FaArrowUp,
  FaArrowDown,
  FaShield,
  FaClock,
  FaPhone,
  FaCheck,
  FaHourglass,
} from "react-icons/fa6";
import api from "../api/axios";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [userName, setUserName] = useState("User");
  const [activeTab, setActiveTab] = useState("overview");
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    activeAlerts: 24,
    resolvedToday: 16,
    pendingAlerts: 8,
    responseTime: "2.4 min",
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: "warning", title: "Heavy Rain Alert", message: "Moderate to heavy rainfall expected in your area", time: "5 min ago" },
    { id: 2, type: "info", title: "SOS Activity", message: "New SOS request received from neighboring area", time: "15 min ago" },
    { id: 3, type: "success", title: "Alert Resolved", message: "Flood warning in Zone A has been resolved", time: "1 hour ago" },
  ]);

  useEffect(() => {
    const user = localStorage.getItem("userId") || "User";
    setUserName(user);
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts");
      if (Array.isArray(res.data)) {
        setAlerts(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="dashboard-page-wrapper">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🚨</div>
          <div className="brand-text">
            <h3>SurakshaFlow</h3>
            <p>Alert System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FaHouse /> Overview
          </button>
          <button
            className={`nav-item ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            <FaBell /> Alerts
          </button>
          <button
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <FaChartLine /> Analytics
          </button>
          <button
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser /> Profile
          </button>
        </nav>

        <button className="nav-item logout-btn" onClick={handleLogout}>
          <FaRightFromBracket /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>👋 Welcome back, {userName}!</h1>
            <p>Here's what's happening with your alerts today</p>
          </div>
          <div className="header-right">
            <button className="header-btn notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <section className="stats-section">
              <div className="stats-grid">
                <div className="stat-card active">
                  <div className="stat-icon active-icon">
                    <FaTriangleExclamation />
                  </div>
                  <div className="stat-content">
                    <h3>Active Alerts</h3>
                    <div className="stat-value">{stats.activeAlerts}</div>
                    <p className="stat-trend">
                      <FaArrowUp /> 3% from yesterday
                    </p>
                  </div>
                </div>

                <div className="stat-card resolved">
                  <div className="stat-icon resolved-icon">
                    <FaCheck />
                  </div>
                  <div className="stat-content">
                    <h3>Resolved Today</h3>
                    <div className="stat-value">{stats.resolvedToday}</div>
                    <p className="stat-trend">
                      <FaArrowUp /> 12% increase
                    </p>
                  </div>
                </div>

                <div className="stat-card pending">
                  <div className="stat-icon pending-icon">
                    <FaHourglass />
                  </div>
                  <div className="stat-content">
                    <h3>Pending</h3>
                    <div className="stat-value">{stats.pendingAlerts}</div>
                    <p className="stat-trend">
                      <FaArrowDown /> 5% improvement
                    </p>
                  </div>
                </div>

                <div className="stat-card response">
                  <div className="stat-icon response-icon">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <h3>Avg Response</h3>
                    <div className="stat-value">{stats.responseTime}</div>
                    <p className="stat-trend">
                      <FaArrowDown /> 30s faster
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions & Weather */}
            <section className="middle-section">
              {/* Weather Widget */}
              <div className="weather-widget">
                <div className="weather-header">
                  <h3>🌤️ Weather Forecast</h3>
                  <span className="location-badge">
                    <FaLocationDot /> Current Location
                  </span>
                </div>
                <div className="weather-body">
                  <div className="weather-main">
                    <div className="temp-display">
                      <FaThermometer /> 28°C
                    </div>
                    <div className="weather-desc">Partly Cloudy</div>
                  </div>
                  <div className="weather-details">
                    <div className="weather-detail-item">
                      <FaCloudRain /> Humidity: 65%
                    </div>
                    <div className="weather-detail-item">
                      <FaWind /> Wind: 12 km/h
                    </div>
                    <div className="weather-detail-item">
                      <FaArrowUp /> Pressure: 1013 mb
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-widget">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <button className="action-btn emergency">
                    <FaTriangleExclamation /> Emergency Call
                  </button>
                  {/* Create Alert - Admin Only */}
                  {isAdmin && (
                    <button className="action-btn alert">
                      <FaBell /> Create Alert
                    </button>
                  )}
                  <button className="action-btn report">
                    <FaShield /> Report Incident
                  </button>
                  <button className="action-btn help">
                    <FaPhone /> Get Help
                  </button>
                </div>
              </div>
            </section>

            {/* Alerts & Notifications */}
            <section className="bottom-section">
              {/* Recent Alerts */}
              <div className="alerts-widget">
                <div className="widget-header">
                  <h3>📋 Recent Alerts</h3>
                  <a href="/alerts" className="view-all">
                    View All →
                  </a>
                </div>
                <div className="alerts-list">
                  {alerts.length > 0 ? (
                    alerts.map((alert, idx) => (
                      <div key={idx} className="alert-item">
                        <div className="alert-icon">
                          <FaTriangleExclamation />
                        </div>
                        <div className="alert-details">
                          <h4>{alert.title || `Alert ${idx + 1}`}</h4>
                          <p>{alert.description || "No description available"}</p>
                          <span className="alert-time">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className={`alert-status ${alert.status || "pending"}`}>
                          {alert.status || "Pending"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No recent alerts</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="notifications-widget">
                <div className="widget-header">
                  <h3>🔔 Notifications</h3>
                  <button className="clear-btn">Clear All</button>
                </div>
                <div className="notifications-list">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.type}`}>
                      <div className="notification-icon">
                        {notif.type === "warning" && <FaTriangleExclamation />}
                        {notif.type === "success" && <FaCheck />}
                        {notif.type === "info" && <FaBell />}
                      </div>
                      <div className="notification-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="dashboard-content">
            <div className="tab-header">
              <h2>All Alerts</h2>
              <button className="primary-btn">Create New Alert</button>
            </div>
            <div className="alerts-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="badge warning">
                          <FaTriangleExclamation /> Alert
                        </span>
                      </td>
                      <td>{alert.title || `Alert ${idx + 1}`}</td>
                      <td>
                        <span className={`status ${alert.status || "pending"}`}>
                          {alert.status || "Pending"}
                        </span>
                      </td>
                      <td>{new Date(alert.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="action-link">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="dashboard-content">
            <div className="tab-header">
              <h2>Analytics & Reports</h2>
            </div>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Alert Distribution</h3>
                <div className="chart-placeholder">
                  <p>📊 Chart will be loaded here</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Response Time Trend</h3>
                <div className="chart-placeholder">
                  <p>📈 Chart will be loaded here</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Geographic Heat Map</h3>
                <div className="chart-placeholder">
                  <p>🗺️ Map will be loaded here</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Monthly Summary</h3>
                <div className="chart-placeholder">
                  <p>📋 Summary will be loaded here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="dashboard-content">
            <div className="tab-header">
              <h2>User Profile</h2>
            </div>
            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-avatar-large">{userName.charAt(0).toUpperCase()}</div>
                <h2>{userName}</h2>
                <p>Emergency Response Coordinator</p>

                <div className="profile-details">
                  <div className="detail-group">
                    <label>Email</label>
                    <p>user@surakshaflow.example</p>
                  </div>
                  <div className="detail-group">
                    <label>Phone</label>
                    <p>+91 98765 43210</p>
                  </div>
                  <div className="detail-group">
                    <label>Location</label>
                    <p>Maharashtra, India</p>
                  </div>
                  <div className="detail-group">
                    <label>Member Since</label>
                    <p>January 2024</p>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="primary-btn">Edit Profile</button>
                  <button className="secondary-btn">Change Password</button>
                </div>
              </div>

              <div className="emergency-contacts">
                <h3>Emergency Contacts</h3>
                <div className="contacts-list">
                  <div className="contact-item">
                    <FaPhone /> Police Helpline <span>100</span>
                  </div>
                  <div className="contact-item">
                    <FaPhone /> Ambulance <span>102</span>
                  </div>
                  <div className="contact-item">
                    <FaPhone /> Fire Brigade <span>101</span>
                  </div>
                  <div className="contact-item">
                    <FaPhone /> Disaster Management <span>1078</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
