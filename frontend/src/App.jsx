import React, { useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { loadSlim } from 'tsparticles-slim';
import Particles from 'react-tsparticles';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Analysis from './pages/Analysis';
import ModelComparison from './pages/ModelComparison';
import EyeCare from './pages/EyeCare';

import './App.css';

const particleOptions = {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  interactivity: {
    events: { onHover: { enable: true, mode: 'bubble' }, resize: true },
    modes: {
      bubble: {
        distance: 140,
        size: 9,
        duration: 1.4,
        opacity: 0.8,
      },
    },
  },
  particles: {
    color: {
      value: ['#f4d35e', '#4ecdc4', '#ee964b', '#f95738'],
    },
    links: {
      enable: true,
      distance: 120,
      color: '#f4d35e',
      opacity: 0.08,
      width: 0.8,
      triangles: {
        enable: true,
        opacity: 0.015,
      },
    },
    move: {
      angle: { offset: 0, value: 35 },
      direction: 'top-right',
      enable: true,
      outModes: { default: 'out' },
      speed: 0.8,
      trail: {
        enable: true,
        length: 4,
        fill: {
          color: '#0b0f1f',
        },
      },
      wobble: {
        enable: true,
        distance: 7,
        speed: { min: -5, max: 5 },
      },
    },
    number: {
      density: { enable: true, area: 1000 },
      value: 70,
    },
    opacity: {
      value: { min: 0.08, max: 0.6 },
      animation: {
        enable: true,
        speed: 0.6,
        sync: false,
      },
    },
    shape: { type: ['circle', 'triangle'] },
    size: {
      value: { min: 1, max: 3.8 },
      animation: {
        enable: true,
        speed: 1.2,
        sync: false,
      },
    },
  },
  detectRetina: true,
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <div>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/models" element={<ModelComparison />} />
        <Route path="/eyecare" element={<EyeCare />} />
      </Routes>
    </div>
  );
};

function App() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Particles id="tsparticles" init={particlesInit} options={particleOptions} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--dark-secondary)', color: 'var(--white)' },
          }}
        />
        <Navbar />
        <main>
          <AppRoutes />
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;