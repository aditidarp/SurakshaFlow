import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";

const CurrentLocationAlert = () => {
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "#d32f2f"; // Red
      case "high":
        return "#f57c00"; // Orange
      case "medium":
        return "#fbc02d"; // Yellow
      case "low":
        return "#689f38"; // Green
      default:
        return "#1976d2"; // Blue
    }
  };

  // Get alert type emoji
  const getAlertEmoji = (type) => {
    const typeMap = {
      flood: "🌊",
      earthquake: "⚠️",
      fire: "🔥",
      cyclone: "🌪️",
      tsunami: "🌊",
      landslide: "⛰️",
      storm: "⛈️",
      drought: "🏜️",
      default: "⚠️"
    };
    return typeMap[type?.toLowerCase()] || typeMap.default;
  };

  // Calculate distance between two coordinates (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Fetch nearby alerts
  const fetchNearbyAlerts = async (latitude, longitude) => {
    try {
      const response = await api.get(
        `/api/alerts/nearby?lat=${latitude}&lon=${longitude}&radius=5000`
      );
      setNearbyAlerts(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle "My Location" button click - Real-time tracking
  const handleMyLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("❌ Geolocation is not supported by your browser. Please use Chrome, Firefox, or Edge.");
      setLoading(false);
      return;
    }

    // Stop any existing watches first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // First: Get current position once
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setIsTracking(true);
        setLoading(false);
        setError(null);
        
        // Fetch nearby alerts for the current location
        await fetchNearbyAlerts(latitude, longitude);

        // Then: Set up watchPosition for continuous updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;
            setUserLocation({ latitude: lat, longitude: lon });
            await fetchNearbyAlerts(lat, lon);
          },
          (watchError) => {
            // Silently handle watch errors - don't spam console
            console.debug("Watch position error (ignored):", watchError.code);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      },
      (error) => {
        // Show error only from getCurrentPosition, not from watch
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "🔒 Permission Denied! Please enable location access:\n1. Click the lock icon in browser URL bar\n2. Set Location to 'Allow'\n3. Reload the page\n4. Try again";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "📡 Location Not Available! Please:\n1. Enable Location Services on your device\n2. Make sure GPS/Location is turned ON\n3. Try again";
            break;
          case error.TIMEOUT:
            errorMessage = "⏱️ Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "❌ Location Error. Please enable location services and try again.";
        }
        setError(errorMessage);
        setLoading(false);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Stop tracking location
  const handleStopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setUserLocation(null);
    setNearbyAlerts([]);
    setError(null);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);


  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Top Container */}
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "40px 30px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{
            fontSize: "36px",
            color: "#2c3e50",
            margin: "0 0 10px 0",
            fontWeight: "700"
          }}>
            📍 Your Current Location
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#7f8c8d",
            margin: "0"
          }}>
            Real-time disaster alerts around you
          </p>
        </div>

        {/* Button Container */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginBottom: "30px",
          flexWrap: "wrap"
        }}>
          {!isTracking ? (
            <button
              onClick={handleMyLocation}
              disabled={loading}
              style={{
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: loading ? "#bdc3c7" : "#3498db",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(52, 152, 219, 0.4)",
                transition: "all 0.3s ease",
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(52, 152, 219, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(52, 152, 219, 0.4)";
                }
              }}
            >
              {loading ? "🔄 Detecting Location..." : "📍 Start Tracking"}
            </button>
          ) : (
            <button
              onClick={handleStopTracking}
              style={{
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(231, 76, 60, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(231, 76, 60, 0.4)";
              }}
            >
              ⏹️ Stop Tracking
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: "#fadbd8",
            borderLeft: "4px solid #e74c3c",
            color: "#c0392b",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "25px",
            fontSize: "15px",
            fontWeight: "500"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Location Info - Live Tracking Status */}
        {isTracking && userLocation && (
          <div style={{
            backgroundColor: "#d5f4e6",
            borderLeft: "4px solid #27ae60",
            color: "#27ae60",
            padding: "18px",
            borderRadius: "8px",
            marginBottom: "25px",
            fontSize: "15px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ fontSize: "20px", animation: "pulse 1.5s infinite" }}>🟢</span>
            <div>
              <div>📍 Live Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</div>
              <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.8 }}>Real-time tracking active</div>
            </div>
          </div>
        )}

        {/* Alerts Container */}
        {isTracking && nearbyAlerts.length > 0 ? (
          <div>
            <div style={{
              backgroundColor: "#fff3cd",
              borderLeft: "4px solid #f39c12",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "25px",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: "500",
              color: "#856404"
            }}>
              ⚠️ {nearbyAlerts.length} Disaster Alert{nearbyAlerts.length > 1 ? 's' : ''} Found Within 5km!
            </div>

            <div>
              {nearbyAlerts.map((alert, index) => {
                const alertLat = alert.location?.coordinates?.[1];
                const alertLon = alert.location?.coordinates?.[0];
                const distance = alertLat && alertLon
                  ? calculateDistance(userLocation.latitude, userLocation.longitude, alertLat, alertLon)
                  : "Unknown";

                return (
                  <div
                    key={alert._id || index}
                    style={{
                      backgroundColor: "#ffffff",
                      border: `3px solid ${getSeverityColor(alert.severity)}`,
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "16px",
                      boxShadow: `0 4px 12px ${getSeverityColor(alert.severity)}33`,
                      transition: "all 0.3s ease",
                      borderLeft: `6px solid ${getSeverityColor(alert.severity)}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = `0 8px 24px ${getSeverityColor(alert.severity)}44`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${getSeverityColor(alert.severity)}33`;
                    }}
                  >
                    {/* Alert Header */}
                    <div style={{ marginBottom: "12px" }}>
                      <h3 style={{
                        margin: "0 0 8px 0",
                        color: getSeverityColor(alert.severity),
                        fontSize: "18px",
                        fontWeight: "700"
                      }}>
                        {getAlertEmoji(alert.type)} {alert.type.toUpperCase()}
                      </h3>
                      <p style={{
                        margin: "0",
                        color: "#e74c3c",
                        fontSize: "16px",
                        fontWeight: "600"
                      }}>
                        📏 {distance}km away
                      </p>
                    </div>

                    {/* Alert Title */}
                    <p style={{
                      margin: "12px 0",
                      color: "#2c3e50",
                      fontSize: "16px",
                      fontWeight: "600"
                    }}>
                      {alert.title}
                    </p>

                    {/* Alert Description */}
                    {alert.description && (
                      <p style={{
                        margin: "12px 0",
                        color: "#34495e",
                        fontSize: "14px",
                        lineHeight: "1.6"
                      }}>
                        {alert.description}
                      </p>
                    )}

                    {/* Severity Badge */}
                    <div style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{
                        backgroundColor: getSeverityColor(alert.severity),
                        color: "white",
                        padding: "6px 14px",
                        borderRadius: "25px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase"
                      }}>
                        {alert.severity?.toUpperCase() || "UNKNOWN"}
                      </span>
                      {alert.date && (
                        <span style={{
                          color: "#95a5a6",
                          fontSize: "12px"
                        }}>
                          🕐 {new Date(alert.date).toLocaleDateString()} {new Date(alert.date).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isTracking && nearbyAlerts.length === 0 ? (
          <div style={{
            backgroundColor: "#d5f4e6",
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            border: "2px dashed #27ae60"
          }}>
            <h3 style={{
              fontSize: "28px",
              color: "#27ae60",
              margin: "0 0 10px 0"
            }}>
              ✅ You Are Safe!
            </h3>
            <p style={{
              fontSize: "16px",
              color: "#16a085",
              margin: "0"
            }}>
              No disaster alerts in your 5km radius. Keep checking for updates.
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: "#ecf0f1",
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            border: "2px dashed #95a5a6"
          }}>
            <h3 style={{
              fontSize: "28px",
              color: "#7f8c8d",
              margin: "0 0 10px 0"
            }}>
              📍 Start Location Tracking
            </h3>
            <p style={{
              fontSize: "16px",
              color: "#95a5a6",
              margin: "0"
            }}>
              Click "Start Tracking" to enable real-time location monitoring and receive nearby disaster alerts.
            </p>
          </div>
        )}
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CurrentLocationAlert;
