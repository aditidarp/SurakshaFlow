import { useEffect, useState } from "react";
import "./WeatherPanel.css";

export default function WeatherPanel() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(time);
    };

    updateTime(); // initial load
    const interval = setInterval(updateTime, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="weather-panel">
      <h4>Current Time</h4>
      <h2>{currentTime}</h2>
    </div>
  );
}
