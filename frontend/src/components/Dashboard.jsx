import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import api from "../api/axios";
import io from "socket.io-client";
import RightInfoPanel from "./RightInfoPanel";
import "./Dashboard.css";
import {
  FaLocationDot,
  FaBullseye,
  FaTriangleExclamation,
  FaCloudRain,
  FaArrowUp,
  FaFacebook,
  FaYoutube,
  FaHelicopter,
  FaMessage,
} from "react-icons/fa6";

const Dashboard = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all");
  const [filterValue, setFilterValue] = useState("");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/real-alerts/combined");
      const incomingAlerts = Array.isArray(res.data) ? res.data : (res.data.alerts || []);
      if (Array.isArray(incomingAlerts)) {
        setAlerts(incomingAlerts);
        setError(null);
      }
    } catch (err) {
      console.error("API Error:", err);
    setError("Official alert source temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    
    // Socket.io real-time updates
    try {
      const socket = io("http://localhost:5000");
      socket.on("live-alert", (newAlert) => {
        setAlerts((prev) => {
          const alertId = newAlert.externalAlertId || newAlert._id || newAlert.id;
          const withoutExisting = prev.filter((alert) => (alert.externalAlertId || alert._id || alert.id) !== alertId);
          return [newAlert, ...withoutExisting].slice(0, 100);
        });
      });
      const interval = setInterval(fetchAlerts, 30000);
      return () => {
        clearInterval(interval);
        socket.disconnect();
      };
    } catch (err) {
      console.log("Socket.io not available in development");
    }
    
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const getDemoAlerts = () => [
    {
      id: 1,
      type: "fire",
      title: "LEVEL 5 - SEVERE WILDFIRE INCIDENT",
      description: "Rapidly spreading wildfire detected via satellite thermal imaging. Immediate evacuation of sectors A and B advised. Aerial suppression en route.",
      severity: 5,
      lat: 31.7046,
      lng: 77.1734,
      state: "Himachal Pradesh",
      district: "Shimla",
      location: { coordinates: [77.1734, 31.7046] },
    },
    {
      id: 2,
      type: "flood",
      title: "LEVEL 4 - FLASH FLOOD WARNING",
      description: "Brahmaputra river water levels exceeding danger mark by 1.2m. Low-lying riverine areas in Kamrup district are at imminent risk.",
      severity: 4,
      lat: 26.1445,
      lng: 91.7362,
      state: "Assam",
      district: "Kamrup",
      location: { coordinates: [91.7362, 26.1445] },
    },
    {
      id: 3,
      type: "earthquake",
      title: "LEVEL 3 - SEISMIC EVENT DETECTED",
      description: "Tectonic activity measuring 5.2 on Richter scale recorded. Epicenter located 12km N of Uttarkashi. Expect aftershocks.",
      severity: 3,
      lat: 30.7278,
      lng: 78.9355,
      state: "Uttarakhand",
      district: "Uttarkashi",
      location: { coordinates: [78.9355, 30.7278] },
    },
    {
      id: 4,
      type: "landslide",
      title: "LEVEL 3 - HIGH LANDSLIDE PROBABILITY",
      description: "Geological sensors indicate severe soil destabilization due to prolonged precipitation. Nilgiri Mountain Railway suspended.",
      severity: 3,
      lat: 11.4268,
      lng: 76.7066,
      state: "Tamil Nadu",
      district: "Nilgiris",
      location: { coordinates: [76.7066, 11.4268] },
    },
  ];

  const getAlertColor = (type) => {
    switch (type?.toLowerCase()) {
      case "pre-fire":
      case "fire":
        return "#ea580c"; /* orange */
      case "flood":
        return "#facc15";
      case "earthquake":
        return "#dc2626";
      case "landslide":
        return "#8b5cf6";
      case "avalanche":
        return "#f59e0b"; /* yellow/orange */
      default:
        return "#0056b3";
    }
  };

  const getAlertIcon = (type) => {
    const color = getAlertColor(type);
    const iconSize = 36;
    // Use simple glyphs for clarity: flame for fire, warning for avalanche
    const glyph = (type || "").toLowerCase().includes("fire") ? "🔥" :
                  (type || "").toLowerCase().includes("avalanche") ? "⚠️" : "!";

    const html = `
      <div style="
        width: ${iconSize}px;
        height: ${iconSize}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        font-weight: 700;
        box-shadow: 0 4px 8px rgba(0,0,0,0.28);
        cursor: pointer;
      ">
        ${glyph}
      </div>
    `;
    return L.divIcon({
      html,
      iconSize: [iconSize, iconSize],
      popupAnchor: [0, -iconSize / 2],
    });
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    setFilterValue("");
  };

  const getFilteredAlerts = () => {
    switch (filterMode) {
      case "state":
        return filterValue 
          ? alerts.filter((a) => a.state?.toLowerCase().includes(filterValue.toLowerCase()))
          : alerts;
      case "type":
        return filterValue
          ? alerts.filter((a) => a.type?.toLowerCase().includes(filterValue.toLowerCase()))
          : alerts;
      default:
        return alerts;
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const mapAlerts = alerts.filter((a) => a.lat && a.lng);
  const mapRef = useRef(null);
  const cardRefs = useRef({});

  const handleMarkerClick = (alert) => {
    setSelectedAlert(alert);
    const el = cardRefs.current[alert.id];
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCardClick = (alert) => {
    if (selectedAlert?.id === alert.id) {
      setSelectedAlert(null); // allow toggling off
    } else {
      setSelectedAlert(alert);
      if (mapRef.current && alert.lat && alert.lng) {
        try {
          mapRef.current.setView([alert.lat, alert.lng], 8, { animate: true });
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const handleDispatchRescue = async (alert) => {
    const instructions = window.prompt("Enter rescue instructions for the team (e.g. Deploy swift-water rescue boats to Sector 4):");
    if (!instructions) return; // User cancelled
    
    try {
      // In a real app we'd POST to an endpoint that populates RescueDashboard.
      // E.g., await api.post("/alerts", payload);
      window.alert(`✅ Operations Command dispatched to ${alert.district} with instructions: "${instructions}"`);
      navigate('/rescue-dashboard');
    } catch (err) {
      console.error(err);
      window.alert("❌ Failed to dispatch rescue team. Please check network.");
    }
  };

  const handleSendSMS = (alert) => {
    navigate("/admin/sms-alert", { 
      state: { 
        prefillLocation: alert.district || "",
        prefillState: alert.state || "",
        prefillType: alert.type || "flood",
        prefillSeverity: alert.severity > 3 ? "High" : "Medium"
      } 
    });
  };

  // Load India state boundaries
  const [statesBoundaries, setStatesBoundaries] = useState(null);
  
  useEffect(() => {
    // Fetch from a public GeoJSON source (India states)
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        // Filter to get India only
        const india = data.features.find((f) => f.properties.ADMIN === "India");
        if (india) setStatesBoundaries(india);
      })
      .catch(() => {
        // If main source fails, try alternative lightweight approach
        console.log("State boundaries not loaded (optional)");
      });
  }, []);

  const stateGeoJSONStyle = {
    color: "#3B82F6",
    weight: 1.5,
    opacity: 0.6,
    fillOpacity: 0.05,
    dashArray: "3, 6",
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content header-row">
          <div className="brand">
            <div className="brand-title">
              <span className="devanagari">सचेत</span>
              <span className="english">NATIONAL DISASTER ALERT PORTAL</span>
            </div>
            <div className="brand-sub">Real-time Disaster & Emergency Alerts for India</div>
          </div>

          <nav className="top-nav">
            <button className="nav-item" onClick={() => navigate("/")}><FaLocationDot /> HOME</button>
            <button className="nav-item active" onClick={() => navigate("/dashboard")}><FaBullseye /> DASHBOARD</button>
            <button className="nav-item" onClick={() => navigate("/rescue-dashboard")}><FaHelicopter /> RESCUE OPS</button>
            <button className="nav-item" onClick={() => navigate("/admin/sms-alert")}><FaMessage /> SMS BROADCAST</button>
          </nav>
        </div>
      </div>

      {/* Mode Selection Buttons */}
      <div className="mode-buttons-section">
        <button
          className={`mode-btn ${filterMode === "current" ? "active" : ""}`}
          onClick={() => handleFilterChange("current")}
        >
          <FaLocationDot />
          CURRENT LOCATION CAP ALERT
        </button>
        <button
          className={`mode-btn ${filterMode === "all" ? "active" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          <FaBullseye />
          ALL INDIA CAP ALERT
        </button>
        <button
          className={`mode-btn ${filterMode === "state" ? "active" : ""}`}
          onClick={() => handleFilterChange("state")}
        >
          <FaTriangleExclamation />
          STATE WISE CAP ALERT
        </button>
        <button className={`mode-btn ${filterMode === "forecast" ? "active" : ""}`} onClick={() => handleFilterChange("forecast")}>
          <FaCloudRain />
          FORECAST
        </button>
      </div>

      {/* Filter Input */}
      {(filterMode === "state" || filterMode === "type") && (
        <div className="filter-section">
          <input
            type="text"
            placeholder={`Search by ${filterMode}...`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="filter-input"
          />
          <span className="filter-info">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </span>
        </div>
      )}

      {/* Main Content Area - 3 Column Layout */}
      <div className="dashboard-content">
        {/* Left: Map Section */}
        <div className="map-section">
          {error && (
            <div className="error-banner">
              <strong>⚠️ Data Error:</strong> {error}
            </div>
          )}
          
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading alerts...</p>
            </div>
          )}

          <div className="map-container">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                maxZoom={19}
              />
              
              {/* State Boundaries */}
              {statesBoundaries && (
                <GeoJSON data={statesBoundaries} style={stateGeoJSONStyle} />
              )}
              
              <MarkerClusterGroup maxClusterRadius={80}>
                {mapAlerts.map((alert) => (
                  <Marker
                    key={alert.id}
                    position={[alert.lat, alert.lng]}
                    icon={getAlertIcon(alert.type)}
                    eventHandlers={{ click: () => handleMarkerClick(alert) }}
                  >
                    <Popup>
                      <div className="popup-content">
                        <strong>{alert.title}</strong>
                        <p>{alert.description}</p>
                        <small>
                          {alert.district}, {alert.state}
                        </small>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>

          {/* Floating Buttons */}
          <div className="floating-buttons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn facebook"
              title="Follow on Facebook"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn youtube"
              title="Subscribe on YouTube"
            >
              <FaYoutube size={20} />
            </a>
          </div>

          {/* Scroll to Top Button */}
          <button
            className="scroll-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Scroll to top"
          >
            <FaArrowUp size={16} />
          </button>
        </div>

        {/* Center: Alert List */}
        <div className="alert-list-section">
            <div className="list-header">
            <h3>ALERT LIST ({filteredAlerts.length})</h3>
            <span className="auto-refresh">⟳ Auto-refresh: 30s</span>
          </div>

          <div className="alerts-container">
              {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  ref={(el) => (cardRefs.current[alert.id] = el)}
                  key={alert.id}
                  className={`alert-card alert-${alert.type}`}
                  style={{
                    borderLeftColor: getAlertColor(alert.type),
                    opacity: selectedAlert?.id === alert.id ? 1 : 0.85,
                    transform: selectedAlert?.id === alert.id ? "scale(1.02)" : "scale(1)",
                  }}
                  onClick={() => handleCardClick(alert)}
                >
                  <div className="card-header">
                    <div className="alert-type-badge" style={{ background: getAlertColor(alert.type) }}>
                      {alert.severity}
                    </div>
                    <h4>{alert.title}</h4>
                  </div>
                  <p className="card-description">{alert.description}</p>
                  <div className="card-footer">
                    <span className="location">
                      📍 {alert.district}, {alert.state}
                    </span>
                    <span className="severity-label" style={{ fontWeight: 'bold', color: 'var(--alert-red)'}}>
                      Severity: {alert.severity}/5
                    </span>
                  </div>

                  {/* Rescue & SMS Action Panel */}
                  {selectedAlert?.id === alert.id && (
                    <div className="alert-actions-panel" style={{ marginTop: '14px', display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                      <button 
                        className="btn-dispatch"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDispatchRescue(alert);
                        }}
                        style={{ flex: 1, padding: '10px 8px', background: 'var(--alert-info)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                      >
                        <FaHelicopter size={14} /> DISPATCH RESCUE
                      </button>
                      <button 
                        className="btn-sms"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendSMS(alert);
                        }}
                        style={{ flex: 1, padding: '10px 8px', background: 'var(--alert-orange)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                      >
                       <FaMessage size={14} /> AREA SMS
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-alerts">
                <p>No alerts match your filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Panels */}
        <RightInfoPanel />
      </div>

      {/* Statistics Section */}
      <div className="statistics-section">
        <h2>Disaster Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{alerts.length}</div>
            <div className="stat-label">Total Active Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {alerts.filter((a) => a.type === "fire").length}
            </div>
            <div className="stat-label">Fire Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {alerts.filter((a) => a.type === "flood").length}
            </div>
            <div className="stat-label">Flood Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {alerts.filter((a) => a.type === "earthquake").length}
            </div>
            <div className="stat-label">Earthquake Alerts</div>
          </div>
        </div>
      </div>
      
      {/* State-wise Media Count & Dissemination */}
      <div className="state-media-section">
        <h2>State Wise Media Count & Dissemination</h2>
        <div className="state-cards">
          {[
            { state: "Maharashtra", sms: 1200, app: 850, web: 430 },
            { state: "Uttar Pradesh", sms: 980, app: 620, web: 310 },
            { state: "Assam", sms: 450, app: 300, web: 120 },
            { state: "Tamil Nadu", sms: 780, app: 520, web: 240 },
          ].map((s) => (
            <div className="state-card" key={s.state}>
              <h4>{s.state}</h4>
              <div className="media-row"><span>SMS</span><strong>{s.sms}</strong></div>
              <div className="media-row"><span>Mobile App</span><strong>{s.app}</strong></div>
              <div className="media-row"><span>Web</span><strong>{s.web}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

