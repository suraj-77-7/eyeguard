import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { predict, getRecommendations } from '../api';
import './Predict.css';

const Predict = () => {
    const initialForm = {
        Age: 25,
        Screen_Time: 6,
        Breaks: 2,
        Blue_Light_Filter: false,
        Gender: 0,
        Eye_Dryness_Level: 0,
        Eye_Pain_Level: 0,
        Headache_Frequency_Per_Week: 0,
        Blurred_Vision: 0,
        Sleep_Hours: 8,
        Eye_Checkup_Last_Year: 0
    };

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [riskPercent, setRiskPercent] = useState(0);
    const [recs, setRecs] = useState([]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPrediction(null);

        try {
            const payloadFeatures = {
                Daily_Screen_Hours: Number(formData.Screen_Time),
                Break_Frequency_Per_Hour: Number(formData.Breaks),
                Blue_Light_Filter_Used: formData.Blue_Light_Filter ? 1 : 0,
                Eye_Dryness_Level: Number(formData.Eye_Dryness_Level),
                Eye_Pain_Level: Number(formData.Eye_Pain_Level),
                Headache_Frequency_Per_Week: Number(formData.Headache_Frequency_Per_Week),
                Blurred_Vision: Number(formData.Blurred_Vision),
                Age: Number(formData.Age),
                Gender: Number(formData.Gender),
                Sleep_Hours: Number(formData.Sleep_Hours),
                Eye_Checkup_Last_Year: Number(formData.Eye_Checkup_Last_Year)
            };

            const data = await predict({ features: payloadFeatures });

            if (data?.results) {
                setPrediction(data);
                const bestResult = data.results['Logistic Regression'] || Object.values(data.results)[0];
                setRiskPercent(bestResult?.damage_percent || 0);

                // Fetch recommendations
                const recData = await getRecommendations({
                    features: payloadFeatures,
                    risk_level: bestResult?.risk_level
                });
                setRecs(recData.recommendations || []);

                toast.success('ML Analysis Complete');
            }
        } catch (err) {
            toast.error(err.message || 'Prediction failed');
        } finally {
            setLoading(false);
        }
    };

    const bestModelResult = prediction?.results
        ? (prediction.results['Logistic Regression'] || Object.values(prediction.results)[0])
        : null;

    return (
        <div className="predict-page">
            <div className="predict-container">
                <motion.div
                    className="predict-form-section animate-fade-up"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>Vision Analyzer</h1>
                    <p className="predict-desc">
                        Provide your digital habits below. Our advanced logistic regression model will analyze the patterns to estimate your eye strain risk.
                    </p>

                    <form className="predict-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label>Daily Screen Hours</label>
                            <input
                                type="range" min="1" max="16" step="0.5"
                                value={formData.Screen_Time}
                                onChange={(e) => handleChange('Screen_Time', e.target.value)}
                            />
                            <span className="value-display">{formData.Screen_Time}h</span>
                        </div>

                        <div className="form-row">
                            <label>Breaks per Hour</label>
                            <input
                                type="range" min="0" max="10" step="1"
                                value={formData.Breaks}
                                onChange={(e) => handleChange('Breaks', e.target.value)}
                            />
                            <span className="value-display">{formData.Breaks}</span>
                        </div>

                        <div className="form-row">
                            <label>Eye Pain Level (0-10)</label>
                            <input
                                type="range" min="0" max="10"
                                value={formData.Eye_Pain_Level}
                                onChange={(e) => handleChange('Eye_Pain_Level', e.target.value)}
                            />
                            <span className="value-display">{formData.Eye_Pain_Level}</span>
                        </div>

                        <div className="form-row">
                            <label>Dryness Level (0-10)</label>
                            <input
                                type="range" min="0" max="10"
                                value={formData.Eye_Dryness_Level}
                                onChange={(e) => handleChange('Eye_Dryness_Level', e.target.value)}
                            />
                            <span className="value-display">{formData.Eye_Dryness_Level}</span>
                        </div>

                        <div className="form-row">
                            <label>Age</label>
                            <input
                                type="number"
                                value={formData.Age}
                                onChange={(e) => handleChange('Age', e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div className="form-row">
                            <label>Sleep Hours</label>
                            <input
                                type="range" min="3" max="12" step="0.5"
                                value={formData.Sleep_Hours}
                                onChange={(e) => handleChange('Sleep_Hours', e.target.value)}
                            />
                            <span className="value-display">{formData.Sleep_Hours}h</span>
                        </div>

                        <div className="form-row">
                            <label>Headache Frequency / Week</label>
                            <input
                                type="range" min="0" max="7" step="1"
                                value={formData.Headache_Frequency_Per_Week}
                                onChange={(e) => handleChange('Headache_Frequency_Per_Week', e.target.value)}
                            />
                            <span className="value-display">{formData.Headache_Frequency_Per_Week}</span>
                        </div>

                        <div className="form-row">
                            <label>Blue Light Filter</label>
                            <select value={formData.Blue_Light_Filter} onChange={(e) => handleChange('Blue_Light_Filter', e.target.value === 'true')}>
                                <option value={false}>Not Used</option>
                                <option value={true}>Used</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <label>Gender</label>
                            <select value={formData.Gender} onChange={(e) => handleChange('Gender', e.target.value)}>
                                <option value={0}>Male</option>
                                <option value={1}>Female</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <label>Blurred Vision</label>
                            <select value={formData.Blurred_Vision} onChange={(e) => handleChange('Blurred_Vision', e.target.value)}>
                                <option value={0}>No</option>
                                <option value={1}>Yes</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <label>Eye Checkup Last Year</label>
                            <select value={formData.Eye_Checkup_Last_Year} onChange={(e) => handleChange('Eye_Checkup_Last_Year', e.target.value)}>
                                <option value={0}>No</option>
                                <option value={1}>Yes</option>
                            </select>
                        </div>

                        <div className="form-submit-row">
                            <button type="submit" className="btn-premium btn-predict" disabled={loading}>
                                {loading ? 'Analyzing Habits...' : 'Run ML Diagnosis'}
                            </button>
                        </div>
                    </form>
                </motion.div>

                <div className="predict-results-section">
                    <AnimatePresence mode="wait">
                        {prediction ? (
                            <motion.div
                                className="result-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="result-header">
                                    <h2>Diagnosis Result</h2>
                                </div>

                                <div className="risk-gauge-container">
                                    <svg className="gauge-svg" width="220" height="220">
                                        <circle className="gauge-bg" cx="110" cy="110" r="100" />
                                        <circle
                                            className="gauge-fill"
                                            cx="110" cy="110" r="100"
                                            style={{
                                                strokeDasharray: 628,
                                                strokeDashoffset: 628 - (628 * riskPercent) / 100,
                                                stroke: riskPercent > 65 ? '#f43f5e' : riskPercent > 35 ? '#f59e0b' : '#10b981'
                                            }}
                                        />
                                    </svg>
                                    <div className="gauge-content">
                                        <span className="risk-percent">{Math.round(riskPercent)}%</span>
                                        <span className="risk-label">Strain Risk</span>
                                    </div>
                                </div>

                                <div className="result-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Risk Level</span>
                                        <span className="detail-val" style={{ color: riskPercent > 65 ? '#f43f5e' : riskPercent > 35 ? '#f59e0b' : '#10b981' }}>
                                            {bestModelResult?.risk_level}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Confidence</span>
                                        <span className="detail-val">{bestModelResult?.confidence}%</span>
                                    </div>
                                </div>

                                <div className="ml-insight animate-fade-in delay-2" style={{ marginTop: '32px', textAlign: 'left' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '8px' }}>🤖 ML Insight</h4>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {riskPercent > 60
                                            ? "Critical risk detected. Recommend immediate screen reduction and 20-20-20 rule implementation."
                                            : riskPercent > 30
                                                ? "Moderate strain patterns found. Consider blue light filters and regular hydration."
                                                : "Optimal vision habits detected. Keep maintaining your current digital ergonomics."}
                                    </p>
                                </div>

                                {/* NEW: Tailored Recommendations */}
                                {recs.length > 0 && (
                                    <div className="tailored-recs animate-fade-in delay-2" style={{ marginTop: '24px', textAlign: 'left' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '12px' }}>🛡️ Personalized Actions</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {recs.map((r, i) => (
                                                <div key={i} style={{ padding: '12px', background: 'var(--dark-lighter)', borderRadius: '8px', borderLeft: `4px solid ${r.impact === 'High' ? '#f43f5e' : r.impact === 'Medium' ? '#f59e0b' : '#10b981'}` }}>
                                                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '4px' }}>{r.title}</span>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--gray)', margin: 0 }}>{r.advice}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="result-placeholder glass-card">
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>👁️‍🗨️</span>
                                <h3>Awaiting Input</h3>
                                <p style={{ color: 'var(--gray)' }}>Fill the form and run diagnosis to see your personalized eye health report.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Predict;
