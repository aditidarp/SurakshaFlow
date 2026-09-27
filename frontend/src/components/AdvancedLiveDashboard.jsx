import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';
import './AdvancedLiveDashboard.css';

// Custom icon markers
const fireIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const floodIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const earthquakeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stormIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getMarkerIcon = (alertType) => {
  switch (alertType?.toLowerCase()) {
    case 'fire':
      return fireIcon;
    case 'flood':
      return floodIcon;
    case 'earthquake':
      return earthquakeIcon;
    case 'storm':
    case 'thunderstorm':
      return stormIcon;
    default:
      return fireIcon;
  }
};

const getAlertColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'fire':
      return '#FF4444';
    case 'flood':
      return '#4444FF';
    case 'earthquake':
      return '#FF8844';
    case 'storm':
    case 'thunderstorm':
      return '#FFFF44';
    case 'landslide':
      return '#884444';
    default:
      return '#FF4444';
  }
};

const normalizeSeverity = (severity) => {
  if (typeof severity === 'string') return severity.toLowerCase();
  if (severity === null || severity === undefined) return 'low';
  return String(severity).toLowerCase();
};

const getMarkerRadius = (severity) => {
  switch (normalizeSeverity(severity)) {
    case 'critical':
      return 14;
    case 'high':
      return 12;
    case 'medium':
      return 9;
    case 'low':
    default:
      return 7;
  }
};

const getAlertCoordinates = (alert) => {
  if (Array.isArray(alert.coordinates) && alert.coordinates.length >= 2) {
    const [first, second] = alert.coordinates.map(Number);
    return Number.isFinite(first) && Number.isFinite(second) ? [first, second] : null;
  }

  if (alert.coordinates?.type === 'Point' && Array.isArray(alert.coordinates.coordinates)) {
    const [longitude, latitude] = alert.coordinates.coordinates.map(Number);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null;
  }

  return null;
};

export default function AdvancedLiveDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeAlert, setActiveAlert] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    byType: {},
    severity: { critical: 0, high: 0, medium: 0, low: 0 },
  });
  const [filterType, setFilterType] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${API_URL}/real-alerts/combined`);
        const officialAlerts = response.data.alerts || [];
        setAlerts(officialAlerts);
        updateStatistics(officialAlerts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const addRealTimeAlert = (newAlert) => {
    setAlerts((prev) => {
      const alertId = newAlert.externalAlertId || newAlert._id || newAlert.id;
      const withoutExisting = prev.filter((alert) => (alert.externalAlertId || alert._id || alert.id) !== alertId);
      const nextAlerts = [newAlert, ...withoutExisting].slice(0, 100);
      updateStatistics(nextAlerts);
      return nextAlerts;
    });
    setLastUpdated(new Date());
  };

  // Socket.io connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to real-time alerts');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('live-alert', addRealTimeAlert);
    socket.on('liveAlert', addRealTimeAlert);

    socket.on('live-weather', (data) => {
      setWeatherData((prev) => [...prev, data].slice(0, 10));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateStatistics = (alertList) => {
    const stats = {
      total: alertList.length,
      byType: {},
      severity: { critical: 0, high: 0, medium: 0, low: 0 },
    };

    alertList.forEach((alert) => {
      const type = alert.type || 'Unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      const severity = normalizeSeverity(alert.severity);
      if (stats.severity[severity] !== undefined) {
        stats.severity[severity]++;
      }
    });

    setStatistics(stats);
  };

  const filteredAlerts = filterType === 'all'
    ? alerts
    : alerts.filter((a) => String(a.type || '').toLowerCase() === filterType.toLowerCase());

  const renderAlertMarkers = () => {
    return filteredAlerts.map((alert, idx) => {
      const coordinates = getAlertCoordinates(alert);
      if (!coordinates) {
        return null;
      }

      const [lat, lng] = coordinates;
      const alertSeverity = normalizeSeverity(alert.severity);
      const markerColor = getAlertColor(alert.type);

      return (
        <React.Fragment key={`${alert.id || idx}-${lat}-${lng}`}>
          <CircleMarker
            center={[lat, lng]}
            radius={getMarkerRadius(alert.severity)}
            pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.25, weight: 2 }}
          />
          <Marker
            position={[lat, lng]}
            icon={getMarkerIcon(alert.type)}
            eventHandlers={{
              click: () => setActiveAlert(alert),
            }}
          >
            <Popup>
              <div className="popup-content">
                <h4>{alert.title || 'Live Alert'}</h4>
                <p><strong>Type:</strong> {alert.type || 'Unknown'}</p>
                <p><strong>Severity:</strong> {alertSeverity}</p>
                <p><strong>Location:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                {alert.description && <p>{alert.description}</p>}
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="advanced-live-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-top-row">
            <div>
              <h1>🌍 SurakshaFlow Live Alerts Map</h1>
              <p className="header-description">Official disaster alerts from Indian alert sources, updated as new records arrive.</p>
            </div>
            <div className="header-pill-row">
              <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                {connected ? '🟢 Real-Time Connected' : '⚫ Offline'}
              </span>
              <span className="last-updated">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="dashboard-summary-row">
            <div className="summary-card total-card">
              <span>Total Alerts</span>
              <strong>{statistics.total}</strong>
            </div>
            <div className="summary-card critical-card">
              <span>Critical Now</span>
              <strong>{statistics.severity.critical}</strong>
            </div>
            <div className="summary-card high-card">
              <span>High Severity</span>
              <strong>{statistics.severity.high}</strong>
            </div>
            <div className="summary-card medium-card">
              <span>Medium / Low</span>
              <strong>{statistics.severity.medium + statistics.severity.low}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Map Section */}
        <div className="map-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading live alerts...</p>
            </div>
          ) : (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              className="alert-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {renderAlertMarkers()}
            </MapContainer>
          )}

          {/* Alert Legend */}
          <div className="map-legend">
            <h4>Alert Types:</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#FF4444' }}></span>
                <span>Fire</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#4444FF' }}></span>
                <span>Flood</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#FF8844' }}></span>
                <span>Earthquake</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#FFFF44' }}></span>
                <span>Storm</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#884444' }}></span>
                <span>Landslide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="live-alerts-panel">
          {/* Statistics Cards */}
          <div className="statistics-section">
            <div className="stat-card total">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <h3>Total Alerts</h3>
                <p className="stat-number">{statistics.total}</p>
              </div>
            </div>

            <div className="stat-card critical">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>Critical</h3>
                <p className="stat-number">{statistics.severity.critical}</p>
              </div>
            </div>

            <div className="stat-card high">
              <div className="stat-icon">🔴</div>
              <div className="stat-content">
                <h3>High</h3>
                <p className="stat-number">{statistics.severity.high}</p>
              </div>
            </div>

            <div className="stat-card medium">
              <div className="stat-icon">🟡</div>
              <div className="stat-content">
                <h3>Medium</h3>
                <p className="stat-number">{statistics.severity.medium}</p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <h3>Filter by Type</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All ({alerts.length})
              </button>
              <button
                className={`filter-btn ${filterType === 'fire' ? 'active' : ''}`}
                onClick={() => setFilterType('fire')}
              >
                Fire ({statistics.byType['Fire'] || 0})
              </button>
              <button
                className={`filter-btn ${filterType === 'flood' ? 'active' : ''}`}
                onClick={() => setFilterType('flood')}
              >
                Flood ({statistics.byType['Flood'] || 0})
              </button>
              <button
                className={`filter-btn ${filterType === 'earthquake' ? 'active' : ''}`}
                onClick={() => setFilterType('earthquake')}
              >
                Earthquake ({statistics.byType['Earthquake'] || 0})
              </button>
            </div>
          </div>

          {/* Live Alerts List */}
          <div className="alerts-list-section">
            <h3>📍 Live Alerts ({filteredAlerts.length})</h3>
            <div className="alerts-list">
              {filteredAlerts.length === 0 ? (
                <div className="no-alerts">
                  <p>✅ No alerts at the moment</p>
                  <small>System is monitoring continuously</small>
                </div>
              ) : (
                filteredAlerts.slice(0, 15).map((alert, idx) => (
                  <div
                    key={`${alert.id}-${idx}`}
                    className={`alert-card ${normalizeSeverity(alert.severity)}`}
                    onClick={() => setActiveAlert(alert)}
                  >
                    <div className="alert-header">
                      <span className="alert-type-badge" style={{ backgroundColor: getAlertColor(alert.type) }}>
                        {alert.type}
                      </span>
                      <span className="alert-severity">{alert.severity}</span>
                    </div>
                    <h4 className="alert-title">{alert.title || 'Unnamed Alert'}</h4>
                    <p className="alert-description">{alert.description}</p>
                    <div className="alert-meta">
                      <small>
                        {(() => { const coordinates = getAlertCoordinates(alert); return coordinates ? `📍 ${coordinates[0].toFixed(2)}, ${coordinates[1].toFixed(2)}` : '📍 No location'; })()}
                      </small>
                      <small>⏰ {new Date(alert.createdAt).toLocaleTimeString()}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Weather Data */}
          {weatherData.length > 0 && (
            <div className="weather-section">
              <h3>🌡️ Weather Updates</h3>
              <div className="weather-list">
                {weatherData.slice(0, 3).map((weather, idx) => (
                  <div key={idx} className="weather-card">
                    <p><strong>{weather.city}</strong></p>
                    <p>Temp: {weather.temperature}°C</p>
                    <p>Humidity: {weather.humidity}%</p>
                    <p>Wind: {weather.windSpeed} km/h</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Alert Detail Modal */}
      {activeAlert && (
        <div className="modal-overlay" onClick={() => setActiveAlert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveAlert(null)}>✕</button>
            <h2>{activeAlert.title}</h2>
            <div className="modal-body">
              <p><strong>Type:</strong> {activeAlert.type}</p>
              <p><strong>Severity:</strong> <span className={`severity-badge ${normalizeSeverity(activeAlert.severity)}`}>{activeAlert.severity || 'Medium'}</span></p>
              <p><strong>Description:</strong> {activeAlert.description}</p>
              {getAlertCoordinates(activeAlert) && (
                <p><strong>Location:</strong> {getAlertCoordinates(activeAlert)[0].toFixed(4)}, {getAlertCoordinates(activeAlert)[1].toFixed(4)}</p>
              )}
              <p><strong>Created:</strong> {new Date(activeAlert.createdAt).toLocaleString()}</p>
              {activeAlert.source && <p><strong>Source:</strong> {activeAlert.source}</p>}
            </div>
            <button className="modal-close-btn" onClick={() => setActiveAlert(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
