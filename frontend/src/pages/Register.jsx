import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth() || {};
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password);

      if (result?.success) {
        toast.success('Account created!');
        navigate('/predict');
      } else {
        toast.error(result?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Cannot connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-shape s1" />
        <div className="auth-shape s2" />
        <div className="auth-shape s3" />
      </div>

      <div className="auth-card animate-scale-in">
        <div className="auth-header">
          <div className="auth-icon-ring">
            <span className="auth-icon-emoji">🛡️</span>
          </div>
          <h2>Create Account</h2>
          <p>Join EyeGuard to track your eye health</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">👤 Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">📧 Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <div className="input-password">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(!showPwd)}
                disabled={loading}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div className="pwd-strength">
                <div className={`pwd-bar ${password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak'}`} />
                <span>{password.length >= 8 ? 'Strong' : password.length >= 6 ? 'Good' : 'Weak'}</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner" /> Creating...
              </>
            ) : (
              <>
                Create Account <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <div className="auth-features-row">
          <span>🔒 Encrypted</span>
          <span>📊 Free Analysis</span>
          <span>🧠 AI Insights</span>
        </div>
      </div>
    </div>
  );
}