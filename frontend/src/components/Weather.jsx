import React, { useEffect, useState } from "react";
import API from "../api";
import "./WeatherPanel.css";

export default function Weather({ lat, lon }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (coords) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (coords?.lat && coords?.lon) {
        res = await API.get(`/weather/check?lat=${coords.lat}&lon=${coords.lon}`);
      } else {
        res = await API.get(`/weather/check?lat=19.0760&lon=72.8777`); // default Mumbai
      }
      setData(res.data);
    } catch (err) {
      setError(err.data?.message || err.message || "Failed to load weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather({ lat, lon });
    const id = setInterval(() => fetchWeather({ lat, lon }), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [lat, lon]);

  if (loading) return <div className="weather-card">Loading weather...</div>;
  if (error) return <div className="weather-card">Error: {error}</div>;
  if (!data) return <div className="weather-card">No weather data</div>;

  return (
    <div className="weather-card">
      <h4>{data.city || "Location"}</h4>
      <p>🌡 {data.temp ?? data.temperature ?? "N/A"} °C</p>
      <p>💧 Humidity: {data.humidity ?? "N/A"}</p>
      <p>🌬 Wind: {data.wind ?? data.windSpeed ?? "N/A"} m/s</p>
      <p>⚠ Alert: {data.alert ?? "Normal"}</p>
    </div>
  );
}
