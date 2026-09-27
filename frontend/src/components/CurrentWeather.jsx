import { useEffect, useState } from "react";
import API from "../api";

export default function WeatherForecast() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const res = await API.get("/weather/forecasts");
        setForecasts(res.data.forecasts);
        setLoading(false);
      } catch (err) {
        setError("Failed to load forecast data");
        setLoading(false);
      }
    };

    fetchForecasts();
    const interval = setInterval(fetchForecasts, 1800000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (icon) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[icon] || '🌤️';
  };

  if (loading) return <div className="weather-forecast"><p>Loading forecasts...</p></div>;
  if (error) return <div className="weather-forecast"><p>{error}</p></div>;
  if (!forecasts.length) return <div className="weather-forecast"><p>No forecast data available</p></div>;

  return (
    <div className="weather-forecast">
      <h4>🌤️ Weather Forecasts - Major Indian Cities</h4>
      <div className="forecasts-grid">
        {forecasts.map((forecast, index) => (
          <div key={index} className="city-forecast-card">
            <div className="city-name">{forecast.city}</div>
            
            <div className="forecast-section">
              <div className="forecast-label">Today</div>
              <div className="forecast-icon">{getWeatherIcon(forecast.current.icon)}</div>
              <div className="forecast-temp">{forecast.current.temperature}°C</div>
              <div className="forecast-desc">{forecast.current.description}</div>
              <div className="forecast-details">
                <span>💧 {forecast.current.humidity}%</span>
                <span>💨 {forecast.current.windSpeed} m/s</span>
              </div>
            </div>

            {forecast.tomorrow && (
              <div className="forecast-section tomorrow">
                <div className="forecast-label">Tomorrow</div>
                <div className="forecast-icon">{getWeatherIcon(forecast.tomorrow.icon)}</div>
                <div className="forecast-temp">{forecast.tomorrow.temperature}°C</div>
                <div className="forecast-desc">{forecast.tomorrow.description}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
