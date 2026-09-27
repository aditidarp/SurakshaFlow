import React, { useState } from "react";
import api from "../api/axios";

const EmergencyButtons = () => {
  const [loading, setLoading] = useState(null); // Track which button is loading
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Emergency services with colors and emojis
  const emergencyServices = [
    {
      id: "police",
      name: "Police",
      emoji: "🚓",
      color: "#2874f0",
      message: "Emergency Police Assistance Required",
      number: "100",
    },
    {
      id: "ambulance",
      name: "Ambulance",
      emoji: "🚑",
      color: "#d32f2f",
      message: "Medical Emergency - Ambulance Required",
      number: "102",
    },
    {
      id: "fire",
      name: "Fire",
      emoji: "🚒",
      color: "#ff6f00",
      message: "Fire Emergency - Fire Rescue Required",
      number: "101",
    },
  ];

  // Handle emergency button click
  const handleEmergencyClick = async (service) => {
    setLoading(service.id);
    setError(null);
    setSuccess(null);

    try {
      // Get user's current location
      if (!navigator.geolocation) {
        setError("Geolocation not supported. Please enable location.");
        setLoading(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

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

              setSuccess({
                title: `${service.emoji} ${service.name} Alert Sent!`,
                message: `Emergency services have been notified. Emergency call initiating to ${emergencyResponse.data.emergencyNumber}. Rescue teams are being dispatched to your location.`,
                sosId: emergencyResponse.data.sosId,
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
            
            setSuccess({
              title: `${service.emoji} Emergency Dialer Opening!`,
              message: `Opening direct call to ${service.number}. Rescue teams are being notified.`,
              number: service.number,
            });
          } finally {
            setLoading(null);
          }
        },
        (geoError) => {
          setError("Unable to get location. Please enable location services.");
          console.error("Geolocation Error:", geoError);
          setLoading(null);
        }
      );
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(null);
    }
  };

  // Close success modal
  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "500px",
      margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{
          fontSize: "32px",
          color: "#d32f2f",
          margin: "0 0 10px 0",
          fontWeight: "700"
        }}>
          🚨 Emergency Services
        </h1>
        <p style={{
          fontSize: "14px",
          color: "#666",
          margin: "0"
        }}>
          Quick access to emergency services - One click away
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          border: "2px solid #d32f2f",
          color: "#c62828",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px",
          fontSize: "14px",
          fontWeight: "500"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Emergency Buttons Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "16px",
        marginBottom: "20px"
      }}>
        {emergencyServices.map((service) => (
          <button
            key={service.id}
            onClick={() => handleEmergencyClick(service)}
            disabled={loading !== null}
            style={{
              padding: "20px",
              fontSize: "18px",
              fontWeight: "700",
              backgroundColor: loading === service.id ? "#e0e0e0" : service.color,
              color: "white",
              border: "none",
              borderRadius: "15px",
              cursor: loading === service.id ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow: `0 6px 20px ${service.color}33`,
              transition: "all 0.3s ease",
              opacity: loading && loading !== service.id ? 0.6 : 1,
              transform: loading === service.id ? "scale(0.95)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (loading === null) {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = `0 8px 25px ${service.color}44`;
              }
            }}
            onMouseLeave={(e) => {
              if (loading === null) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 6px 20px ${service.color}33`;
              }
            }}
          >
            <span style={{ fontSize: "32px" }}>
              {loading === service.id ? "⏳" : service.emoji}
            </span>
            <div style={{ textAlign: "left" }}>
              <div>{service.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                {loading === service.id ? "Sending alert..." : `Call: ${service.number}`}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Message */}
      <div style={{
        backgroundColor: "#e3f2fd",
        border: "2px solid #2196f3",
        color: "#1565c0",
        padding: "16px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: "500",
        lineHeight: "1.6"
      }}>
        ℹ️ <strong>How it works:</strong><br/>
        1. Click the emergency service button<br/>
        2. Allow location access<br/>
        3. Alert is sent to nearest rescue teams<br/>
        4. On mobile, you'll be connected to the service
      </div>

      {/* Success Modal */}
      {success && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "400px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            animation: "slideUp 0.3s ease",
          }}>
            {/* Success Icon */}
            <div style={{
              fontSize: "64px",
              marginBottom: "20px",
              animation: "pulse 1s infinite",
            }}>
              ✅
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: "24px",
              color: "#27ae60",
              margin: "0 0 15px 0",
              fontWeight: "700"
            }}>
              {success.title}
            </h2>

            {/* Message */}
            <p style={{
              fontSize: "15px",
              color: "#555",
              lineHeight: "1.6",
              margin: "0 0 20px 0"
            }}>
              {success.message}
            </p>

            {/* Location Info */}
            {userLocation && (
              <div style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "#666"
              }}>
                📍 Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </div>
            )}

            {/* SOS ID */}
            {success.sosId && (
              <div style={{
                backgroundColor: "#fffde7",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "#f57f17"
              }}>
                <strong>SOS ID:</strong> {success.sosId}
              </div>
            )}

            {/* Call Button (for mobile) */}
            {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
              <a
                href={`tel:${success.number}`}
                style={{
                  display: "inline-block",
                  padding: "12px 30px",
                  backgroundColor: "#d32f2f",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  transition: "background-color 0.3s"
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#b71c1c")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#d32f2f")}
              >
                📞 Call {success.number}
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={handleCloseSuccess}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.3s"
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#1565c0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#2196f3")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default EmergencyButtons;
