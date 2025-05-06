import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserScore } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchScore = async () => {
            try {
                const data = await getUserScore();
                setScore(data.total_score);
            } catch (err) {
                setError('Failed to fetch score.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchScore();
    }, []);

    return (
        <div className="dashboard-container">
            <h1>Welcome, {email}</h1>
            <p>Your Role: {role}</p>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            {score !== null && <p>Your Total Score: {score}</p>}
            <nav>
                <Link to="/waste">Log Waste</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/challenges">Challenges</Link>
                <Link to="/leaderboard">Leaderboard</Link>
            </nav>
        </div>
    );
};

export default Dashboard;