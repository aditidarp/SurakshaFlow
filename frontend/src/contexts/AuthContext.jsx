import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * AuthContext - Manages authentication state and role-based access
 * Provides: token, role, userEmail, login, logout, isAuthenticated, isAdmin
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');

    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setUserEmail(storedEmail);
      setUserName(storedName);
    }
    setLoading(false);
  }, []);

  // Handle login - store auth data
  const login = (token, role, email, name = '') => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userEmail', email);
    if (name) localStorage.setItem('userName', name);
    
    setToken(token);
    setRole(role);
    setUserEmail(email);
    setUserName(name || null);
  };

  // Handle logout - clear all auth data
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    setToken(null);
    setRole(null);
    setUserEmail(null);
    setUserName(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Check if user is admin
  const isAdmin = role === 'admin';

  // Check if user is regular user
  const isUser = role === 'user';

  const value = {
    token,
    role,
    userEmail,
    userName,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
