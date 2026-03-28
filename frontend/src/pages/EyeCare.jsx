import React from 'react';
import { motion } from 'framer-motion';
import './EyeCare.css';

const EyeCare = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="eyecare-page">
      <motion.div 
        className="eyecare-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="eyecare-hero" variants={itemVariants}>
          <h1 className="gradient-text">Eye Care Intelligence</h1>
          <p>Comprehensive guide to understanding and preventing digital eye strain in the modern world.</p>
        </motion.div>

        <div className="eyecare-grid">
          {/* What is Digital Eye Strain */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">🖥️</div>
            <h3>What is Digital Eye Strain?</h3>
            <p>Also known as Computer Vision Syndrome (CVS), it refers to a group of eye and vision-related problems that result from prolonged computer, tablet, e-reader, and cell phone use.</p>
          </motion.div>

          {/* Causes */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">⚠️</div>
            <h3>Causes of Eye Strain</h3>
            <ul className="info-list">
              <li>Poor lighting and glare on digital screens</li>
              <li>Improper viewing distances</li>
              <li>Poor seating posture</li>
              <li>Uncorrected vision problems</li>
              <li>Decreased blink rate while using screens</li>
            </ul>
          </motion.div>

          {/* Symptoms */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">🌡️</div>
            <h3>Common Symptoms</h3>
            <div className="symptoms-grid">
              <span className="symptom-tag">Eyestrain</span>
              <span className="symptom-tag">Headaches</span>
              <span className="symptom-tag">Blurred Vision</span>
              <span className="symptom-tag">Dry Eyes</span>
              <span className="symptom-tag">Neck & Shoulder Pain</span>
            </div>
          </motion.div>

          {/* Prevention Tips */}
          <motion.div className="eyecare-card glass-card featured-card" variants={itemVariants}>
            <div className="card-icon">🛡️</div>
            <h3>Prevention Tips</h3>
            <ul className="info-list">
              <li><strong>The 20-20-20 Rule:</strong> Every 20 minutes, look at something 20 feet away for 20 seconds.</li>
              <li>Adjust screen brightness to match room lighting.</li>
              <li>Maintain a "high-five" distance (about an arm's length) from the screen.</li>
              <li>Use artificial tears to lubricate dry eyes.</li>
            </ul>
          </motion.div>

          {/* Food for Eye Health */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">🥕</div>
            <h3>Foods for Eye Health</h3>
            <p>Nutrition plays a vital role in preserving vision. Incorporate these into your diet:</p>
            <div className="food-grid">
              <div className="food-item">🥬 Leafy Greens (Lutein)</div>
              <div className="food-item">🐟 Fatty Fish (Omega-3)</div>
              <div className="food-item">🍊 Citrus Fruits (Vit C)</div>
              <div className="food-item">🥕 Carrots (Beta-carotene)</div>
              <div className="food-item">🥚 Eggs (Zinc)</div>
            </div>
          </motion.div>

          {/* Screen Time for Students */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">⏱️</div>
            <h3>Recommended Screen Time</h3>
            <p>For students, balance is key to academic success and physical health:</p>
            <div className="limit-box">
              <span className="limit-val">2 Hours</span>
              <span className="limit-label">Max Non-Academic Screen Time</span>
            </div>
            <p className="limit-note">Ensure high-quality sleep (8-9 hours) to allow ocular recovery.</p>
          </motion.div>

          {/* Importance of Detection */}
          <motion.div className="eyecare-card glass-card importance-card" variants={itemVariants}>
            <div className="card-icon">🔬</div>
            <h3>Importance of Detection</h3>
            <p>Early detection of eye strain patterns can prevent long-term vision deterioration, improve academic focus, and reduce chronic headaches. Our AI system provides the first line of defense in identifying these risks early.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EyeCare;
