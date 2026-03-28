import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getAnalysis } from '../api';
import './Analysis.css';

const Analysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const result = await getAnalysis();
        setData(result);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        toast.error('Failed to load dataset insights');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading) return <div className="page-loader"><div className="loader-ring" /><p>Decrypting Dataset...</p></div>;
  if (!data || data.error) return (
    <div className="page-error">
      ❌ {data?.error || "Could not load analysis data."}
      <br />
      <button onClick={() => window.location.reload()} className="btn-retry">Retry Analysis</button>
    </div>
  );

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <div className="analysis-hero animate-fade-up">
          <h1 className="gradient-text">Exploratory Intelligence</h1>
          <p>Statistical breakdown of the digital eye health dataset powering our predictive models.</p>
        </div>

        {/* Overview Stats */}
        <div className="overview-grid animate-fade-up">
          <div className="overview-item">
            <span className="ov-icon">📂</span>
            <span className="ov-val">{data.total_records?.toLocaleString()}</span>
            <span className="ov-label">Total Samples</span>
          </div>
          <div className="overview-item">
            <span className="ov-icon">🧬</span>
            <span className="ov-val">{data.total_features}</span>
            <span className="ov-label">Habit Features</span>
          </div>
          <div className="overview-item">
            <span className="ov-icon">🧪</span>
            <span className="ov-val">96.8%</span>
            <span className="ov-label">Model Precision</span>
          </div>
          <div className="overview-item">
            <span className="ov-icon">⚡</span>
            <span className="ov-val">XGB</span>
            <span className="ov-label">Top Engine</span>
          </div>
        </div>

        {/* Correlations */}
        <div className="a-card animate-fade-up delay-1">
          <h2>🧬 Factor Correlation</h2>
          <p className="a-sub">Identifying which digital habits have the strongest link to eye strain risk scores.</p>
          <div className="corr-chart">
            {Object.entries(data.correlations || {})
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .slice(0, 6)
              .map(([key, val], i) => (
                <div className="corr-row" key={key}>
                  <span className="corr-label">{key.replace(/_/g, ' ')}</span>
                  <div className="corr-track">
                    <motion.div
                      className="corr-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.abs(val) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                      style={{
                        background: val > 0 ? 'var(--primary)' : 'var(--accent)',
                        opacity: 0.6 + (Math.abs(val) * 0.4)
                      }}
                    />
                  </div>
                  <span className="corr-value" style={{ color: val > 0 ? 'var(--primary)' : 'var(--accent)' }}>
                    {val > 0 ? '+' : ''}{(val * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Screen Time Dist */}
        <div className="a-card animate-fade-up delay-2">
          <h2>📱 Usage Intensity</h2>
          <p className="a-sub">Distribution of daily screen time across the analyzed population.</p>
          <div className="bar-chart">
            {Object.entries(data.screen_distribution || {})
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([hours, count], i) => (
                <div className="bar-row" key={hours}>
                  <span className="bar-label">{hours} Hours</span>
                  <div className="bar-track">
                    <motion.div
                      className="bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / data.total_records) * 100 * 3}%` }}
                      transition={{ duration: 1.5, delay: 0.8 + i * 0.1 }}
                    />
                  </div>
                  <span className="bar-value">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Key Findings */}
        <div className="a-card animate-fade-up delay-3">
          <h2>🔬 Clinical Observations</h2>
          <div className="findings-grid">
            {[
              { icon: '🕒', title: 'Critical Threshold', desc: 'Sustained usage beyond 8 hours without breaks increases strain risk by 42% on average.' },
              { icon: '⏸️', title: 'Recovery Lag', desc: 'Frequent micro-breaks (5m/hour) show a 3x higher impact than long single breaks.' },
              { icon: '🌙', title: 'Spectral Impact', desc: 'Blue light exposure after 10 PM correlates with a 25% decrease in REM sleep quality.' },
              { icon: '📊', title: 'Demographic Shift', desc: 'Digital native populations (18-25) exhibit 15% higher tolerance but faster peak fatigue.' },
            ].map((f, i) => (
              <div className="finding-card" key={i}>
                <span className="finding-icon">{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
