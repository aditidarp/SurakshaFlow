import React, { useEffect, useState } from "react";
import "./AlertCards.css";

export default function StreamPanel() {
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const alertsSrc = new EventSource("/api/stream/alerts");
    alertsSrc.addEventListener("alerts", (e) => {
      try {
        const data = JSON.parse(e.data);
        setAlerts(data || []);
      } catch (err) {
        console.error("Invalid alerts SSE payload", err);
      }
    });
    alertsSrc.addEventListener("error", () => console.warn("Alerts SSE error"));

    const weatherSrc = new EventSource("/api/stream/weather");
    weatherSrc.addEventListener("weather", (e) => {
      try {
        const d = JSON.parse(e.data);
        setWeather(d);
      } catch (err) {
        console.error("Invalid weather SSE payload", err);
      }
    });
    weatherSrc.addEventListener("error", () => console.warn("Weather SSE error"));

    setStatus("connected");

    return () => {
      alertsSrc.close();
      weatherSrc.close();
      setStatus("closed");
    };
  }, []);

  return (
    <div className="stream-panel">
      <h4>Live Stream ({status})</h4>

      <div className="weather-stream">
        <h5>Weather</h5>
        {weather ? (
          <div>
            <div>{weather.city}</div>
            <div>Temp: {weather.temp ?? "N/A"} °C</div>
            <div>Hum: {weather.humidity ?? "N/A"}%</div>
            <div>Wind: {weather.wind ?? "N/A"} m/s</div>
          </div>
        ) : (
          <div>No weather yet</div>
        )}
      </div>

      <div className="alerts-stream">
        <h5>Alerts ({alerts.length})</h5>
        {alerts.slice(0, 10).map((a, i) => (
          <div key={a._id || i} className="alert-item">
            <b>{a.alert || a.title}</b>
            <div>{a.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
