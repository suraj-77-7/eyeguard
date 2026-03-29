import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getModelComparison } from '../api';
import './ModelComparison.css';

const MODEL_COLORS = { 'Logistic Regression': '#6366f1', 'SVM': '#8b5cf6', 'XGBoost': '#14b8a6' };
const MODEL_ICONS = { 'Logistic Regression': '📈', 'SVM': '🎯', 'XGBoost': '⚡' };
const METRICS = ['accuracy', 'precision', 'recall', 'f1_score'];

const ModelComparison = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getModelComparison();
        setData(result);
      } catch (err) {
        toast.error('Failed to load model performance metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-loader"><div className="loader-ring" /><p>Evaluating ML Engines...</p></div>;

  const models = data?.comparison || data;
  if (!models || Object.keys(models).length === 0) {
    return (
      <div className="page-error">
        ❌ ML engines offline or no performance data available.
        <br />
        <button onClick={() => window.location.reload()} className="btn-retry">Re-initialize</button>
      </div>
    );
  }

  const bestName = data?.best_model || Object.keys(models)[0];
  const bestData = models[bestName] || Object.values(models)[0] || {};

  return (
    <div className="mc-page">
      <div className="mc-container">
        <div className="mc-hero animate-fade-up">
          <h1 className="gradient-text">Model Performance Intelligence</h1>
          <p>Advanced metrics comparison of our core diagnostic engines.</p>
        </div>

        <div className="mc-best-summary animate-fade-up">
          <h3>🏆 Best Performing Model</h3>
          <p>
            {bestName && <><strong>{bestName}</strong> with <strong>{bestData?.accuracy?.toFixed ? bestData.accuracy.toFixed(2) : bestData.accuracy}%</strong> accuracy.</>}
            {!bestName && 'No best model selected.'}
          </p>
        </div>

        {/* New Horizontal Grouped Comparison Chart */}
        <motion.div
          className="mc-main-chart-card animate-fade-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>📊 Comparative Performance Matrix</h2>
          <div className="performance-matrix">
            {METRICS.map((metric, mi) => (
              <div className="matrix-row" key={metric}>
                <div className="matrix-label">
                  <span className="metric-name">{metric.replace('_', ' ')}</span>
                </div>
                <div className="matrix-bars-container">
                  {Object.entries(models).map(([name, m], i) => (
                    <div className="matrix-bar-group" key={name}>
                      <div className="bar-info">
                        <span className="model-abbr">{name.split(' ')[0]}</span>
                        <span className="model-val">{m[metric] || 0}%</span>
                      </div>
                      <div className="matrix-bar-track">
                        <motion.div
                          className="matrix-bar-fill"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m[metric] || 0}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.1 + mi * 0.1 + i * 0.1 }}
                          style={{
                            background: MODEL_COLORS[name],
                            boxShadow: `0 0 10px ${MODEL_COLORS[name]}44`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="matrix-legend">
            {Object.entries(MODEL_COLORS).map(([name, color]) => (
              <span className="legend-item" key={name}>
                <span className="legend-dot" style={{ background: color }} />
                {name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Model Cards Grid */}
        <div className="mc-grid">
          {Object.entries(models).map(([name, m], i) => {
            const isBest = name === bestName;
            return (
              <motion.div
                className={`mc-card ${isBest ? 'mc-card-best' : ''}`}
                key={name}
                style={{ borderTopColor: MODEL_COLORS[name] || '#ccc' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="card-header">
                  <span className="card-icon" style={{ background: MODEL_COLORS[name] || '#666' }}>{MODEL_ICONS[name] || '📌'}</span>
                  <h3>{name}</h3>
                  {isBest && <span className="best-chip">Best</span>}
                </div>

              <div className="mc-metrics">
                {METRICS.map(metric => (
                  <div className="mc-metric-row" key={metric}>
                    <div className="mc-metric-info">
                      <span className="mc-metric-label">{metric.replace('_', ' ')}</span>
                      <span className="mc-metric-val">{m[metric] || 0}%</span>
                    </div>
                    <div className="mc-bar-track">
                      <motion.div
                        className="mc-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${m[metric] || 0}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                        style={{ background: MODEL_COLORS[name] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelComparison;
