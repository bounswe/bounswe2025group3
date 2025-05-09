import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getUserScore } from '../../services/api'; // Assuming this path is correct
import './Dashboard.css'; // We will heavily modify this

// Placeholder for icons - consider using an icon library like React Icons
const Icon = ({ name, className = "" }) => {
    // Simple emoji mapping for now
    const icons = {
        logo: '🌿',
        waste: '🗑️',
        leaderboard: '📊',
        challenges: '🏆',
        profile: '👤',
        score: '🌟',
        actions: '🚀',
        tip: '💡',
        logout: '🚪',
        dashboard: '🏠',
        settings: '⚙️',
        edit: '✏️',
        arrowRight: '→'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const Dashboard = () => {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('first_name') || email?.split('@')[0] || 'User'; // Fallback for name

    useEffect(() => {
        const token = localStorage.getItem('access_token');
       

        const fetchScore = async () => {
            setLoading(true);
            try {
                const data = await getUserScore();
                setScore(data.total_score);
                setError('');
            } catch (err) {
                setError('Failed to fetch your score. Please try again later.');
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
        localStorage.removeItem('first_name'); // if you store it
        localStorage.removeItem('last_name');  // if you store it
        navigate('/login');
    };

    const getScoreCategory = (currentScore) => {
        if (currentScore === null) return 'default';
        if (currentScore >= 75) return 'high';
        if (currentScore >= 40) return 'medium';
        return 'low';
    };

    return (
        <div className="dashboard-layout">
            <header className="dashboard-top-nav">
                <Link to="/" className="app-logo">
                    <Icon name="logo" />
                    GreenerLife
                </Link>
                <nav className="main-actions-nav">
                <NavLink to="/dashboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="dashboard" /> Dashboard {/* Make sure 'dashboard' icon is in your Icon component */}
                    </NavLink>
                    <NavLink to="/waste" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="waste" /> Waste Log
                    </NavLink>
                    <NavLink to="/leaderboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="leaderboard" /> Leaderboard
                    </NavLink>
                    <NavLink to="/challenges" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="challenges" /> Challenges
                    </NavLink>
                </nav>
                {/* Optional: User menu dropdown for profile/logout if top nav gets crowded */}
            </header>

            <div className="dashboard-body-content">
                <aside className="profile-section-wrapper">
                    <div className="profile-card">
                        <div className="profile-avatar-placeholder">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                        <h3>{firstName}</h3>
                        <p className="user-email-display">{email}</p>
                        <p className="user-role-display">Role: {role || 'Member'}</p>
                        <Link to="/profile" className="profile-action-button view-profile-btn">
                            <Icon name="edit" /> View Full Profile
                        </Link>
                        <button onClick={handleLogout} className="profile-action-button logout-btn-profile">
                            <Icon name="logout" /> Logout
                        </button>
                    </div>
                </aside>

                <main className="main-dashboard-details">
                    <div className="main-content-header-alt">
                        <h2>Dashboard Overview</h2>
                        <p>Your journey to a sustainable lifestyle starts here.</p>
                    </div>

                    {loading && (
                        <div className="loader-container-main">
                            <div className="loader-spinner-main"></div>
                            <p>Fetching your eco-stats...</p>
                        </div>
                    )}
                    {error && !loading && (
                        <div className="error-message-box-main">
                            <Icon name="alerts" className="error-icon" /> {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <section className="dashboard-widget score-widget">
                                <div className="widget-header">
                                    <h4><Icon name="score" /> Your Eco Score</h4>
                                </div>
                                <div className={`score-display score-category-${getScoreCategory(score)}`}>
                                    {score !== null ? (
                                        <span className="score-value">{score}</span>
                                    ) : (
                                        <span className="score-value-na">N/A</span>
                                    )}
                                    <span className="score-unit">points</span>
                                </div>
                                {score === null && <p className="widget-subtext">Log waste to calculate your score!</p>}
                            </section>

                            <section className="dashboard-widget quick-links-widget">
                                 <div className="widget-header">
                                    <h4><Icon name="actions" /> Quick Links</h4>
                                </div>
                                <div className="quick-links-container">
                                    <Link to="/waste" className="quick-link-item">
                                        <Icon name="waste" />
                                        <span>Log Waste</span>
                                        <small>Track your impact</small>
                                    </Link>
                                    <Link to="/challenges" className="quick-link-item">
                                        <Icon name="challenges" />
                                        <span>Join Challenges</span>
                                        <small>Compete & improve</small>
                                    </Link>
                                    <Link to="/leaderboard" className="quick-link-item">
                                        <Icon name="leaderboard" />
                                        <span>View Leaderboard</span>
                                        <small>See top performers</small>
                                    </Link>
                                </div>
                            </section>

                            <section className="dashboard-widget eco-tip-widget">
                                <div className="widget-header">
                                    <h4><Icon name="tip" /> Today's Eco Tip</h4>
                                </div>
                                <div className="eco-tip-content">
                                    <p>"Reduce your carbon footprint by choosing locally sourced and seasonal foods. It supports local farmers and reduces transportation emissions!"</p>
                                    <Link to="/blog" className="learn-more-inline">
                                        Discover more tips <Icon name="arrowRight" />
                                    </Link>
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;