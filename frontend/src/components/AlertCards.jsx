import { useNavigate } from "react-router-dom";
import "./Cards.css";

const AlertCards = () => {
  const navigate = useNavigate();

  return (
    <div className="card-container">

      <div
        className="alert-card"
        onClick={() => navigate("/current-location-alerts")}
      >
        CURRENT LOCATION CAP ALERT
      </div>

      <div
        className="alert-card"
        onClick={() => navigate("/all-india-alerts")}
      >
        ALL INDIA CAP ALERT
      </div>

      <div
        className="alert-card"
        onClick={() => navigate("/state-wise-alerts")}
      >
        STATE WISE CAP ALERT
      </div>

      <div
        className="alert-card"
        onClick={() => navigate("/forecast")}
      >
        FORECAST
      </div>

    </div>
  );
};

export default AlertCards;
