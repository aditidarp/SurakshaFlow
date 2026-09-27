import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";

// Fix default icon paths for webpack builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function MapSection({ alerts = [] }) {
  const markers = (Array.isArray(alerts) ? alerts : []).filter(a => a && (a.lat || a.latitude));

  return (
    <div className="map-wrapper">
      <div className="map-left">
        <h3>State Wise Media Count</h3>

        <MapContainer center={[22.59, 78.96]} zoom={5} className="india-map" style={{ height: 420 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {markers.map((a, i) => {
            const lat = a.lat ?? a.latitude;
            const lng = a.lng ?? a.longitude ?? a.lon;
            if (!lat || !lng) return null;
            return (
              <Marker key={a._id || i} position={[lat, lng]}>
                <Popup>
                  <b>{a.alert || a.title}</b>
                  <div>{a.description}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="map-right">
        <h3>State Wise Dissemination Statistics</h3>

        <div className="state-card">
          <h4>Delhi</h4>
          <p>SMS: <b>108.4 Cr</b></p>
          <p>Mobile App: <b>1.8 Cr</b></p>
          <p>Web Browser: <b>676</b></p>
        </div>

        <div className="state-card">
          <h4>Kerala</h4>
          <p>SMS: <b>563.7 Cr</b></p>
          <p>Mobile App: <b>52.2 L</b></p>
          <p>Web Browser: <b>11.1 K</b></p>
        </div>

        <div className="state-card">
          <h4>Rajasthan</h4>
          <p>SMS: <b>1 K Cr</b></p>
          <p>Mobile App: <b>11.5 Cr</b></p>
          <p>Web Browser: <b>2.8 L</b></p>
        </div>
      </div>
    </div>
  );
}
