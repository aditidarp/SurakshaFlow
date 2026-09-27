import React from "react";
import "./About.css";

const About = () => {
  const stats = [
    { icon: "⚠️", number: "24/7", label: "Real-time Monitoring" },
    { icon: "🗺️", number: "28", label: "States Covered" },
    { icon: "📱", number: "∞", label: "Alert Channels" },
    { icon: "🚑", number: "100+", label: "Rescue Teams" }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Rapid Response",
      description: "Quick alert dissemination to save precious lives during disasters"
    },
    {
      icon: "🤝",
      title: "Coordination",
      description: "Seamless coordination between rescue teams and authorities"
    },
    {
      icon: "🌍",
      title: "Coverage",
      description: "Pan-India coverage for all types of natural disasters"
    },
    {
      icon: "💡",
      title: "Innovation",
      description: "Technology-driven solutions for disaster management"
    }
  ];

  const features = [
    {
      icon: "📍",
      title: "Location-Based Alerts",
      description: "Receive alerts specifically for your location with real-time updates"
    },
    {
      icon: "🚨",
      title: "Emergency SOS",
      description: "One-click emergency button to alert rescue teams instantly"
    },
    {
      icon: "📊",
      title: "Live Dashboard",
      description: "Interactive map showing active disasters across India"
    },
    {
      icon: "🌐",
      title: "Multi-Language",
      description: "Alerts available in multiple regional languages"
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">🚨 SurakshaFlow</h1>
          <p className="hero-subtitle">
            Empowering Communities with Real-Time Disaster Alerts and Efficient Rescue Coordination
          </p>
          <button className="cta-btn">Learn More</button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-main">
        <div className="about-grid">
          <div className="about-content">
            <h2>About SurakshaFlow</h2>
            <p>
              <strong>SurakshaFlow</strong> is a comprehensive, technology-driven platform for disaster alerts, emergency information, and rescue coordination in India.
            </p>
            <p>
              We provide <strong>real-time early warning alerts</strong> for all types of natural disasters including floods, earthquakes, cyclones, landslides, and extreme weather events.
            </p>
            <p>
              Our mission is to <strong>save lives and minimize damage</strong> by enabling rapid information dissemination and efficient coordination between rescue teams, authorities, and affected communities.
            </p>

            <div className="about-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">✓</span>
                <span>Real-time Disaster Monitoring</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">✓</span>
                <span>Geo-Targeted Alert Delivery</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">✓</span>
                <span>Emergency SOS Coordination</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">✓</span>
                <span>Rescue Team Management</span>
              </div>
            </div>
          </div>

          <div className="about-visual">
            <div className="visual-box">
              <div className="visual-icon">🛡️</div>
              <p>Protecting Every Indian</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="mission-card">
          <h3>🎯 Our Mission</h3>
          <p>
            To provide timely, accurate, and actionable disaster alerts to every citizen of India, enabling rapid response and saving lives through efficient coordination of rescue operations.
          </p>
        </div>

        <div className="vision-card">
          <h3>🌟 Our Vision</h3>
          <p>
            A disaster-resilient India where technology and human coordination work together to minimize loss of life and property during natural calamities.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">{value.icon}</div>
              <h4>{value.title}</h4>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card-new">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Disaster Detected</h4>
            <p>Real-time monitoring identifies potential disasters</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Alerts Generated</h4>
            <p>Automatic alerts created for affected areas</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Users Notified</h4>
            <p>Multi-channel notification to all users</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Rescue Coordinated</h4>
            <p>Rescue teams dispatched and coordinated</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Help Save Lives Today</h2>
        <p>Be part of India's disaster management revolution</p>
        <button className="cta-btn-large">Get Started Now</button>
      </section>
    </div>
  );
};

export default About;
