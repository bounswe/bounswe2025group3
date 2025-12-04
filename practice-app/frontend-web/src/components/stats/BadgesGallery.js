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
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [scoreData, setScoreData] = useState({ total_score: 0 });
    const [rawLogs, setRawLogs] = useState([]);
    const [rawStreakStats, setRawStreakStats] = useState([]);

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

            const [scoreRes, logsRes, dailyStatsRes] = await Promise.all([
                axios.get(`${apiUrl}/v1/waste/scores/me/`, { headers }),
                axios.get(`${apiUrl}/v1/waste/logs/`, { headers }),
                axios.get(`${apiUrl}/v1/waste/user/stats/?period=daily`, { headers })
            ]);

            setScoreData(scoreRes.data);
            setRawLogs(logsRes.data.results || []);
            setRawStreakStats(dailyStatsRes.data.data || []);

            calculateBadges(logsRes.data.results || [], scoreRes.data.total_score, dailyStatsRes.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching badges data:", err);
            setError(t('badges_page.error_load'));
            setLoading(false);
        }
    };

    const calculateBadges = (logs, score, dailyStats) => {
        const allBadges = [
            { 
                id: 'first_step',
                name: t('badges_data.first_step.name'), 
                icon: '🎖', 
                desc: t('badges_data.first_step.desc'),
                earned: logs.length > 0
            },
            { 
                id: 'plastic_buster',
                name: t('badges_data.plastic_buster.name'), 
                icon: '🥤', 
                desc: t('badges_data.plastic_buster.desc'),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('plastic')).reduce((acc, curr) => acc + parseFloat(curr.quantity), 0) >= 10
            },
            { 
                id: 'sustainability_streak',
                name: t('badges_data.sustainability_streak.name'), 
                icon: '🔥', 
                desc: t('badges_data.sustainability_streak.desc'),
                earned: dailyStats.length >= 14
            },
            { 
                id: 'zero_waste_legend',
                name: t('badges_data.zero_waste_legend.name'), 
                icon: '🌍', 
                desc: t('badges_data.zero_waste_legend.desc'),
                earned: score >= 5000
            },
            { 
                id: 'eco_warrior',
                name: t('badges_data.eco_warrior.name', { defaultValue: 'Eco Warrior' }), 
                icon: '⚔️', 
                desc: t('badges_data.eco_warrior.desc', { defaultValue: 'Log 50 waste items' }),
                earned: logs.length >= 50
            },
            { 
                id: 'tree_hugger',
                name: t('badges_data.tree_hugger.name', { defaultValue: 'Tree Hugger' }), 
                icon: '🌿', 
                desc: t('badges_data.tree_hugger.desc', { defaultValue: 'Earn 1000 eco score' }),
                earned: score >= 1000
            }
        ];

        setEarnedBadges(allBadges);
    };

    return (
        <div className="badges-gallery-scoped badges-gallery-layout">
            <Navbar isAuthenticated={true} />

            <main className="badges-main-content">
                <div className="badges-header-section">
                    <h1><Icon name="badge" /> {t('badges_page.title', { defaultValue: 'Achievements' })}</h1>
                    <p>{t('badges_page.subtitle', { defaultValue: 'Collect badges by reaching sustainability goals' })}</p>
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
                        {earnedBadges.map((badge) => (
                            <div 
                                key={badge.id} 
                                className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
                            >
                                <div className="badge-card-icon">
                                    {badge.icon}
                                </div>
                                <h3>{badge.name}</h3>
                                <p>{badge.desc}</p>
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
