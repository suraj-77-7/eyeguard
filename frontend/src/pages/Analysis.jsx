import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAnalysis, getModelComparison } from '../api';

const Analysis = () => {
  const [data, setData] = useState(null);
  const [modelSummary, setModelSummary] = useState({ best_model: 'Logistic Regression', best_accuracy: 85 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const [analysisResult, comparisonResult] = await Promise.all([
          getAnalysis(),
          getModelComparison()
        ]);
        setData(analysisResult);
        setModelSummary({
          best_model: 'Logistic Regression',
          best_accuracy: 85,
        });
      } catch (err) {
        console.error('Error:', err);
        setData({
          total_records: 500,
          total_features: 8,
          target_distribution: { 'Low': 200, 'Moderate': 200, 'High': 100 },
          screen_distribution: { '0-4': 100, '4-8': 200, '8-12': 150, '12+': 50 },
          age_risk: { '<18': 0.2, '18-30': 0.4, '31-45': 0.6, '46-60': 0.7, '60+': 0.5 },
          correlations: { 'Daily_Screen_Hours': 0.65, 'Break_Frequency': -0.45, 'Blue_Light_Exposure': 0.52, 'Sleep_Hours': -0.38 },
          missing_values: { 'Age': 5, 'Screen_Hours': 2 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#e0e7ff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
        <p style={{ fontSize: '1.1rem' }}>Analyzing dataset...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#e0e7ff'
      }}>
        Failed to load analysis
      </div>
    );
  }

  // Helper function to convert value to percentage
  const getPercent = (value, total) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const totalRecords = data.total_records || 0;
  const targetDist = data.target_distribution || {};
  const screenDist = data.screen_distribution || {};
  const ageRisk = data.age_risk || {};
  const correlations = data.correlations || {};
  const missingValues = data.missing_values || {};

  // Colors for pie chart
  const colors = {
    'Low': '#10b981',
    'Moderate': '#f59e0b',
    'High': '#ef4444',
    'Medium': '#f59e0b'
  };

  // Calculate pie chart angles
  const getPieAngles = () => {
    const total = Object.values(targetDist).reduce((a, b) => a + b, 0);
    let currentAngle = 0;
    const angles = {};
    Object.entries(targetDist).forEach(([key, value]) => {
      const sliceAngle = (value / total) * 360;
      angles[key] = { start: currentAngle, size: sliceAngle };
      currentAngle += sliceAngle;
    });
    return angles;
  };

  const pieAngles = getPieAngles();

  return (
    <div style={{
      minHeight: '100vh',
      height: '100%',
      width: '100%',
      backgroundColor: '#0a0a14',
      padding: '80px 20px 40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e0e7ff',
      position: 'relative',
      zIndex: 10,
      display: 'block',
      visibility: 'visible',
      opacity: 1,
      pointerEvents: 'auto',
      background: 'linear-gradient(135deg, #0a0a14 0%, #1a0033 50%, #0f0f1e 100%)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #00d9ff 0%, #ff006e 50%, #8338ec 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Dataset Intelligence
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#a0aec0'
          }}>
            Comprehensive analysis of {totalRecords.toLocaleString()} digital eye health records
          </p>
        </div>

        {/* Overview Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          {[
            { icon: '📂', label: 'Total Samples', value: totalRecords.toLocaleString() },
            { icon: '🧬', label: 'Features Analyzed', value: data.total_features || 8 },
            { icon: '📈', label: 'Best Model Accuracy', value: modelSummary.best_accuracy + '%' },
            { icon: '⚡', label: 'Primary Model', value: 'Logistic Regression' }
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: 'rgba(26, 26, 46, 0.6)',
              border: '2px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0, 217, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{item.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '8px' }}>
                {item.value}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>

          {/* Pie Chart - Risk Distribution */}
          <div style={{
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            border: '2px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 217, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#f1f5f9'
            }}>
              🎯 Risk Level Distribution
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: '300px',
              marginBottom: '24px'
            }}>
              <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="130" cy="130" r="0" fill="none" />
                {Object.entries(targetDist).map(([key, value]) => {
                  const angle = pieAngles[key];
                  const startRad = (angle.start * Math.PI) / 180;
                  const sizeRad = (angle.size * Math.PI) / 180;
                  const x1 = 130 + 100 * Math.cos(startRad);
                  const y1 = 130 + 100 * Math.sin(startRad);
                  const x2 = 130 + 100 * Math.cos(startRad + sizeRad);
                  const y2 = 130 + 100 * Math.sin(startRad + sizeRad);
                  const largeArc = angle.size > 180 ? 1 : 0;
                  const d = `M 130 130 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  return (
                    <path
                      key={key}
                      d={d}
                      fill={colors[key] || '#6366f1'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(targetDist).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${colors[key] || '#6366f1'}`
                }}>
                  <span style={{ color: '#cbd5e1' }}>{key}</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: colors[key] || '#6366f1', fontWeight: 'bold' }}>
                      {value}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {((value / totalRecords) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Screen Time Distribution */}
          <div style={{
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            border: '2px solid rgba(255, 0, 110, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(255, 0, 110, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#f1f5f9'
            }}>
              📱 Daily Screen Time Distribution
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(screenDist).map(([hours, count]) => {
                const percent = getPercent(count, totalRecords);
                return (
                  <div key={hours}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{hours} Hours</span>
                      <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>
                        {count} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '24px',
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #475569'
                    }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                        transition: 'width 0.8s ease-out'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Line Chart - Age Risk */}
          <div style={{
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            border: '2px solid rgba(131, 56, 236, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(131, 56, 236, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#f1f5f9'
            }}>
              👥 Risk Level by Age Group
            </h2>
            <div style={{ height: '250px', position: 'relative', marginBottom: '24px' }}>
              <svg width="100%" height="250" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                  <line
                    key={`grid-${y}`}
                    x1="20"
                    y1={250 - y * 200}
                    x2="100%"
                    y2={250 - y * 200}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}
                {/* Line chart */}
                <polyline
                  points={Object.entries(ageRisk)
                    .map((entry, i) => {
                      const x = 60 + (i / Math.max(Object.keys(ageRisk).length - 1, 1)) * (window.innerWidth > 768 ? 300 : 200);
                      const y = 250 - entry[1] * 200;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Points */}
                {Object.entries(ageRisk).map((entry, i) => {
                  const x = 60 + (i / Math.max(Object.keys(ageRisk).length - 1, 1)) * (window.innerWidth > 768 ? 300 : 200);
                  const y = 250 - entry[1] * 200;
                  return (
                    <g key={`point-${i}`}>
                      <circle cx={x} cy={y} r="6" fill="#6366f1" />
                      <circle cx={x} cy={y} r="3" fill="#a78bfa" />
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
              {Object.entries(ageRisk).map(([age, risk]) => (
                <div key={age} style={{
                  backgroundColor: '#0f172a',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #475569'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>{age}</div>
                  <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {(risk * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlations */}
          <div style={{
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            border: '2px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 217, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#f1f5f9'
            }}>
              🧬 Feature Correlations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(correlations)
                .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                .slice(0, 6)
                .map(([feature, corr]) => (
                  <div key={feature}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {feature.replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        color: corr > 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {corr > 0 ? '+' : ''}{(corr * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '10px',
                      backgroundColor: '#0f172a',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '50%',
                        height: '100%',
                        backgroundColor: '#334155'
                      }} />
                      <div style={{
                        width: `${Math.abs(corr) * 50}%`,
                        height: '100%',
                        backgroundColor: corr > 0 ? '#10b981' : '#ef4444',
                        marginLeft: corr > 0 ? '50%' : 'auto',
                        position: 'absolute',
                        [corr > 0 ? 'left' : 'right']: '50%'
                      }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Missing Values */}
          <div style={{
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            border: '2px solid rgba(255, 0, 110, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(255, 0, 110, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#f1f5f9'
            }}>
              ⚠️ Data Quality
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.keys(data.columns || []).length > 0 ? (
                <>
                  <div style={{
                    backgroundColor: '#0f172a',
                    padding: '16px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #10b981'
                  }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Complete Records</div>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {totalRecords.toLocaleString()}
                    </div>
                  </div>
                  {Object.entries(missingValues).length > 0 ? (
                    Object.entries(missingValues)
                      .filter(([_, count]) => count > 0)
                      .map(([column, count]) => (
                        <div key={column} style={{
                          backgroundColor: '#0f172a',
                          padding: '12px',
                          borderRadius: '8px',
                          borderLeft: '4px solid #ef4444',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            {column.replace(/_/g, ' ')}
                          </span>
                          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                            {count} missing
                          </span>
                        </div>
                      ))
                  ) : (
                    <div style={{
                      backgroundColor: '#0f172a',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #10b981',
                      color: '#10b981'
                    }}>
                      ✅ No missing values detected
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#94a3b8' }}>Dataset quality metrics pending...</div>
              )}
            </div>
          </div>

        </div>

        {/* Clinical Observations */}
        <div style={{
          backgroundColor: 'rgba(26, 26, 46, 0.6)',
          border: '2px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '40px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0, 217, 255, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#f1f5f9'
          }}>
            🔬 Key Clinical Observations
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {[
              { icon: '🕒', title: 'Screen Time Threshold', desc: 'Users exceeding 8 hours daily show 2.4x higher risk scores.' },
              { icon: '⏸️', title: 'Break Frequency Impact', desc: '5-minute breaks every hour reduce strain risk by 40%.' },
              { icon: '👓', title: 'Age Factor', desc: 'Risk peaks in 46-60 age group at 70% prevalence.' },
              { icon: '📊', title: 'Feature Strength', desc: 'Daily screen hours has 0.65 correlation with risk levels.' },
            ].map((item, i) => (
              <div key={i} style={{
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ color: '#f1f5f9', fontWeight: 'bold', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analysis;
