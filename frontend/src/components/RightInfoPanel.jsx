import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "./RightInfoPanel.css";
import { FaCloudSun, FaCircleExclamation, FaWaveSquare, FaClock } from "react-icons/fa6";

const RightInfoPanel = () => {
  const [weather, setWeather] = useState(null);
  const [earthquakes, setEarthquakes] = useState([]);
  const [cityInput, setCityInput] = useState("Delhi");
  const [alerts, setAlerts] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchWeather("Delhi");
    fetchEarthquakes();
    fetchAlertCount();
    
    // Update clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = async (city) => {
    try {
      const res = await api.get(`/weather?city=${city}`);
      setWeather(res.data);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setWeather({ city, temperature: 28, description: "Unable to load weather" });
    }
  };

  const fetchEarthquakes = async () => {
    try {
      const res = await api.get("/earthquakes/recent?limit=5");
      setEarthquakes(res.data);
    } catch (err) {
      console.error("Earthquake fetch error:", err);
    }
  };

  const fetchAlertCount = async () => {
    try {
      const res = await api.get("/alerts");
      setAlerts(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error("Alert count error:", err);
    }
  };

  const handleWeatherSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput);
    }
  };

  // Demo hourly/daily fallback
  const getDemoHourly = () => [
    { time: 'Now', icon: '☀️', temp: (weather?.temperature ?? 28) },
    { time: '1h', icon: '🌤️', temp: (weather?.temperature ?? 28) - 1 },
    { time: '2h', icon: '🌥️', temp: (weather?.temperature ?? 28) - 2 },
    { time: '3h', icon: '🌧️', temp: (weather?.temperature ?? 28) - 3 },
    { time: '4h', icon: '🌦️', temp: (weather?.temperature ?? 28) - 2 },
    { time: '5h', icon: '🌤️', temp: (weather?.temperature ?? 28) - 1 },
  ];

  const getDemoDaily = () => [
    { day: 'Today', condition: weather?.description ?? 'Clear', high: (weather?.temperature ?? 28) + 2, low: (weather?.temperature ?? 28) - 3 },
    { day: 'Tomorrow', condition: 'Cloudy', high: (weather?.temperature ?? 28) + 1, low: (weather?.temperature ?? 28) - 2 },
    { day: 'Day+2', condition: 'Rain', high: (weather?.temperature ?? 28), low: (weather?.temperature ?? 28) - 4 },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", { 
      weekday: "short", 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };

  return (
    <div className="right-info-panel">
      {/* Weather Panel */}
      <div className="info-box weather-box">
        <div className="box-header">
          <FaCloudSun size={18} />
          <h3>Weather Overview</h3>
        </div>
        
        <form onSubmit={handleWeatherSearch} className="weather-search">
          <input
            type="text"
            placeholder="Search city..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {weather ? (
          <div className="weather-content">
            <div className="weather-main">
              <h4>{weather.city}</h4>
              <p className="temp">{weather.temperature}°C</p>
              <p className="condition">{weather.description}</p>
            </div>
            <div className="weather-details">
              <div className="detail">
                <span>Humidity</span>
                <strong>{weather.humidity ?? "--"}%</strong>
              </div>
              <div className="detail">
                <span>Wind</span>
                <strong>{weather.windSpeed ?? "--"} m/s</strong>
              </div>
              <div className="detail">
                <span>Pressure</span>
                <strong>{weather.pressure ?? "--"} hPa</strong>
              </div>
            </div>

            {/* Hourly Forecast (compact) */}
            <div className="hourly-forecast">
              {(weather.hourly || getDemoHourly()).slice(0,6).map((h, idx) => (
                <div className="hour-card" key={idx}>
                  <div className="hour-time">{h.time}</div>
                  <div className="hour-icon">{h.icon}</div>
                  <div className="hour-temp">{h.temp}°</div>
                </div>
              ))}
            </div>

            {/* Daily Forecast (today summary) */}
            <div className="daily-forecast">
              {(weather.daily || getDemoDaily()).slice(0,3).map((d, idx) => (
                <div className="day-card" key={idx}>
                  <div className="day-name">{d.day}</div>
                  <div className="day-cond">{d.condition}</div>
                  <div className="day-temp">{d.high}° / {d.low}°</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="loading">Loading weather...</p>
        )}
      </div>

      {/* Earthquakes Panel */}
      <div className="info-box earthquake-box">
        <div className="box-header">
          <FaCircleExclamation size={18} />
          <h3>Recent Earthquakes</h3>
        </div>
        
        <div className="earthquakes-list">
          {earthquakes.length > 0 ? (
            earthquakes.map((eq) => (
              <div key={eq.id} className="earthquake-item">
                <div className="eq-magnitude" style={{
                  background: eq.magnitude > 4.5 ? "#dc2626" : 
                             eq.magnitude > 4 ? "#ea580c" : "#facc15"
                }}>
                  {eq.magnitude}
                </div>
                <div className="eq-info">
                  <p className="location">{eq.location}</p>
                  <p className="time">
                    {new Date(eq.timestamp).toLocaleString("en-IN")}
                  </p>
                  <p className="depth">Depth: {eq.depth} km</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No recent earthquakes</p>
          )}
        </div>
      </div>

      {/* Live Status Panel */}
      <div className="info-box status-box">
        <div className="box-header">
          <FaWaveSquare size={18} />
          <h3>Status</h3>
        </div>
        
        <div className="status-content">
          <div className="status-item">
            <span className="status-label">Connection</span>
            <span className="status-value connected">
              ● Connected
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Active Alerts</span>
            <span className="status-value alert-count">{alerts}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Last Updated</span>
            <span className="status-value">Just now</span>
          </div>
        </div>
      </div>

      {/* Clock Panel */}
      <div className="info-box clock-box">
        <div className="box-header">
          <FaClock size={18} />
          <h3>Current Time (IST)</h3>
        </div>
        
        <div className="clock-content">
          <div className="digital-clock">
            {formatTime(currentTime)}
          </div>
          <div className="date-display">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightInfoPanel;
