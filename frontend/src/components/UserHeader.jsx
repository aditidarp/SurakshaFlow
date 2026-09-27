import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './UserHeader.css';

/**
 * UserHeader Component
 * Displays user authentication status, role, email, and logout button
 */
const UserHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, userEmail, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!isAuthenticated) {
    return null;
  }

  const roleDisplay = role === 'admin' ? '👑 Admin' : '👤 User';
  const roleColor = role === 'admin' ? '#ef4444' : '#3b82f6';

  return (
    <div className="user-header">
      <div className="user-info">
        <span className="role-label" style={{ borderLeftColor: roleColor }}>
          {roleDisplay}
        </span>
        {userEmail && <span className="user-email">{userEmail}</span>}
      </div>
      <button onClick={handleLogout} className="logout-button">
        🚪 Logout
      </button>
    </div>
  );
};

export default UserHeader;
