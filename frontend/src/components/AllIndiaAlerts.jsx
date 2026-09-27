import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "./AllIndiaAlerts.css";
import api from "../api/axios";
import { FaLocationDot, FaBullseye, FaTriangleExclamation, FaCloudRain } from "react-icons/fa6";
import { FaFacebook, FaYoutube, FaArrowUp } from "react-icons/fa";

const AllIndiaAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeMode, setActiveMode] = useState("allIndia");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/real-alerts/combined");
      const processedAlerts = (Array.isArray(res.data?.alerts) ? res.data.alerts : []).map((alert, idx) => {
        const lat = alert.coordinates?.type === 'Point' ? alert.coordinates.coordinates?.[1] : null;
        const lng = alert.coordinates?.type === 'Point' ? alert.coordinates.coordinates?.[0] : null;
        const type = alert.type?.toLowerCase() || "warning";
        
        let color = "yellow";
        if (type.includes("fire") || type.includes("avalanche")) color = "orange";
        if (type.includes("flood") || type.includes("storm")) color = "yellow";
        if (type.includes("earthquake")) color = "red";

        return {
          id: alert._id || idx,
          title: alert.title || alert.type || "Alert",
          description: alert.description || "",
          district: alert.district || "Unknown District",
          state: alert.state || "Unknown State",
          severity: alert.severity || "Informational",
          color,
          lat,
          lng,
          type,
        };
      });
      setAlerts(processedAlerts.filter((alert) => alert.lat != null && alert.lng != null));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Official alert source temporarily unavailable");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (color) => {
    const iconHtml = `
      <div class="alert-map-icon alert-map-icon-${color}">
        <span>⚠</span>
      </div>
    `;
    return new L.DivIcon({
      html: iconHtml,
      className: "custom-alert-div-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="ndma-container">

      {/* 🔵 HEADER */}
      <header className="ndma-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <span className="logo-icon">🛡️</span>
              <div className="header-text">
                <h1>SurakshaFlow</h1>
                <p>Disaster Alert & Rescue Coordination</p>
              </div>
            </div>
          </div>
          <nav className="header-nav">
            <a href="/">HOME</a>
            <a href="/home#/live-dashboard">DASHBOARD</a>
            <a href="/about">ABOUT</a>
            <a href="/dosdont">DO'S & DON'TS</a>
          </nav>
        </div>
      </header>

      {/* ===== ALERT MODE BUTTONS ===== */}
      <div className="alert-modes-section">
        <button className={`mode-btn ${activeMode === "current" ? "active" : ""}`} onClick={() => setActiveMode("current")}>
          <FaLocationDot size={20} /> Current Location CAP Alert
        </button>
        <button className={`mode-btn ${activeMode === "allIndia" ? "active" : ""}`} onClick={() => setActiveMode("allIndia")}>
          <FaBullseye size={20} /> All India CAP Alert
        </button>
        <button className={`mode-btn ${activeMode === "stateWise" ? "active" : ""}`} onClick={() => setActiveMode("stateWise")}>
          <FaTriangleExclamation size={20} /> State Wise CAP Alert
        </button>
        <button className={`mode-btn ${activeMode === "forecast" ? "active" : ""}`} onClick={() => setActiveMode("forecast")}>
          <FaCloudRain size={20} /> Forecast
        </button>
      </div>

      {/* 🗺 MAP + ALERT LIST */}
      <div className="ndma-content">
        <div className="map-container-section">
          {error && <div className="error-banner">{error}</div>}
          {loading && <div className="loading-overlay">Loading alerts...</div>}
          
          <MapContainer center={[22.5, 80]} zoom={5} className="leaflet-map-full" zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            <ZoomControl position="bottomright" />
            <MarkerClusterGroup>
              {alerts.map((alert) => (
                <Marker key={alert.id} position={[alert.lat, alert.lng]} icon={getAlertIcon(alert.color)}>
                  <Popup className="custom-popup">
                    <div className="popup-content">
                      <h4>{alert.title}</h4>
                      <p><strong>Type:</strong> {alert.type}</p>
                      <p><strong>District:</strong> {alert.district}</p>
                      <p><strong>State:</strong> {alert.state}</p>
                      <p><strong>Severity:</strong> {alert.severity}/5</p>
                      {alert.description && <p>{alert.description}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        {/* 📋 ALERT LIST */}
        <div className="alert-sidebar">
          <div className="sidebar-header">
            <h2>ALERT LIST</h2>
            <span className="alert-count">{alerts.length}</span>
          </div>

          <div className="alerts-scroll">
            {alerts.length === 0 ? (
              <div className="no-alerts"><p>No active alerts</p></div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`alert-card alert-card-${alert.color}`}>
                  <div className="card-header">
                    <span className="alert-type-badge" style={{
                      backgroundColor: alert.color === "orange" ? "#ff7a00" : alert.color === "yellow" ? "#facc15" : "#dc2626"
                    }}>
                      {alert.type.toUpperCase()}
                    </span>
                    <span className="severity-badge">Severity: {alert.severity}/5</span>
                  </div>
                  <h3>{alert.title}</h3>
                  <p className="district"><strong>{alert.district}</strong></p>
                  <p className="state">{alert.state}</p>
                  {alert.description && <p className="description">{alert.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== FLOATING ELEMENTS ===== */}
      <div className="floating-socials">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
          <FaFacebook size={20} />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube">
          <FaYoutube size={20} />
        </a>
      </div>

      <button className="scroll-to-top" onClick={scrollToTop} title="Back to top">
        <FaArrowUp size={18} />
      </button>
    </div>
  );
};

export default AllIndiaAlerts;
