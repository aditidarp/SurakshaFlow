import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import './LoginPage.css'; // Reusing Login styles for consistent Sachet UI

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    role: 'user' // STRICTLY limited to 'user' for this registration!
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password must match.');
      return;
    }
    const normalizedPhone = /^\d{10}$/.test(formData.phone) ? `+91${formData.phone}` : formData.phone;
    if (!/^\+91[6-9]\d{9}$/.test(normalizedPhone)) {
      setError('Enter a valid Indian mobile number, e.g. +919876543210.');
      return;
    }
    setLoading(true);
    try {
      // Create user
      await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: normalizedPhone,
        location: formData.location,
      });
      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.data?.message || err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <h1>Join SurakshaFlow</h1>
          <p>Register for Live Disaster Alerts</p>
        </div>

        {error && <div className="error-message">✕ {error}</div>}
        {success && <div className="success-message">✓ {success}</div>}

        <form onSubmit={handleRegister} className="login-form" style={{ gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              name="name" 
              type="text" 
              className="form-input" 
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location / City</label>
            <input name="location" type="text" className="form-input" placeholder="e.g. Pune" value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              name="email" 
              type="email" 
              className="form-input" 
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input name="confirmPassword" type="password" className="form-input" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              name="phone" 
              type="tel" 
              className="form-input" 
              placeholder="+91..."
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
               name="password"
               type="password" 
               className="form-input" 
               placeholder="Create a strong password"
               value={formData.password}
               onChange={handleChange}
               required 
            />
          </div>

          <button type="submit" className="login-button" disabled={loading} style={{ background: '#1f4fa3' }}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/login" className="signup-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
