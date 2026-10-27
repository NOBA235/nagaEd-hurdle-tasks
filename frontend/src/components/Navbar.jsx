import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar-brand">
          <span className="brand-badge">NagaEd</span>
          <span className="brand-text">Developer Portal</span>
        </Link>

        <nav className="navbar-nav">
          {isAuthenticated ? (
            <div className="navbar-user-section">
              <span className="user-greeting">
                Signed in as <strong>{user?.username}</strong>
              </span>
              <button onClick={handleLogout} className="btn-logout" type="button">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="nav-btn-register">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

