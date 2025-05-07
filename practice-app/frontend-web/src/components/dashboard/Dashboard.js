import React, { useState, useEffect } from 'react';
// Import NavLink for automatic active class styling in the sidebar
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getUserScore } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
       

        const fetchScore = async () => {
            setLoading(true);
            try {
                const data = await getUserScore();
                setScore(data.total_score);
                setError('');
            } catch (err)  {
                setError('Failed to fetch score. Please try again later.');
                console.error('Error fetching score:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchScore();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getScoreClass = (currentScore) => {
        if (currentScore === null) return 'score-na';
        if (currentScore >= 75) return 'high-score';
        if (currentScore >= 40) return 'medium-score';
        return 'low-score';
    };

    return (
        <div className="dashboard-page-wrapper">
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        GreenerLife
                    </Link>
                </div>
                <div className="sidebar-user-info">
                    <p className="user-email">{email || 'User'}</p>
                    <p className="user-role">{role || 'Member'}</p>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {/* Use NavLink for automatic active class */}
                        <li><NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}><span className="nav-icon">🏠</span> Dashboard</NavLink></li>
                        <li><NavLink to="/waste" className={({isActive}) => isActive ? "active" : ""}><span className="nav-icon">🗑️</span> Log Waste</NavLink></li>
                        <li><NavLink to="/profile" className={({isActive}) => isActive ? "active" : ""}><span className="nav-icon">👤</span> Profile</NavLink></li>
                        <li><NavLink to="/challenges" className={({isActive}) => isActive ? "active" : ""}><span className="nav-icon">🏆</span> Challenges</NavLink></li>
                        <li><NavLink to="/leaderboard" className={({isActive}) => isActive ? "active" : ""}><span className="nav-icon">📊</span> Leaderboard</NavLink></li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <span className="nav-icon">🚪</span> Logout
                    </button>
                </div>
            </aside>

            <main className="dashboard-main-content">
                <div className="main-content-header">
                    <h2><span className="leaf-icon">🌿</span> Your Eco Dashboard</h2>
                    <p>Welcome back, {email || 'User'}! Let's make a positive impact together.</p>
                </div>

                {loading && (
                    <div className="loader-container">
                        <div className="loader-spinner"></div>
                        <p>Loading your dashboard data...</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="error-message-box">
                        <span className="leaf-icon">⚠️</span> {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <section className="dashboard-content-section stats-section">
                            <h3 className="section-title"><span className="leaf-icon">🌟</span> Overview</h3>
                            <div className="stats-grid">
                                <div className={`stat-card score-card ${getScoreClass(score)}`}>
                                    <h4>Your Eco Score</h4>
                                    {score !== null ? (
                                        <span className="stat-value">{score}</span>
                                    ) : (
                                        <span className="stat-value-na">N/A</span>
                                    )}
                                    <p className="stat-label">points</p>
                                     {score === null && <small className="stat-subtext">Log waste to see your score!</small>}
                                </div>
                                {/* Add more stat cards here if you have other data */}
                                {/* <div className="stat-card">
                                    <h4>Items Logged</h4>
                                    <span className="stat-value">125</span>
                                    <p className="stat-label">this month</p>
                                </div>
                                <div className="stat-card">
                                    <h4>Challenges Joined</h4>
                                    <span className="stat-value">3</span>
                                    <p className="stat-label">active</p>
                                </div> */}
                            </div>
                        </section>

                        <section className="dashboard-content-section actions-section">
                            <h3 className="section-title"><span className="leaf-icon">🚀</span> Quick Actions</h3>
                            <div className="quick-actions-grid">
                                <Link to="/waste" className="quick-action-card">
                                    <span className="action-icon">➕</span>
                                    <h4>Log New Waste</h4>
                                    <p>Track your recycling and reduction efforts.</p>
                                </Link>
                                <Link to="/challenges" className="quick-action-card">
                                    <span className="action-icon">🎯</span>
                                    <h4>View Challenges</h4>
                                    <p>Join initiatives and boost your impact.</p>
                                </Link>
                                <Link to="/profile" className="quick-action-card">
                                    <span className="action-icon">⚙️</span>
                                    <h4>Manage Profile</h4>
                                    <p>Update your information & settings.</p>
                                </Link>
                            </div>
                        </section>

                        {/* Example: Eco Tip Section */}
                        <section className="dashboard-content-section tip-section">
                             <h3 className="section-title"><span className="leaf-icon">💡</span> Eco Tip</h3>
                             <div className="eco-tip-card">
                                 <p>Did you know? Composting kitchen scraps can reduce household waste by up to 30% and create nutrient-rich soil for your garden!</p>
                                 <Link to="/blog" className="learn-more-link">Learn more on our blog <span className="arrow-right">→</span></Link>
                             </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;