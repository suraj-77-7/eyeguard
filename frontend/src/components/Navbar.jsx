import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <Link to="/" className="nav-brand">
        <span className="brand-icon">👁️</span>
        <span className="brand-text">EyeGuard</span>
      </Link>

      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
        <div className={`hamburger ${mobileOpen ? 'open' : ''}`}>
          <span /><span /><span />
        </div>
      </button>

      <div className={`nav-menu ${mobileOpen ? 'nav-open' : ''}`}>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <span className="link-icon">🏠</span> Home
          </Link>
          <Link to="/predict" className={`nav-link ${isActive('/predict') ? 'active' : ''}`}>
            <span className="link-icon">🔮</span> Predict
          </Link>
          <Link to="/analysis" className={`nav-link ${isActive('/analysis') ? 'active' : ''}`}>
            <span className="link-icon">📊</span> Analysis
          </Link>
          <Link to="/models" className={`nav-link ${isActive('/models') ? 'active' : ''}`}>
            <span className="link-icon">🤖</span> Models
          </Link>
          <Link to="/eyecare" className={`nav-link ${isActive('/eyecare') ? 'active' : ''}`}>
            <span className="link-icon">🥕</span> Eye Care
          </Link>
          <Link to="/games" className={`nav-link ${isActive('/games') ? 'active' : ''}`}>
            <span className="link-icon">🎮</span> Games
          </Link>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              <div className="nav-avatar">{String(user?.name || 'U').charAt(0).toUpperCase()}</div>
              <span className="nav-greeting">Welcome, <strong>{user?.name || 'User'}</strong></span>
              <button className="btn-logout" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn-login">Sign In</Link>
              <Link to="/register" className="btn-signup">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}