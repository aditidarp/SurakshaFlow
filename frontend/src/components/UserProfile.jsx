import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const response = await axios.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to load profile";
      setError(errorMsg);
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const token = localStorage.getItem("token");
      await axios.put("/auth/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Profile updated successfully!");
      setEditing(false);
      fetchUserProfile();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
      alert("❌ " + errorMsg);
      console.error("Profile update error:", error);
    }
  };

  const handleLogout = () => {
    logout(); // Clear auth from context and localStorage
    navigate("/login", { replace: true });
  };

  if (loading) {
    return <div className="profile-container"><div className="loading">Loading profile...</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>👤 User Profile</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            padding: "12px", 
            borderRadius: "4px", 
            marginBottom: "15px",
            borderLeft: "4px solid #f5365c"
          }}>
            ❌ {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <strong>Name:</strong> {user?.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user?.email}
            </div>
            <div className="info-item">
              <strong>Role:</strong> {user?.role}
            </div>
            <div className="info-item">
              <strong>Joined:</strong> {new Date(user?.createdAt).toLocaleDateString()}
            </div>
            <button onClick={() => setEditing(true)} className="edit-btn">Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;