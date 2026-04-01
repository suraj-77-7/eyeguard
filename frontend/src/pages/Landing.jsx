import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.99 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.12,
        when: 'beforeChildren',
      },
    },
  };

  const itemVariants = {
    hidden: { y: 28, opacity: 0, rotate: -1.2, filter: 'blur(4px)' },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 140, damping: 14 },
    },
  };

  return (
    <div className="landing">
      <motion.div
        className="hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background Visuals */}
        <div className="hero-bg-shapes">
          <div className="shape shape-1" aria-hidden="true" />
          <div className="shape shape-2" aria-hidden="true" />
          <div className="shape shape-3" aria-hidden="true" />
          <div className="orbit-ring orbit-ring-1" aria-hidden="true" />
          <div className="orbit-ring orbit-ring-2" aria-hidden="true" />
        </div>

        <motion.div className="hero-content" variants={itemVariants}>
          <div className="hero-badge">
            <span className="badge-dot" />
            Detection of Screen Induced Eye Strain in Students
          </div>
          <motion.h1 className="hero-title" variants={itemVariants}>
            Protect Your Vision in the <span className="hero-highlight">Digital Era</span>
          </motion.h1>
          <motion.p className="hero-desc" variants={itemVariants}>
            This system helps detect eye strain problems caused by excessive screen usage among students and promotes awareness about eye care.
          </motion.p>

          <motion.div className="hero-btns" variants={itemVariants}>
            <button className="btn-premium" onClick={() => navigate('/predict')}>
              Start Prediction <span className="btn-icon">→</span>
            </button>
            <button className="btn-secondary" onClick={() => navigate('/games')}>
              Play Eye Games
            </button>
            <button className="btn-secondary" onClick={() => navigate('/eyecare')}>
              Eye Care Information
            </button>
            <button className="btn-secondary" onClick={() => navigate('/analysis')}>
              Explore Dataset
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Models Showcase Section */}
      <motion.section
        className="models-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="models-grid">
          <motion.div className="model-card" variants={itemVariants}>
            <span className="model-icon">📈</span>
            <h3>Logistic Regression</h3>
            <p>Baseline probabilistic model providing clear, interpretable coefficients for risk factor analysis.</p>
            <span className="model-tag">Fast & Reliable</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        <motion.h2 className="section-heading" variants={itemVariants}>Intelligent Features</motion.h2>
        <motion.p className="section-sub" variants={itemVariants}>Everything you need to monitor and preserve your visual well-being.</motion.p>
        <div className="features-grid">
          {[
            { icon: '🤖', title: 'ML-Powered Risk Assessment', desc: 'Advanced logistic regression model analyzes your digital eye strain risk with clinical accuracy.' },
            { icon: '💡', title: 'Smart Personalized Recommendations', desc: 'Get tailored advice based on your screen habits, break frequency, and usage patterns.' },
            { icon: '📊', title: 'Health Tracking & Streaks', desc: 'Monitor your daily eye health progress and build healthy habits with streak tracking.' }
          ].map((feature, i) => (
            <motion.div className="feature-card" key={i} variants={itemVariants}>
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call To Action Section */}
      <motion.section
        className="section section-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>Ready to check your eyes?</motion.h2>
        <motion.div variants={itemVariants}>
          <button className="btn-premium" onClick={() => navigate('/predict')}>
            Get Started Now
          </button>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Landing;
