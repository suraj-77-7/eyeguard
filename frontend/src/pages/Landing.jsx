import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
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
          <div className="shape shape-1" />
          <div className="shape shape-2" />
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

          <motion.div className="model-card featured" variants={itemVariants}>
            <div className="featured-badge">Top Pick</div>
            <span className="model-icon">⚡</span>
            <h3>XGBoost Model</h3>
            <p>State-of-the-art gradient boosting that captures complex non-linear patterns in your daily screen habits.</p>
            <span className="model-tag">96.8% Accuracy</span>
          </motion.div>

          <motion.div className="model-card" variants={itemVariants}>
            <span className="model-icon">🎯</span>
            <h3>SVM Classifier</h3>
            <p>High-dimensional vector analysis to find the optimal decision boundary for strain categorization.</p>
            <span className="model-tag">Robust Performance</span>
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
            { icon: '📱', title: 'Habit Analysis', desc: 'Real-time monitoring of screen time, break frequency, and digital ergonomics.' },
            { icon: '🌙', title: 'Circadian Insights', desc: 'Understand how nighttime blue light exposure affects your eye recovery and sleep.' },
            { icon: '🔬', title: 'Explainable ML', desc: 'Detailed breakdown of which factors contribute most to your personal eye strain risk.' }
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
