import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./ForecastMap.css"; // yellow list & card styling

// Sample data
const forecastData = [
  { location: "NILGIRIS, Tamil Nadu", forecast: "Ground Frost", lat: 11.4, lng: 76.7 },
  { location: "DINDIGUL, Tamil Nadu", forecast: "Ground Frost", lat: 10.35, lng: 77.98 },
];

const ForecastMap = () => {
  return (
    <div className="forecast-container">
      <div className="map-section">
        <MapContainer center={[20, 78]} zoom={5} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {forecastData.map((item, idx) => (
            <Marker key={idx} position={[item.lat, item.lng]}>
              <Popup>
                <b>{item.forecast}</b> <br /> {item.location}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="forecast-list">
        <h3>Weather Forecast</h3>
        {forecastData.map((item, idx) => (
          <div key={idx} className="forecast-card">
            <b>{item.forecast}</b>
            <br />
            {item.location}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastMap;
