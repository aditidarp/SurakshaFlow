import React from "react";
import "leaflet/dist/leaflet.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";

import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import Home from "./components/Home";
import About from "./components/About";
import UserProfile from "./components/UserProfile";
import AlertHistory from "./components/AlertHistory";
import ForecastControls from "./components/ForecastControls";
import UserDashboard from "./components/UserDashboard";
import RescueDashboard from "./components/RescueDashboard";
import DisasterDashboard from "./components/DisasterDashboard";
import UserAlerts from "./components/UserAlerts";
import DosDontsPage from "./components/DosDont/DosDontPage";
import StateWiseAlerts from "./components/StateWiseAlerts";
import AlertSystemPage from "./components/AlertSystemPage";
import AllIndiaAlerts from "./components/AllIndiaAlerts";
import CurrentLocationAlert from "./components/CurrentLocationAlert";
import EmergencyButtons from "./components/EmergencyButtons";
import LiveStream from "./components/LiveStream";
import AdvancedLiveDashboard from "./components/AdvancedLiveDashboard";

/* 🔐 Protected Route - Requires Authentication */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* 🚨 Rescue Team Route - Requires Rescue Role */
const RescueRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  
  if (loading) return null;
  return isAuthenticated && (role === 'rescue' || role === 'rescue_team') ? children : <Navigate to="/login" replace />;
};

function App() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>

      {/* Root - redirect based on auth */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      {/* Home */}
      <Route
        path="/home"
        element={
          <Home />
        }
      />

      {/* About */}
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />

      {/* User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Alert History */}
      <Route
        path="/alert-history"
        element={
          <ProtectedRoute>
            <AlertHistory />
          </ProtectedRoute>
        }
      />

      {/* ✅ PUBLIC ROUTES (NO LOGIN) */}
      <Route path="/all-india-alerts" element={<AllIndiaAlerts />} />
      <Route path="/state-wise-alerts" element={<StateWiseAlerts />} />
      <Route path="/forecast" element={<ForecastControls />} />
      <Route path="/current-location-alerts" element={<CurrentLocationAlert />} />
      <Route path="/emergency" element={<EmergencyButtons />} />
      <Route path="/dosdont" element={<DosDontsPage />} />

      {/* Real-time Alerts - User */}
      <Route
        path="/user/alerts"
        element={
          <ProtectedRoute>
            <UserAlerts />
          </ProtectedRoute>
        }
      />

      {/* Dos & Don'ts */}
      <Route path="/dos-donts" element={<DosDontsPage />} />

      {/* 👤 User Dashboard - Multi-Role System */}
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* 🚨 Rescue Team Dashboard - Multi-Role System */}
      <Route
        path="/rescue-dashboard"
        element={
          <RescueRoute>
            <RescueDashboard />
          </RescueRoute>
        }
      />

      <Route path="/rescue/login" element={<LoginPage rescueOnly />} />

      {/* 🚨 Real-Time Disaster & Rescue Dashboard */}
      <Route
        path="/realtime-dashboard"
        element={
          <ProtectedRoute>
            <DisasterDashboard />
          </ProtectedRoute>
        }
      />

      {/* 📡 Live Stream Dashboard - Real-time Alerts & Weather */}
      <Route
        path="/live-dashboard"
        element={<AdvancedLiveDashboard />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
