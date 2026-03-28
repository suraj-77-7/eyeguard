import React, { useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { loadSlim } from 'tsparticles-slim';
import Particles from 'react-tsparticles';
import { motion, AnimatePresence } from 'framer-motion';

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
  background: { color: { value: "#020617" } },
  fpsLimit: 60,
  interactivity: {
    events: { onHover: { enable: true, mode: "repulse" }, resize: true },
    modes: { repulse: { distance: 80, duration: 0.4 } },
  },
  particles: {
    color: { value: "#ffffff" },
    links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
    move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 0.5, straight: false },
    number: { density: { enable: true, area: 800 }, value: 80 },
    opacity: { value: 0.2 },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 5 } },
  },
  detectRetina: true,
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    // AnimatePresence allows components to animate out before unmounting
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
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
      </motion.div>
    </AnimatePresence>
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