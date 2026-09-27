import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import WeatherForecast from "./CurrentWeather";
import Chatbot from "./Chatbot";
import HomeMap from "./HomeMap";
import RealTimeAlerts from "./RealTimeAlerts";
import SachetTicker from "./SachetTicker";
import VoiceAssistant from "./VoiceAssistant";
import "./Home.css";
import API from "../api";
import api from "../api/axios";

const alertCategories = [
  { name: "Flood", icon: "FL", tone: "blue" },
  { name: "Cyclone", icon: "CY", tone: "teal" },
  { name: "Earthquake", icon: "EQ", tone: "red" },
  { name: "Landslide", icon: "LS", tone: "amber" },
  { name: "Thunderstorm", icon: "TS", tone: "violet" },
  { name: "Heavy Rain", icon: "HR", tone: "slate" },
  { name: "Heat Wave", icon: "HW", tone: "orange" },
  { name: "Forest Fire", icon: "FF", tone: "crimson" },
];

const emergencyContacts = [
  { label: "Emergency", number: "112" },
  { label: "Ambulance", number: "108" },
  { label: "Fire", number: "101" },
  { label: "Police", number: "100" },
  { label: "Disaster management", number: "1078" },
];

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    states: 0,
    coverage: 0
  });

  // Emergency button states
  const [emergencyLoading, setEmergencyLoading] = useState(null);
  const [emergencySuccess, setEmergencySuccess] = useState(null);
  const [emergencyError, setEmergencyError] = useState(null);

  // Emergency services for quick access
  const emergencyServices = [
    {
      id: "police",
      name: "Police",
      emoji: "🚓",
      number: "100",
      message: "Police Emergency Assistance Required",
    },
    {
      id: "ambulance",
      name: "Ambulance",
      emoji: "🚑",
      number: "102",
      message: "Medical Emergency - Ambulance Required",
    },
    {
      id: "fire",
      name: "Fire",
      emoji: "🚒",
      number: "101",
      message: "Fire Emergency - Fire Rescue Required",
    },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/real-alerts/combined");
        const alerts = Array.isArray(res.data?.alerts) ? res.data.alerts : [];
        const activeAlerts = alerts.filter((alert) => !['Resolved', 'Cancelled', 'Expired'].includes(alert.status));
        setStats({
          totalAlerts: alerts.length,
          activeAlerts: activeAlerts.length,
          states: new Set(activeAlerts.map(a => a.state || a.areaDescription || a.location)).size,
          coverage: 28 // India has 28 states
        });
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchStats();
  }, []);

  // Handle emergency button click
  const handleEmergencyClick = async (service) => {
    setEmergencyLoading(service.id);
    setEmergencyError(null);
    setEmergencySuccess(null);

    try {
      // Get user's current location
      if (!navigator.geolocation) {
        setEmergencyError("Geolocation not supported. Please enable location.");
        setEmergencyLoading(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Call unified backend direct emergency endpoint
            const emergencyResponse = await api.post("/api/sos/direct-call", {
              serviceType: service.name.toLowerCase(),
              name: "Emergency User",
              phone: service.number,
              message: `${service.message}\n\nLocation: ${latitude}, ${longitude}`,
              lat: latitude,
              lon: longitude,
            });

            if (emergencyResponse.data && emergencyResponse.data.success) {
              // Backend confirmed - now open direct call
              setTimeout(() => {
                window.location.href = `tel:${emergencyResponse.data.emergencyNumber}`;
              }, 500);

              setEmergencySuccess({
                title: `${service.emoji} ${service.name} Alert Sent!`,
                message: `Emergency services have been notified. Emergency call initiating to ${emergencyResponse.data.emergencyNumber}. Rescue teams are being dispatched to your location.`,
                number: emergencyResponse.data.emergencyNumber,
              });
            } else {
              throw new Error('Backend confirmation failed');
            }
          } catch (apiError) {
            console.error("Emergency Call Error:", apiError);
            // Fallback: still open dialer even if backend has issues
            setTimeout(() => {
              window.location.href = `tel:${service.number}`;
            }, 300);
            
            setEmergencySuccess({
              title: `${service.emoji} Emergency Dialer Opening!`,
              message: `Opening direct call to ${service.number}. Rescue teams are being notified.`,
              number: service.number,
            });
          } finally {
            setEmergencyLoading(null);
          }
        },
        (geoError) => {
          setEmergencyError("Unable to get location. Please enable location services.");
          console.error("Geolocation Error:", geoError);
          setEmergencyLoading(null);
        }
      );
    } catch (err) {
      setEmergencyError("An error occurred. Please try again.");
      setEmergencyLoading(null);
    }
  };

  // Close emergency success modal
  const handleCloseEmergencySuccess = () => {
    setEmergencySuccess(null);
  };

  return (
    <>
      <Header />
      <SachetTicker />

      <section className="status-strip" aria-label="Current emergency status">
        <div className="status-strip-label"><span className="status-dot" /> Official alert monitor</div>
        <div><strong>{stats.activeAlerts}</strong><span>active alerts</span></div>
        <div><strong>{stats.totalAlerts}</strong><span>tracked records</span></div>
        <div><strong>{stats.states}</strong><span>affected areas</span></div>
        <div className="status-strip-source">Source: IMD CAP / SACHET when authorized</div>
      </section>

      {/* 🚨 FLOATING EMERGENCY BUTTON */}
      <div className="floating-emergency-container">
        <div className="floating-emergency-button">
          <button
            className="emergency-pulse-btn"
            onClick={() => navigate("/emergency")}
            title="Emergency Services"
          >
            🚨
          </button>
          <div className="emergency-quick-buttons">
            {emergencyServices.map((service) => (
              <button
                key={service.id}
                className="quick-emergency-btn"
                onClick={() => handleEmergencyClick(service)}
                disabled={emergencyLoading !== null}
                title={`${service.name} - ${service.number}`}
              >
                {emergencyLoading === service.id ? "⏳" : service.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 🎯 HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-kicker">NATIONAL PUBLIC-SAFETY INFORMATION PLATFORM</p>
          <h1>SurakshaFlow</h1>
          <h2 className="hero-system-name">Disaster Alert & Rescue Coordination System</h2>
          <p>Find current official alerts, understand the risk, and reach emergency services quickly.</p>
          <Link 
            to="/live-dashboard"
            className="cta-button"
          >
            View live alerts <span aria-hidden="true">-&gt;</span>
          </Link>
          <button className="hero-secondary-button" onClick={() => navigate("/dos-donts")}>Emergency information</button>
        </div>
        <div className="hero-overlay"></div>
      </section>

      <section className="category-section" aria-labelledby="category-heading">
        <div className="section-heading-row">
          <div><p className="section-kicker">SCAN BY HAZARD</p><h2 id="category-heading">Disaster categories</h2></div>
          <button className="text-link" onClick={() => navigate('/live-dashboard')}>See all alerts -&gt;</button>
        </div>
        <div className="category-grid">
          {alertCategories.map((category) => (
            <button key={category.name} className={`category-card ${category.tone}`} onClick={() => navigate(`/live-dashboard?type=${encodeURIComponent(category.name)}`)}>
              <span className="category-icon" aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
              <small>View official alerts</small>
            </button>
          ))}
        </div>
      </section>

      {/* 📊 STATISTICS SECTION */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-number">{stats.totalAlerts}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-number">{stats.activeAlerts}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🗺️</div>
            <div className="stat-number">{stats.states}</div>
            <div className="stat-label">States Covered</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{stats.coverage}</div>
            <div className="stat-label">Total States</div>
          </div>
        </div>
      </section>

      {/* �️ WEATHER & AI ASSISTANT SECTION */}
      <section className="weather-chat-section">
        <h2>Weather Forecasts & AI Assistant</h2>
        <div className="weather-chat-grid">
          <div className="weather-panel">
            <WeatherForecast />
          </div>
          <div className="chatbot-panel">
            <Chatbot />
          </div>
          <div className="chatbot-panel">
            <VoiceAssistant mode="embedded" />
          </div>
        </div>
      </section>
      {/* 🗺️ MAP & ALERTS SECTION */}
      <section className="map-alerts-section">
        <h2>Live Alerts Map & Real-Time Updates</h2>
        <div className="map-alerts-grid">
          <div className="map-panel">
            <HomeMap />
          </div>
          <div className="alerts-panel">
            <RealTimeAlerts />
          </div>
        </div>
      </section>
      {/* �🎨 QUICK ACCESS SECTION */}
      <section className="quick-access-section">
        <h2>Quick Access</h2>
        <div className="quick-cards-grid">
          <div 
            className="quick-card emergency"
          >
            <div className="card-icon">🚨</div>
            <h3>Emergency Alert</h3>
            <p>Quick emergency calls</p>
            <div className="emergency-quick-actions">
              {emergencyServices.slice(0, 3).map((service) => (
                <button
                  key={service.id}
                  className="emergency-action-btn"
                  onClick={() => handleEmergencyClick(service)}
                  disabled={emergencyLoading !== null}
                  title={`${service.name} - ${service.number}`}
                >
                  {emergencyLoading === service.id ? "⏳" : service.emoji}
                </button>
              ))}
            </div>
          </div>

          <div 
            className="quick-card current-location"
            onClick={() => navigate("/current-location-alerts")}
          >
            <div className="card-icon">📍</div>
            <h3>Current Location</h3>
            <p>Alerts near you</p>
          </div>

          <div 
            className="quick-card all-india"
            onClick={() => navigate("/all-india-alerts")}
          >
            <div className="card-icon">🇮🇳</div>
            <h3>All India Alerts</h3>
            <p>National coverage</p>
          </div>

          <div 
            className="quick-card state-wise"
            onClick={() => navigate("/state-wise-alerts")}
          >
            <div className="card-icon">🗺️</div>
            <h3>State Alerts</h3>
            <p>Locate by state</p>
          </div>

          <div 
            className="quick-card forecast"
            onClick={() => navigate("/forecast")}
          >
            <div className="card-icon">⛈️</div>
            <h3>Weather Forecast</h3>
            <p>7-day outlook</p>
          </div>

          <div 
            className="quick-card dashboard"
            onClick={() => navigate("/dashboard")}
          >
            <div className="card-icon">📊</div>
            <h3>Full Dashboard</h3>
            <p>Interactive map</p>
          </div>

          <div 
            className="quick-card dosdont"
            onClick={() => navigate("/dosdont")}
          >
            <div className="card-icon">✋</div>
            <h3>Dos & Don'ts</h3>
            <p>Safety guidelines</p>
          </div>

          <div 
            className="quick-card profile"
            onClick={() => navigate("/profile")}
          >
            <div className="card-icon">👤</div>
            <h3>User Profile</h3>
            <p>Manage your account</p>
          </div>

          <div 
            className="quick-card history"
            onClick={() => navigate("/alert-history")}
          >
            <div className="card-icon">📋</div>
            <h3>Alert History</h3>
            <p>View past alerts</p>
          </div>
        </div>
      </section>

      {/* ⭐ FEATURES SECTION */}
      <section className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Alerts</h3>
            <p>Instant notifications for emergencies in your area</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🗺️</div>
            <h3>Interactive Maps</h3>
            <p>Visualize disasters with clustering technology</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h3>Mobile Responsive</h3>
            <p>Access alerts on any device, anywhere, anytime</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Precise Location</h3>
            <p>Get alerts based on your exact GPS location</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>Understand disaster patterns and trends</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚑</div>
            <h3>Rescue Support</h3>
            <p>Connect with rescue teams and emergency services</p>
          </div>
        </div>
      </section>

      {/* 📌 DISASTER TYPES SECTION */}
      <section className="disaster-types-section">
        <h2>Alert Categories</h2>
        <div className="disaster-types-grid">
          <div className="disaster-type-card fire">
            <div className="type-icon">🔥</div>
            <h4>Fire</h4>
            <p>Wildfire & urban fire alerts</p>
          </div>
          <div className="disaster-type-card flood">
            <div className="type-icon">💧</div>
            <h4>Flood</h4>
            <p>Flash flood & heavy rain alerts</p>
          </div>
          <div className="disaster-type-card earthquake">
            <div className="type-icon">📍</div>
            <h4>Earthquake</h4>
            <p>Seismic activity monitoring</p>
          </div>
          <div className="disaster-type-card landslide">
            <div className="type-icon">⛰️</div>
            <h4>Landslide</h4>
            <p>Slope failure warnings</p>
          </div>
        </div>
      </section>

      {/* 🎓 HOW IT WORKS SECTION */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <p><strong>Real-time Monitoring</strong><br/>Continuous satellite & weather monitoring</p>
          </div>
          <div className="arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <p><strong>Instant Detection</strong><br/>AI-powered disaster detection</p>
          </div>
          <div className="arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <p><strong>Alert Broadcast</strong><br/>Automatic notification system</p>
          </div>
          <div className="arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <p><strong>Emergency Response</strong><br/>Coordinated rescue operations</p>
          </div>
        </div>
      </section>

      {/* 🆘 EMERGENCY CTA SECTION */}
      <section className="emergency-cta-section">
        <div className="emergency-content">
          <h2>In Case of Emergency</h2>
          <p>If you need immediate help or want to report a disaster:</p>
          <div className="emergency-buttons">
            <button className="emergency-btn" onClick={() => navigate('/emergency')}>Report emergency</button>
            <a className="emergency-btn secondary" href="tel:112">Call 112</a>
          </div>
        </div>
      </section>

      {/* 📬 FOOTER CTA */}
      <section className="footer-cta-section">
        <p>Stay informed. Stay safe. Stay connected.</p>
        <p className="footer-subtext">A disaster information and alert coordination platform. Official source attribution is shown with each alert.</p>
      </section>

      {/* 🚨 EMERGENCY ERROR MESSAGE */}
      {emergencyError && (
        <div className="emergency-toast error">
          <div className="toast-content">
            <span className="toast-icon">⚠️</span>
            <span>{emergencyError}</span>
            <button 
              className="toast-close"
              onClick={() => setEmergencyError(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ✅ EMERGENCY SUCCESS MODAL */}
      {emergencySuccess && (
        <div className="emergency-modal-overlay">
          <div className="emergency-modal">
            <div className="modal-header">
              <span className="modal-icon">✅</span>
              <h3>{emergencySuccess.title}</h3>
            </div>
            <div className="modal-body">
              <p>{emergencySuccess.message}</p>
              <div className="modal-actions">
                {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                  <a
                    href={`tel:${emergencySuccess.number}`}
                    className="modal-call-btn"
                  >
                    📞 Call {emergencySuccess.number}
                  </a>
                )}
                <button 
                  className="modal-close-btn"
                  onClick={handleCloseEmergencySuccess}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
