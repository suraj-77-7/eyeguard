import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedPage from '../components/AnimatedPage';

const Dashboard = () => {
    const { user } = useAuth() || {};

    return (
        <AnimatedPage>
            <div className="dashboard">
                <h1>Dashboard</h1>
                <p>Welcome {user?.name ? `back, ${user.name}` : 'to your eye health dashboard'}!</p>
                <div className="dashboard-links">
                    <Link to="/predict">Predict Eye Health</Link>
                    <Link to="/analysis">Analysis</Link>
                    <Link to="/models">Model Comparison</Link>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Dashboard;