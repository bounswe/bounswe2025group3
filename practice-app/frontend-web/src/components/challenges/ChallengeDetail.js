import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import './ChallengeDetail.css'; // We will create this new CSS file

// Mock data and Icon component (should be centralized in a real app)
const challengesStaticData = [
    { id: 'ch1', status: 'active', reward: { points: 150 }, endDate: '2024-12-31', participants: 1203, userProgress: 60 },
    { id: 'ch2', status: 'upcoming', reward: { points: 200 }, startDate: '2025-01-15', participants: 0 },
    { id: 'ch3', status: 'completed_by_user', reward: { points: 100 }, endDate: '2024-11-30', participants: 850 },
    { id: 'ch4', status: 'active', reward: { points: 120 }, endDate: '2024-12-20', participants: 970, userProgress: 30 },
    { id: 'ch5', status: 'expired', reward: { points: 80 }, endDate: '2024-10-31', participants: 600 }
];

const Icon = ({ name, className = "" }) => {
    const icons = {
        challenges: '🏆', back: '←', points: '⭐', badge: '🎖️', time: '⏳', users: '👥', progress: '📊'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const ChallengeDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams(); // Get challenge ID from the URL
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Find the challenge data by matching the ID from the URL
        const translatedData = t('challenges_page.challenges', { returnObjects: true });
        const staticData = challengesStaticData.find(c => c.id === id);

        if (staticData) {
            const index = challengesStaticData.findIndex(c => c.id === id);
            const combinedData = {
                ...staticData,
                ...translatedData[index],
                reward: {
                    ...staticData.reward,
                    badge: translatedData[index].reward_badge
                }
            };
            setChallenge(combinedData);
        }
        setLoading(false);
    }, [id, t]);

    if (loading) {
        return <div>Loading...</div>; // Simple loader
    }

    if (!challenge) {
        return (
            <div className="challenge-detail-page-scoped challenge-detail-layout">
                <Navbar isAuthenticated={true} />
                <main className="challenge-detail-main-content">
                    <div className="challenge-detail-card">
                        <h1>{t('challenge_detail.not_found')}</h1>
                        <Link to="/challenges" className="back-to-challenges-btn">
                            <Icon name="back" /> {t('challenge_detail.back_button')}
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="challenge-detail-page-scoped challenge-detail-layout">
            <Navbar isAuthenticated={true} />
            <main className="challenge-detail-main-content">
                <div className="challenge-detail-card">
                    <header className="challenge-detail-header">
                        <span className="challenge-detail-category">{challenge.category}</span>
                        <h1><Icon name="challenges" /> {challenge.title}</h1>
                        <p>{challenge.description}</p>
                    </header>
                    
                    {challenge.status === 'active' && challenge.userProgress !== undefined && (
                        <div className="challenge-progress-section">
                            <h3>{t('challenge_detail.your_progress')}</h3>
                            <div className="challenge-progress-bar-container">
                                <div className="challenge-progress-bar" style={{ width: `${challenge.userProgress}%` }}>
                                    {challenge.userProgress}%
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="challenge-detail-meta">
                        <div className="meta-item">
                            <Icon name="points" />
                            <strong>{challenge.reward.points} {t('challenge_card.points_suffix')}</strong>
                        </div>
                        {challenge.reward.badge && (
                            <div className="meta-item">
                                <Icon name="badge" />
                                <strong>{challenge.reward.badge}</strong>
                            </div>
                        )}
                        <div className="meta-item">
                            <Icon name="users" />
                            <span>{challenge.participants} {t('challenge_card.meta_participants')}</span>
                        </div>
                        {challenge.endDate && (
                            <div className="meta-item">
                                <Icon name="time" />
                                <span>{t('challenge_card.meta_ends_on')} {new Date(challenge.endDate).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    <footer className="challenge-detail-footer">
                        <Link to="/challenges" className="back-to-challenges-btn">
                            <Icon name="back" /> {t('challenge_detail.back_button')}
                        </Link>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default ChallengeDetailPage;
