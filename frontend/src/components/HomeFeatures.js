import React from "react";
import "../components/Home.css";

import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";

const HomeFeatures = () => {
  return (
    <div className="features-wrapper">
      
      {/* ABOUT SECTION */}
      <div className="about-section">
        <h2 className="about-title">About</h2>
        <p className="about-text">
          National Disaster Management Authority under its official government mandate
          Hon'ble Prime Minister of India has envisioned a CAP based Integrated
          Alert System on Pan India basis. The project involves near real-time
          dissemination of early warning through multiple means of technology
          using geo-intelligence.
        </p>
      </div>

      {/* FEATURES SECTION */}
      <div className="features-section">
        <div className="feature-card">
          <img src={img1} alt="Disaster" />

          
          <p>For all natural & man-made disasters</p>
        </div>

        <span className="arrow">➜</span>

        <div className="feature-card">
          <img src={img2} alt="Geo Alerts" />
          <p>Receive alerts in geo-targeted manner</p>
        </div>

        <span className="arrow">➜</span>

        <div className="feature-card">
          <img src={img3} alt="Languages" />
          <p>In multiple languages</p>
        </div>

        <span className="arrow">➜</span>

        <div className="feature-card">
          <img src={img4} alt="Media" />
          <p>Across all media at the same time</p>
        </div>
      </div>

    </div>
  );
};

export default HomeFeatures;
