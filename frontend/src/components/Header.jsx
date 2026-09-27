import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, userEmail, userName, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="gov-header-top">
        <div className="gov-container">
          <span>🇮🇳 National Disaster Management Authority, Government of India</span>
        </div>
      </div>

      <header className="main-header">
        <div className="header-container">
          {/* Logo Section */}
          <div className="logo-section" onClick={() => navigate('/home')} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && navigate('/home')}>
            <span className="logo-icon" aria-hidden="true">SF</span>
            <div className="logo-text">
              <h1 className="system-title">SurakshaFlow</h1>
              <span className="system-subtitle">Real-Time Disaster Alert & Rescue Coordination</span>
            </div>
          </div>

          {/* Core Navigation Options */}
          <button className="mobile-menu-button" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? 'Close' : 'Menu'}
          </button>

          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
            <ul>
              <li><NavLink to="/home" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
              <li><NavLink to="/live-dashboard" onClick={() => setMenuOpen(false)}>Live alerts</NavLink></li>
              <li><NavLink to="/all-india-alerts" onClick={() => setMenuOpen(false)}>Map</NavLink></li>
              <li><NavLink to="/emergency" onClick={() => setMenuOpen(false)}>Emergency</NavLink></li>
              <li><NavLink to="/dos-donts" onClick={() => setMenuOpen(false)}>Safety</NavLink></li>
              <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
            </ul>
          </nav>

          {/* Identity & Access Management */}
          <div className="auth-buttons">
            {!isAuthenticated ? (
              <>
                <button className="btn-register" onClick={() => navigate('/register')} title="Register a New Public User Account">
                  📝 Register (Public User)
                </button>
                <button className="btn-login" onClick={() => navigate('/login')} title="Login for public users">
                  🔐 User login
                </button>
              </>
            ) : (
              <div className="user-info">
                <span className="user-email">Welcome, {userName || userEmail}</span>
                <button className="btn-logout" onClick={handleLogout} title="Logout from your account">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
