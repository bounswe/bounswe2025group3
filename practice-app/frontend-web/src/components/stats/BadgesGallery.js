import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import './BadgesGallery.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Icon = ({ name, className = "" }) => {
    const icons = {
        badge: '🎖️', alerts: '⚠️', loading: '⏳'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const BadgesGallery = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [badges, setBadges] = useState([]);
    const [earnedCount, setEarnedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchBadgesData();
        // eslint-disable-next-line
    }, [token]);

    const fetchBadgesData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };

            // Use the new backend endpoint that calculates badges
            const response = await axios.get(`${apiUrl}/v1/rewards/badges/me/`, { headers });
            
            const badgesData = response.data;
            setBadges(badgesData);
            setEarnedCount(badgesData.filter(b => b.earned).length);
            setTotalCount(badgesData.length);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching badges data:", err);
            setError(t('badges_page.error_load'));
            setLoading(false);
        }
    };

    return (
        <div className="badges-gallery-scoped badges-gallery-layout">
            <Navbar isAuthenticated={true} />

            <main className="badges-main-content">
                <div className="badges-header-section">
                    <h1><Icon name="badge" /> {t('badges_page.title', { defaultValue: 'Achievements' })}</h1>
                    <p>{t('badges_page.subtitle', { defaultValue: 'Collect badges by reaching sustainability goals' })}</p>
                    <p className="badges-progress">
                        {t('badges_page.progress', { 
                            earned: earnedCount, 
                            total: totalCount,
                            defaultValue: `${earnedCount} / ${totalCount} badges earned`
                        })}
                    </p>
                </div>

                {loading && (
                    <div className="loader-container-main">
                        <div className="loader-spinner-main"></div>
                        <p>{t('badges_page.loading')}</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="error-message-box-main">
                        <Icon name="alerts" /> {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="badges-gallery-grid">
                        {badges.map((badge) => (
                            <div 
                                key={badge.id} 
                                className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
                            >
                                <div className="badge-card-icon">
                                    {badge.icon}
                                </div>
                                <h3>{badge.name}</h3>
                                <p>{badge.description}</p>
                                {!badge.earned && <span className="badge-locked">🔒</span>}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BadgesGallery;
