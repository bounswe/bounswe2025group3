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
            },
            { 
                id: 'recycling_master',
                name: t('badges_data.recycling_master.name', { defaultValue: 'Recycling Master' }), 
                icon: '♻️', 
                desc: t('badges_data.recycling_master.desc', { defaultValue: 'Recycle 30 items' }),
                earned: logs.filter(l => l.disposal_location?.toLowerCase().includes('recycled') || l.disposal_location?.toLowerCase().includes('recycling')).length >= 30
            },
            { 
                id: 'compost_champion',
                name: t('badges_data.compost_champion.name', { defaultValue: 'Compost Champion' }), 
                icon: '🌱', 
                desc: t('badges_data.compost_champion.desc', { defaultValue: 'Compost 20 organic items' }),
                earned: logs.filter(l => l.disposal_location?.toLowerCase().includes('compost')).length >= 20
            },
            { 
                id: 'milestone_100',
                name: t('badges_data.milestone_100.name', { defaultValue: 'Century Club' }), 
                icon: '💯', 
                desc: t('badges_data.milestone_100.desc', { defaultValue: 'Log 100 waste items' }),
                earned: logs.length >= 100
            },
            { 
                id: 'score_1500',
                name: t('badges_data.score_1500.name', { defaultValue: 'Green Achiever' }), 
                icon: '🏆', 
                desc: t('badges_data.score_1500.desc', { defaultValue: 'Earn 1500 eco score' }),
                earned: score >= 1500
            },
            { 
                id: 'consistency_king',
                name: t('badges_data.consistency_king.name', { defaultValue: 'Consistency King' }), 
                icon: '👑', 
                desc: t('badges_data.consistency_king.desc', { defaultValue: 'Log waste 30 days in a row' }),
                earned: dailyStats.length >= 30
            },
            { 
                id: 'metal_maven',
                name: t('badges_data.metal_maven.name', { defaultValue: 'Metal Maven' }), 
                icon: '🔧', 
                desc: t('badges_data.metal_maven.desc', { defaultValue: 'Recycle 15 metal items' }),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('metal')).length >= 15
            },
            { 
                id: 'paper_pride',
                name: t('badges_data.paper_pride.name', { defaultValue: 'Paper Pride' }), 
                icon: '📄', 
                desc: t('badges_data.paper_pride.desc', { defaultValue: 'Recycle 25 paper items' }),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('paper')).length >= 25
            },
            { 
                id: 'glass_guru',
                name: t('badges_data.glass_guru.name', { defaultValue: 'Glass Guru' }), 
                icon: '🥃', 
                desc: t('badges_data.glass_guru.desc', { defaultValue: 'Recycle 10 glass items' }),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('glass')).length >= 10
            },
            { 
                id: 'eco_score_500',
                name: t('badges_data.eco_score_500.name', { defaultValue: 'Rising Star' }), 
                icon: '⭐', 
                desc: t('badges_data.eco_score_500.desc', { defaultValue: 'Earn 500 eco score' }),
                earned: score >= 500
            },
            { 
                id: 'score_2000',
                name: t('badges_data.score_2000.name', { defaultValue: 'Eco Champion' }), 
                icon: '🥇', 
                desc: t('badges_data.score_2000.desc', { defaultValue: 'Earn 2000 eco score' }),
                earned: score >= 2000
            },
            { 
                id: 'score_3000',
                name: t('badges_data.score_3000.name', { defaultValue: 'Eco Master' }), 
                icon: '🥈', 
                desc: t('badges_data.score_3000.desc', { defaultValue: 'Earn 3000 eco score' }),
                earned: score >= 3000
            },
            { 
                id: 'logs_200',
                name: t('badges_data.logs_200.name', { defaultValue: 'Waste Logger Pro' }), 
                icon: '📋', 
                desc: t('badges_data.logs_200.desc', { defaultValue: 'Log 200 waste items' }),
                earned: logs.length >= 200
            },
            { 
                id: 'logs_500',
                name: t('badges_data.logs_500.name', { defaultValue: 'Waste Tracking Expert' }), 
                icon: '🎯', 
                desc: t('badges_data.logs_500.desc', { defaultValue: 'Log 500 waste items' }),
                earned: logs.length >= 500
            },
            { 
                id: 'streak_60',
                name: t('badges_data.streak_60.name', { defaultValue: 'Unstoppable' }), 
                icon: '🚀', 
                desc: t('badges_data.streak_60.desc', { defaultValue: 'Log waste 60 days in a row' }),
                earned: dailyStats.length >= 60
            },
            { 
                id: 'plastic_50',
                name: t('badges_data.plastic_50.name', { defaultValue: 'Plastic Warrior' }), 
                icon: '💪', 
                desc: t('badges_data.plastic_50.desc', { defaultValue: 'Reduce 50 units of plastic' }),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('plastic')).reduce((acc, curr) => acc + parseFloat(curr.quantity), 0) >= 50
            },
            { 
                id: 'organic_50',
                name: t('badges_data.organic_50.name', { defaultValue: 'Organic Advocate' }), 
                icon: '🍃', 
                desc: t('badges_data.organic_50.desc', { defaultValue: 'Log 50 organic waste items' }),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('organic') || l.sub_category_name?.toLowerCase().includes('food')).length >= 50
            },
            { 
                id: 'electronic_20',
                name: t('badges_data.electronic_20.name', { defaultValue: 'E-Waste Expert' }), 
                icon: '🔌', 
                desc: t('badges_data.electronic_20.desc', { defaultValue: 'Recycle 20 electronic items' }),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('electronic') || l.sub_category_name?.toLowerCase().includes('e-waste')).length >= 20
            },
            { 
                id: 'textile_30',
                name: t('badges_data.textile_30.name', { defaultValue: 'Fashion Friend' }), 
                icon: '👕', 
                desc: t('badges_data.textile_30.desc', { defaultValue: 'Recycle 30 textile items' }),
                earned: logs.filter(l => l.sub_category_name?.toLowerCase().includes('textile') || l.sub_category_name?.toLowerCase().includes('cloth')).length >= 30
            },
            { 
                id: 'donate_50',
                name: t('badges_data.donate_50.name', { defaultValue: 'Donation Champion' }), 
                icon: '🎁', 
                desc: t('badges_data.donate_50.desc', { defaultValue: 'Donate or reuse 50 items' }),
                earned: logs.filter(l => l.disposal_location?.toLowerCase().includes('donated') || l.disposal_location?.toLowerCase().includes('reused')).length >= 50
            },
            { 
                id: 'landfill_zero',
                name: t('badges_data.landfill_zero.name', { defaultValue: 'Zero Landfill' }), 
                icon: '✨', 
                desc: t('badges_data.landfill_zero.desc', { defaultValue: 'Send 0 items to landfill' }),
                earned: logs.filter(l => l.disposal_location?.toLowerCase().includes('landfill')).length === 0 && logs.length > 0
            },
            { 
                id: 'streak_7',
                name: t('badges_data.streak_7.name', { defaultValue: 'Week Warrior' }), 
                icon: '📅', 
                desc: t('badges_data.streak_7.desc', { defaultValue: 'Log waste 7 days in a row' }),
                earned: dailyStats.length >= 7
            },
            { 
                id: 'streak_21',
                name: t('badges_data.streak_21.name', { defaultValue: 'Monthly Hero' }), 
                icon: '🎖️', 
                desc: t('badges_data.streak_21.desc', { defaultValue: 'Log waste 21 days in a row' }),
                earned: dailyStats.length >= 21
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
