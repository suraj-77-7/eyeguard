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
          <h1 className="gradient-text" style={{
            background: 'linear-gradient(135deg, #00d9ff 0%, #ff006e 50%, #8338ec 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '3.5rem'
          }}>Eye Care Intelligence</h1>
          <p style={{ fontSize: '1.1rem', color: '#a0aec0' }}>Comprehensive guide to understanding and preventing digital eye strain in the modern world.</p>
        </motion.div>

        <div className="eyecare-grid">
          {/* What is Digital Eye Strain */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">🖥️</div>
            <h3>What is Digital Eye Strain?</h3>
            <p>Also known as Computer Vision Syndrome (CVS), it refers to a group of eye and vision-related problems that result from prolonged computer, tablet, e-reader, and cell phone use. Affects 60% of heavy screen users.</p>
            <div className="card-detail">
              <strong>Medical Name:</strong> Asthenopia
            </div>
          </motion.div>

          {/* Causes */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">⚠️</div>
            <h3>Causes of Eye Strain</h3>
            <ul className="info-list">
              <li>Poor lighting and glare on digital screens</li>
              <li>Improper viewing distances (too close or too far)</li>
              <li>Poor seating posture and neck angle</li>
              <li>Uncorrected vision problems</li>
              <li>Decreased blink rate while using screens (66% reduction)</li>
              <li>Blue light emission from screens</li>
              <li>Screen flicker and refresh rates</li>
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
              <span className="symptom-tag">Double Vision</span>
              <span className="symptom-tag">Light Sensitivity</span>
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
              <li>Enable blue light filter after 6 PM</li>
              <li>Blink consciously - aim for 15-20 blinks per minute</li>
            </ul>
          </motion.div>

          {/* Eye Exercises */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">💪</div>
            <h3>Eye Strengthening Exercises</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><strong>Palming:</strong> Close eyes and cover with palms for 30 seconds, 3x daily</div>
              <div><strong>Focus Shifts:</strong> Look at object 2ft away, then 10ft away, repeat 10 times</div>
              <div><strong>Eye Rolls:</strong> Rotate eyes clockwise 10 times, then counterclockwise 10 times</div>
              <div><strong>Figure-8:</strong> Trace imaginary figure-8 with your vision for 1 minute</div>
              <div><strong>Blinking Exercises:</strong> 10 rapid blinks, then close eyes for 2 seconds, repeat 5 times</div>
            </div>
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
              <div className="food-item">🫐 Blueberries (Anthocyanins)</div>
              <div className="food-item">🌰 Nuts (Vitamin E)</div>
              <div className="food-item">🍅 Tomatoes (Lycopene)</div>
            </div>
          </motion.div>

          {/* Ergonomic Setup */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">🪑</div>
            <h3>Ideal Ergonomic Setup</h3>
            <ul className="info-list">
              <li><strong>Screen Height:</strong> Top of screen at or slightly below eye level</li>
              <li><strong>Screen Distance:</strong> 20-28 inches (50-70 cm) from eyes</li>
              <li><strong>Screen Angle:</strong> Slight downward tilt (10-20 degrees)</li>
              <li><strong>Chair Height:</strong> Feet flat on floor, thighs parallel to ground</li>
              <li><strong>Ambient Light:</strong> 300-500 lux (avoid direct glare)</li>
              <li><strong>Keyboard/Mouse:</strong> Elbows at 90 degrees</li>
            </ul>
          </motion.div>

          {/* Blue Light Facts */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">💙</div>
            <h3>Understanding Blue Light</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><strong>What is it?</strong> High-energy visible light (380-500nm wavelength)</div>
              <div><strong>Sources:</strong> Phones, tablets, computers, LED lights</div>
              <div><strong>Effects:</strong> Disrupts circadian rhythm, reduces melatonin</div>
              <div><strong>Solutions:</strong> Blue light glasses, screen filters, night mode</div>
              <div><strong>Best Practice:</strong> Avoid screens 1 hour before sleep</div>
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
            <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#a0aec0' }}>
              <p><strong>Sleep Quality:</strong> Ensure 8-9 hours of high-quality sleep for ocular recovery</p>
              <p><strong>Academic Screen:</strong> 30 min focused work = 5 min break</p>
            </div>
          </motion.div>

          {/* Dry Eye Syndrome */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">💧</div>
            <h3>Dry Eye Syndrome Details</h3>
            <ul className="info-list">
              <li><strong>Definition:</strong> Insufficient tear production or poor tear quality</li>
              <li><strong>Prevalence:</strong> Affects 16-30% of screen users</li>
              <li><strong>Causes:</strong> Reduced blinking, warm air, poor humidity</li>
              <li><strong>Treatment:</strong> Artificial tears, warm compresses, humidifiers</li>
              <li><strong>Prevention:</strong> Remember to blink! Use lubricating drops every 2 hours</li>
            </ul>
          </motion.div>

          {/* When to Visit Eye Doctor */}
          <motion.div className="eyecare-card glass-card featured-card" variants={itemVariants}>
            <div className="card-icon">👨‍⚕️</div>
            <h3>When to Visit an Optometrist</h3>
            <ul className="info-list">
              <li>Annual comprehensive eye exam (even without symptoms)</li>
              <li>Persistent blurred vision lasting more than 1 week</li>
              <li>Frequent headaches after screen use</li>
              <li>Sudden changes in color perception</li>
              <li>Flashes of light or new floaters</li>
              <li>Eye pain or significant discomfort</li>
              <li>Before prescription changes</li>
            </ul>
          </motion.div>

          {/* Age-Specific Recommendations */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">👶</div>
            <h3>Age-Specific Eye Care</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div><strong>Children (6-12):</strong> Max 2 hours screen/day, outdoor time 2+ hours</div>
              <div><strong>Teens (13-18):</strong> Every 30 min screen = 5 min break, 8hr+ sleep</div>
              <div><strong>Young Adults (19-25):</strong> Annual checkups, monitor strain patterns</div>
              <div><strong>Adults (26+):</strong> Bi-annual exams, presbyopia awareness</div>
            </div>
          </motion.div>

          {/* Vision Correction Options */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">👓</div>
            <h3>Vision Correction Options</h3>
            <ul className="info-list">
              <li><strong>Glasses:</strong> Blue light filters, anti-glare coatings recommended</li>
              <li><strong>Contact Lenses:</strong> Requires proper moisture; use lubricants</li>
              <li><strong>Computer Glasses:</strong> Optimized for 20-26 inch distance</li>
              <li><strong>Multifocal Lenses:</strong> For presbyopia (age 40+)</li>
              <li><strong>LASIK/PRK:</strong> Consult optometrist for eligibility</li>
            </ul>
          </motion.div>

          {/* Checkup Schedule */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">📅</div>
            <h3>Eye Checkup Schedule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(0, 217, 255, 0.1)', borderRadius: '8px' }}>
                <strong>No Vision Problems:</strong> Every 1-2 years
              </div>
              <div style={{ padding: '12px', backgroundColor: 'rgba(255, 0, 110, 0.1)', borderRadius: '8px' }}>
                <strong>With Corrections:</strong> Every 1 year
              </div>
              <div style={{ padding: '12px', backgroundColor: 'rgba(131, 56, 236, 0.1)', borderRadius: '8px' }}>
                <strong>Heavy Screen Users:</strong> Every 6 months
              </div>
              <div style={{ padding: '12px', backgroundColor: 'rgba(0, 217, 255, 0.1)', borderRadius: '8px' }}>
                <strong>Age 40+:</strong> Every 1-2 years
              </div>
            </div>
          </motion.div>

          {/* Importance of Detection */}
          <motion.div className="eyecare-card glass-card importance-card" variants={itemVariants}>
            <div className="card-icon">🔬</div>
            <h3>Importance of Digital Detection</h3>
            <p>Early detection of eye strain patterns can prevent long-term vision deterioration, improve academic focus, and reduce chronic headaches. Our AI system provides the first line of defense in identifying these risks early, enabling preventive measures before conditions worsen.</p>
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#a0aec0' }}>
              <p>✓ 89% accuracy in early strain detection</p>
              <p>✓ Personalized intervention recommendations</p>
              <p>✓ Track improvement over time</p>
            </div>
          </motion.div>

          {/* Quick Reference */}
          <motion.div className="eyecare-card glass-card" variants={itemVariants}>
            <div className="card-icon">📋</div>
            <h3>Daily Eye Care Checklist</h3>
            <ul className="info-list">
              <li>☐ Apply 20-20-20 rule every work session</li>
              <li>☐ Blink consciously 15-20 times per minute</li>
              <li>☐ Adjust screen brightness to room lighting</li>
              <li>☐ Maintain proper posture and screen distance</li>
              <li>☐ Use artificial tears if eyes feel dry</li>
              <li>☐ Perform eye exercises 2-3 times daily</li>
              <li>☐ Eat eye-healthy foods</li>
              <li>☐ Sleep 7-9 hours with proper darkness</li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EyeCare;
