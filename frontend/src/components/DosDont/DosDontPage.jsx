import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dosDontData from "./dosDontData";
import "./DosDontPage.css";

/* 🚨 DISASTER LIST WITH ICONS */
const disasters = [
  { key: "cyclone", label: "🌀 Cyclone" },
  { key: "flood", label: "💧 Flood" },
  { key: "earthquake", label: "📍 Earthquake" },
  { key: "fire", label: "🔥 Fire" },
  { key: "heatwave", label: "🌡️ Heatwave" },
  { key: "tsunami", label: "🌊 Tsunami" },
  { key: "lightning", label: "⚡ Lightning" },
  { key: "coldwave", label: "❄️ Cold Wave" },
  { key: "landslide", label: "⛰️ Landslide" },
  { key: "forestfire", label: "🌳 Forest Fire" }
];

/* 🌐 LANGUAGES */
const languages = [
  { key: "en", label: "English" },
  { key: "hi", label: "हिंदी" },
  { key: "mr", label: "मराठी" },
  { key: "gu", label: "Gujarati" },
  { key: "ta", label: "Tamil" },
  { key: "te", label: "Telugu" }
];

export default function DosDontPage() {
  const [selectedDisaster, setSelectedDisaster] = useState("cyclone");
  const [language, setLanguage] = useState("en");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const content = dosDontData[selectedDisaster]?.[language];

  /* 🔙 Browser back → Home */
  useEffect(() => {
    const handleBack = () => navigate("/");
    window.onpopstate = handleBack;

    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

  return (
    <div className="dos-page">

      {/* 🔷 HEADER */}
      <div className="dos-header">
        <h1>Dos & Don’ts</h1>
        <p>Disaster Safety Guidelines</p>

        {/* 🔙 BACK BUTTON */}
        <button className="back-btn" onClick={() => navigate("/home")}>
          ⬅ Back to Home
        </button>
      </div>

      {/* � MAIN CONTAINER */}
      <div className="dos-container">

        {/* 🔍 SEARCH SECTION */}
        <div className="search-section">
          <div className="search-wrapper">
            <input
              className="search-box"
              placeholder="🔍 Search safety tips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 🚨 DISASTER SECTION */}
        <div className="disaster-section">
          <h2>Select Disaster Type</h2>
          <div className="disaster-tabs">
            {disasters.map((d) => (
              <button
                key={d.key}
                className={`disaster-btn ${selectedDisaster === d.key ? "active" : ""}`}
                onClick={() => setSelectedDisaster(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 🌐 LANGUAGE SECTION */}
        <div className="language-section">
          <h2>Select Language</h2>
          <div className="language-tabs">
            {languages.map((l) => (
              <button
                key={l.key}
                className={`lang-btn ${language === l.key ? "active" : ""}`}
                onClick={() => setLanguage(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ CONTENT SECTION */}
        {content ? (
          <div className="safety-content">

            {/* 📋 BEFORE/DURING/AFTER CARDS */}
            <div className="safety-cards-grid">
              <SafetyCard 
                title="Before" 
                icon="📋"
                color="before"
                items={content.before} 
                search={search} 
              />
              <SafetyCard 
                title="During" 
                icon="⚠️"
                color="during"
                items={content.during} 
                search={search} 
              />
              <SafetyCard 
                title="After" 
                icon="✅"
                color="after"
                items={content.after} 
                search={search} 
              />
            </div>

            {/* 🎥 VIDEOS SECTION */}
            {content.videos?.length > 0 && (
              <div className="videos-section">
                <h2>📹 Educational Videos</h2>
                <div className="videos-grid">
                  {content.videos.map((v, i) => (
                    <div key={i} className="video-card">
                      <iframe
                        src={v}
                        title={`Safety video ${i + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="no-data">
            <p>No data available for this disaster type and language combination</p>
          </div>
        )}

      </div>
    </div>
  );
}

/* 🟦 SAFETY CARD COMPONENT */
function SafetyCard({ title, icon, color, items = [], search }) {
  const filtered = items.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`safety-card ${color}`}>
      <div className="card-header">
        <h3>{icon} {title}</h3>
      </div>
      <div className="card-body">
        {filtered.length > 0 ? (
          <ul className="tips-list">
            {filtered.map((item, idx) => (
              <li key={idx} className="tip-item">
                <span className="tip-icon">✓</span>
                <span className="tip-text">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-tips">No matching tips found</p>
        )}
      </div>
    </div>
  );
}
