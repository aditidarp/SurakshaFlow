import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AlertCards.css";

export default function DashboardAlertCards() {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    totalSMS: 0,
    mobileUsers: 0,
    browserUsers: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard-stats"
      );
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard Stats Error", err);
    }
  };

  return (
    <div className="alert-cards">

      <div className="card">
        <h4>Total Alerts</h4>
        <h2>{stats.totalAlerts}</h2>
      </div>

      <div className="card">
        <h4>Total SMS Disseminated</h4>
        <h2>{stats.totalSMS}</h2>
      </div>

      <div className="card">
        <h4>Mobile App Users</h4>
        <h2>{stats.mobileUsers}</h2>
      </div>

      <div className="card">
        <h4>Browser Subscribers</h4>
        <h2>{stats.browserUsers}</h2>
      </div>

    </div>
  );
}
