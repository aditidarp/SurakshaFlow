import React, { useState } from 'react';
import AlertManagement from './AlertManagement';
import './AlertSystemPage.css';

/**
 * Demo Page for Complete Alert Management System
 * - Switch between Admin and User roles
 * - See how both roles interact with same backend
 */

const AlertSystemPage = () => {
  const [role, setRole] = useState(localStorage.getItem('role') || 'user');
  const [showAlert, setShowAlert] = useState(false);

  const switchRole = (newRole) => {
    localStorage.setItem('role', newRole);
    setRole(newRole);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  return (
    <div>
      {/* ROLE SWITCHER */}
      <div className="role-switcher">
        <h3>🔄 Switch Role for Demo</h3>
        <div className="role-buttons">
          <button
            onClick={() => switchRole('admin')}
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            style={{
              background: role === 'admin' ? '#667eea' : '#e0e0e0',
              color: role === 'admin' ? 'white' : '#666'
            }}
          >
            👑 Admin Panel
          </button>
          <button
            onClick={() => switchRole('user')}
            className={`role-btn ${role === 'user' ? 'active' : ''}`}
            style={{
              background: role === 'user' ? '#f5576c' : '#e0e0e0',
              color: role === 'user' ? 'white' : '#666'
            }}
          >
            👤 User View
          </button>
        </div>
        {showAlert && (
          <div style={{
            background: '#d1e7dd',
            color: '#0f5132',
            padding: '10px 15px',
            borderRadius: '4px',
            marginTop: '10px',
            fontSize: '0.9rem'
          }}>
            ✅ Switched to {role === 'admin' ? 'Admin' : 'User'} mode
          </div>
        )}
      </div>

      {/* MAIN SYSTEM */}
      <AlertManagement key={role} />
    </div>
  );
};

export default AlertSystemPage;
