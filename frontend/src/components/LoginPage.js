import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = ({ rescueOnly = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // State management
  const [role, setRole] = useState(rescueOnly ? 'rescue' : 'user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Switch between public user and rescue team login modes.
  const switchRole = (newRole) => {
    setRole(newRole);
    setEmail('');
    setPassword('');
    setErrors({});
    setApiError('');
    setSuccess('');
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // API call to backend
      const response = await API.post('/auth/login', {
        email,
        password,
        role,
      });

      // Handle successful login
      if (response.data.token) {
        const roleDisplay = role === 'rescue' ? 'Rescue Team' : 'User';
        setSuccess(`Welcome ${roleDisplay}! Redirecting...`);
        
        // Store auth data in context and localStorage
        login(response.data.token, response.data.role || role, email, response.data.name);

        // Redirect based on role
        setTimeout(() => {
          if (role === 'rescue') {
            // Redirect to rescue team dashboard
            navigate('/rescue-dashboard');
          } else {
            // Redirect to user home
            navigate('/home');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle API errors
      if (error.data?.message) {
        setApiError(error.data.message);
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setApiError('Invalid email or password');
      } else if (error.response?.status === 403) {
        setApiError('Access denied. Invalid credentials for ' + role + ' role.');
      } else if (error.message === 'Network Error') {
        setApiError('Network error. Please check your connection.');
      } else {
        setApiError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shape shape-1"></div>
        <div className="background-shape shape-2"></div>
        <div className="background-shape shape-3"></div>
      </div>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Welcome to SurakshaFlow</h1>
          <p>Real-Time Disaster Alert & Rescue Coordination</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="role-tabs">
          {!rescueOnly && <button
            type="button"
            className={`role-tab ${role === 'user' ? 'active' : ''}`}
            onClick={() => switchRole('user')}
            disabled={loading}
          >
            👤 User Login
          </button>}
          {!rescueOnly && <button
            type="button"
            className={`role-tab ${role === 'rescue' ? 'active' : ''}`}
            onClick={() => switchRole('rescue')}
            disabled={loading}
          >
            🚨 Rescue Team Login
          </button>}
          {rescueOnly && <div className="role-tab active">🚨 Rescue Team Login</div>}
        </div>
        {!rescueOnly && <p className="rescue-login-link"><Link to="/rescue/login">Rescue team sign in</Link></p>}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {success}
          </div>
        )}

        {/* API Error Message */}
        {apiError && (
          <div className="error-message">
            <span className="error-icon">✕</span>
            {apiError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <span className="label-text">Email Address</span>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                autoComplete="email"
              />
              <span className="input-icon">✉️</span>
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-text">Password</span>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-footer">
            <label className="remember-me">
              <input type="checkbox" disabled={loading} />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-password">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="signup-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
