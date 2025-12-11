import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Hook for translations
import { getUserScore } from '../../services/api'; 
import Navbar from '../common/Navbar'; // 1. Use the shared Navbar component
import './Dashboard.css';

// Placeholder for icons
const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆',
        profile: '👤', score: '🌟', actions: '🚀', tip: '💡',
        logout: '🚪', dashboard: '🏠', settings: '⚙️', edit: '✏️',
        goal: '🎯', arrowRight: '→', alerts: '⚠️', forest: '🌳 ', seed: '🌱' 
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};


const Dashboard = () => {
    const token = localStorage.getItem('access_token');

    useEffect(() => {
    if (!token) {
        navigate('/login');
        return;
        }
    // eslint-disable-next-line
  }, [token]);
    const { t } = useTranslation();
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('first_name') || email?.split('@')[0] || 'User';

    useEffect(() => {
        const fetchScore = async () => {
            setLoading(true);
            try {
                const data = await getUserScore();
                setScore(data.total_score);
                setError('');
            } catch (err) {
                setError(t('dashboard.error_fetch_score'));
                console.error('Error fetching score:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchScore();
    }, [t]);

    const handleLogout = () => {
        localStorage.clear(); // A simpler way to clear all session data
        navigate('/login');
    };

    const getScoreCategory = (currentScore) => {
        if (currentScore === null) return 'default';
        if (currentScore >= 75) return 'high';
        if (currentScore >= 40) return 'medium';
        return 'low';
    };

    const getForestData = (score) => {
        if (!score || score === null) return { forests: 0, trees: 0 };
        const forests = Math.floor(score / 1000);
        const remainingScore = score % 1000;
        const trees = 0;

        return { forests, trees };
    };

    return (
        <div className="dashboard-scoped dashboard-layout">
            {/* The old <header> is replaced with the shared Navbar */}
            <Navbar isAuthenticated={true} />

            <div className="dashboard-body-content">
                <aside className="profile-section-wrapper">
                    <div className="profile-card">
                        <div className="profile-avatar-placeholder">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                        <h3>{firstName}</h3>
                        <p className="user-email-display">{email}</p>
                        <p className="user-role-display">
                           {t('dashboard.profile_card.role_prefix')}: {role || t('dashboard.profile_card.member')}
                        </p>
                        <Link to="/profile" className="profile-action-button view-profile-btn">
                            <Icon name="edit" /> {t('dashboard.profile_card.view_profile_button')}
                        </Link>
                        <button onClick={handleLogout} className="profile-action-button logout-btn-profile">
                            <Icon name="logout" /> {t('dashboard.profile_card.logout_button')}
                        </button>
                    </div>
                </aside>

                <main className="main-dashboard-details">
                    <div className="main-content-header-alt">
                        <h2>{t('dashboard.overview.title')}</h2>
                        <p>{t('dashboard.overview.subtitle')}</p>
                    </div>

                    {loading && (
                        <div className="loader-container-main">
                            <div className="loader-spinner-main"></div>
                            <p>{t('dashboard.loader.message')}</p>
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
                                    <h4><Icon name="score" /> {t('dashboard.score_widget.title')}</h4>
                                </div>
                                <div className={`score-display score-category-${getScoreCategory(score)}`}>
                                    {score !== null ? (
                                        <span className="score-value">{score}</span>
                                    ) : (
                                        <span className="score-value-na">{t('dashboard.score_widget.not_available')}</span>
                                    )}
                                    <span className="score-unit">{t('dashboard.score_widget.unit')}</span>
                                </div>
                                {score === null && <p className="widget-subtext">{t('dashboard.score_widget.prompt')}</p>}
                            </section>

                            <section className="dashboard-widget quick-links-widget">
                                 <div className="widget-header">
                                    <h4><Icon name="actions" /> {t('dashboard.quick_links_widget.title')}</h4>
                                </div>
                                <div className="quick-links-container">
                                    <Link to="/waste" className="quick-link-item">
                                        <Icon name="waste" />
                                        <span>{t('dashboard.quick_links_widget.log_waste')}</span>
                                        <small>{t('dashboard.quick_links_widget.log_waste_sub')}</small>
                                    </Link>
                                    <Link to="/challenges" className="quick-link-item">
                                        <Icon name="challenges" />
                                        <span>{t('dashboard.quick_links_widget.join_challenges')}</span>
                                        <small>{t('dashboard.quick_links_widget.join_challenges_sub')}</small>
                                    </Link>
                                    <Link to="/leaderboard" className="quick-link-item">
                                        <Icon name="leaderboard" />
                                        <span>{t('dashboard.quick_links_widget.view_leaderboard')}</span>
                                        <small>{t('dashboard.quick_links_widget.view_leaderboard_sub')}</small>
                                    </Link>
                                </div>
                            </section>

                            <section className="dashboard-widget eco-tip-widget">
                                <div className="widget-header">
                                    <h4><Icon name="tip" /> {t('dashboard.eco_tip_widget.title')}</h4>
                                </div>
                                <div className="eco-tip-content">
                                    <p>{t('dashboard.eco_tip_widget.content')}</p>
                                    <Link to="/blog" className="learn-more-inline">
                                        {t('dashboard.eco_tip_widget.discover_more')} <Icon name="arrowRight" />
                                    </Link>
                                </div>
                            </section>

                            <section className="dashboard-widget forest-widget">
                                <div className="widget-header">
                                    <h4><Icon name="forest" /> {t('dashboard.forest_widget.title')}</h4>
                                    <span className="forest-info">{t('dashboard.forest_widget.info')}</span>
                                </div>
                                <div className="forest-visual">
                                    {(() => {
                                        const { forests, trees } = getForestData(score);
                                        
                                        if (forests === 0 && trees === 0) {
                                            return (
                                                <div className="empty-forest">
                                                    <Icon name="seed" className="seed-icon"/>
                                                    <p>{t('dashboard.forest_widget.empty')}</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
                                                {/* Display Forests */}
                                                {forests > 0 && (
                                                    <div className="forest-group">
                                                        {Array.from({ length: forests }).map((_, i) => (
                                                            <span key={`forest-${i}`} className="forest-icon" title={`Forest ${i + 1}`}>🌳</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Display Individual Trees */}
                                                {trees > 0 && (
                                                    <div className="trees-group">
                                                        {Array.from({ length: trees }).map((_, i) => (
                                                            <span key={`tree-${i}`} className="tree-icon" title={`Tree ${i + 1}`}>🌲</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
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