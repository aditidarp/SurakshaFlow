import "./ForecastControls.css";

export default function ForecastControls() {
  return (
    <div className="forecast-controls">
      <button className="active">IMD Forecast</button>
      <button>Weather</button>

      <select>
        <option>PAN INDIA</option>
        <option>STATE</option>
        <option>DISTRICT</option>
      </select>
    </div>
  );
}
