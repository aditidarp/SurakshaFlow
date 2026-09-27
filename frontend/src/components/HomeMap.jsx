import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import API from "../api";
import io from "socket.io-client";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const HomeMap = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await API.get("/real-alerts/combined");
      const sourceAlerts = Array.isArray(res.data?.alerts) ? res.data.alerts : [];
      setAlerts(sourceAlerts
        .filter((alert) => !['Resolved', 'Cancelled', 'Expired'].includes(alert.status))
        .map((alert) => {
          const point = alert.coordinates?.type === 'Point' ? alert.coordinates.coordinates : null;
          return { ...alert, lat: alert.lat ?? point?.[1], lng: alert.lng ?? point?.[0] };
        })
        .filter((alert) => alert.lat != null && alert.lng != null));
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Update every 30 seconds

    // Socket.io real-time updates
    try {
      const socket = io("http://localhost:5000");
      socket.on("live-alert", (newAlert) => {
        setAlerts((prev) => {
          // Only add alert if it has valid coordinates
          if (newAlert.lat != null && newAlert.lng != null) {
            // Add new alert and keep only active ones, limit to 50
            const updated = [newAlert, ...prev.filter(alert => alert.status === "active")];
            return updated.slice(0, 50);
          }
          return prev;
        });
      });
      return () => {
        socket.disconnect();
        clearInterval(interval);
      };
    } catch (err) {
      console.log("Socket.io not available in development");
      return () => clearInterval(interval);
    }
  }, [fetchAlerts]);

  const getAlertIcon = (type) => {
    const color = getAlertColor(type);
    return L.divIcon({
      html: `<div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">!</div>`,
      className: 'custom-alert-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getAlertColor = (type) => {
    switch (type?.toLowerCase()) {
      case "fire":
        return "#dc2626"; // red
      case "flood":
        return "#2563eb"; // blue
      case "earthquake":
        return "#ea580c"; // orange
      case "landslide":
        return "#7c3aed"; // purple
      case "cyclone":
        return "#059669"; // green
      default:
        return "#6b7280"; // gray
    }
  };

  const getAlertEmoji = (type) => {
    switch (type?.toLowerCase()) {
      case "fire":
        return "🔥";
      case "flood":
        return "💧";
      case "earthquake":
        return "📍";
      case "landslide":
        return "⛰️";
      case "cyclone":
        return "🌪️";
      default:
        return "⚠️";
    }
  };

  if (loading) {
    return (
      <div className="home-map-container">
        <div className="map-loading">
          <p>Loading map and alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-map-container">
      <MapContainer
        center={[20.5937, 78.9629]} // Center of India
        zoom={5}
        style={{ height: "400px", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {alerts.filter(alert => alert.lat != null && alert.lng != null).map((alert) => (
          <Marker
            key={alert.externalAlertId || alert._id || alert.id || `${alert.lat}-${alert.lng}-${alert.title}`}
            position={[alert.lat, alert.lng]}
            icon={getAlertIcon(alert.type)}
          >
            <Popup>
              <div className="alert-popup">
                <h4>{getAlertEmoji(alert.type)} {alert.title}</h4>
                <p><strong>Location:</strong> {alert.district}, {alert.state}</p>
                <p><strong>Severity:</strong> Level {alert.severity}/5</p>
                <p><strong>Description:</strong> {alert.description}</p>
                <p><strong>Status:</strong> <span className="status-active">Active</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-legend">
        <h5>Alert Types:</h5>
        <div className="legend-items">
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#dc2626" }}></span>
            Fire 🔥
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#2563eb" }}></span>
            Flood 💧
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#ea580c" }}></span>
            Earthquake 📍
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#7c3aed" }}></span>
            Landslide ⛰️
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeMap;