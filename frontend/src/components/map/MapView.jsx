import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './MapView.css';

// Leaflet default marker fix for Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const typeColor = {
  Earthquake: '#dc2626',
  Flood: '#2563eb',
  Fire: '#f97316',
  Cyclone: '#9333ea',
  Landslide: '#8b5cf6',
  Storm: '#0f766e',
  Volcano: '#d97706',
  Disaster: '#6b7280',
};

const severityBorder = {
  Critical: '#b91c1c',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#10b981',
};

const typeIcon = {
  Earthquake: '🌋',
  Flood: '🌊',
  Fire: '🔥',
  Cyclone: '🌪️',
  Landslide: '⛰️',
  Storm: '⛈️',
  Volcano: '🌋',
  Disaster: '⚠️',
};

const getAlertCoords = (alert) => {
  if (Array.isArray(alert.coordinates) && alert.coordinates.length === 2) {
    return [alert.coordinates[0], alert.coordinates[1]];
  }

  if (alert.geometry?.type === 'Point' && Array.isArray(alert.geometry.coordinates)) {
    return [alert.geometry.coordinates[1], alert.geometry.coordinates[0]];
  }

  if (alert.location?.coords && alert.location.coords.length === 2) {
    return [alert.location.coords[0], alert.location.coords[1]];
  }

  if (alert.location?.latlng && alert.location.latlng.length === 2) {
    return [alert.location.latlng[0], alert.location.latlng[1]];
  }

  return null;
};

const getIcon = (type, severity) => {
  const background = typeColor[type] || typeColor.Disaster;
  const border = severityBorder[severity] || severityBorder.Medium;
  const iconText = typeIcon[type] || '⚠️';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="alert-marker" style="background:${background}; border-color:${border};">${iconText}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -35],
  });
};

const MapView = ({ alerts, operations, locations }) => {
  const defaultCenter = [22.5937, 78.9629];

  return (
    <section className="map-panel">
      <div className="panel-header">
        <h2>Live Map</h2>
        <span>{alerts.length} alerts</span>
      </div>
      <MapContainer center={defaultCenter} zoom={5} scrollWheelZoom={true} className="dashboard-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup chunkedLoading>
          {alerts.map((alert) => {
            const position = getAlertCoords(alert);
            if (!position) return null;

            return (
              <Marker key={`alert-${alert.id || alert.title}-${alert.createdAt}`} position={position} icon={getIcon(alert.type, alert.severity)}>
                <Popup>
                  <strong>{alert.title}</strong><br />
                  {alert.location}<br />
                  Severity: <strong>{alert.severity}</strong><br />
                  Source: <strong>{alert.source}</strong>
                </Popup>
                <Tooltip>{alert.type || 'Disaster'}</Tooltip>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {Object.values(locations).map((team) => {
          if (!team.coords || team.coords.length < 2) return null;
          return (
            <Marker key={`team-${team.teamId}`} position={[team.coords[0], team.coords[1]]}>
              <Popup>
                <strong>{team.teamName || team.teamId}</strong><br />
                {team.status || 'unknown'}<br />
                {new Date(team.timestamp).toLocaleTimeString()}
              </Popup>
              <Tooltip>Rescue Team</Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </section>
  );
};

export default MapView;
