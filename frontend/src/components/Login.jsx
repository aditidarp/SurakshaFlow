import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./Login.css"; // 🔹 CSS import

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await axios.post("/auth/login", {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);

        alert("Login Successful!");
        navigate("/home");
      } else {
        // Register
        const response = await axios.post("/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        alert("Registration Successful! Please login.");
        setIsLogin(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {!isLogin && (
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="role-select"
          >
            <option value="user">User</option>
            <option value="rescue_team">Rescue Team</option>
          </select>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
        </button>
      </form>
      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default Login;
