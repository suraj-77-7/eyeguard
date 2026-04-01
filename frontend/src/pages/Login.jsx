import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/predict';

  const pageVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.97, rotateX: -8 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { type: 'spring', stiffness: 150, damping: 17 },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result?.success) {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      } else {
        toast.error(result?.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Cannot connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-page auth-page--login"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-shape s1" />
        <div className="auth-shape s2" />
        <div className="auth-shape s3" />
        <div className="auth-ring r1" />
        <div className="auth-ring r2" />
      </div>

      <motion.div className="auth-card auth-card--login" variants={cardVariants}>
        <div className="auth-header">
          <span className="auth-kicker">EyeGuard Access</span>
          <div className="auth-icon-ring">
            <span className="auth-icon-emoji">👁️</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your eye health dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <motion.div className="form-group" variants={fieldVariants}>
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
          </motion.div>

          <motion.div className="form-group" variants={fieldVariants}>
            <label htmlFor="password">🔒 Password</label>
            <div className="input-password">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </motion.div>

          <motion.button
            type="submit"
            className="btn-auth"
            disabled={loading}
            variants={fieldVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <span className="btn-arrow">→</span>
              </>
            )}
          </motion.button>

          <motion.div className="auth-note" variants={fieldVariants}>
            <span className="auth-note-dot" />
            Session protection is active
          </motion.div>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="auth-features-row">
          <span>🔒 Secure</span>
          <span>⚡ Instant</span>
          <span>🆓 Free</span>
        </div>
      </motion.div>
    </motion.div>
  );
}