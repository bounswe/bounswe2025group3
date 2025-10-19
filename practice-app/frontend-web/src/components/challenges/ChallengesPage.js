import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import ChallengeCard from './ChallengeCard.js';
import './ChallengesPage.css';

const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆',
        dashboard: '🏠', alerts: '⚠️', goal: '🎯', filter: 'Filter',
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

// Static (non-translatable) data
const challengesStaticData = [
    { id: 'ch1', status: 'active', reward: { points: 150 }, endDate: '2024-12-31', participants: 1203, userProgress: 60 },
    { id: 'ch2', status: 'upcoming', reward: { points: 200 }, startDate: '2025-01-15', participants: 0 },
    { id: 'ch3', status: 'completed_by_user', reward: { points: 100 }, endDate: '2024-11-30', participants: 850 },
    { id: 'ch4', status: 'active', reward: { points: 120 }, endDate: '2024-12-20', participants: 970, userProgress: 30 },
    { id: 'ch5', status: 'expired', reward: { points: 80 }, endDate: '2024-10-31', participants: 600 }
];

const joinChallengeAPI = async (challengeId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve({ message: `Successfully joined ${challengeId}` });
            } else {
                reject(new Error("Server error."));
            }
        }, 500);
    });
};

const ChallengesPage = () => {
    const { t } = useTranslation();
    const [challenges, setChallenges] = useState([]);
    const [filteredChallenges, setFilteredChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setLoading(true);
        try {
            const translatedData = t('challenges_page.challenges', { returnObjects: true });
            const combinedData = challengesStaticData.map((staticChallenge, index) => ({
                ...staticChallenge,
                ...translatedData[index],
                reward: {
                    ...staticChallenge.reward,
                    badge: translatedData[index].reward_badge
                }
            }));

            setChallenges(combinedData);
            setError('');
        } catch (err) {
            setError('challenges_page.error_load_failed');
            console.error('Error processing challenges:', err);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        let tempChallenges = [...challenges];
        if (filter !== 'all') {
            tempChallenges = challenges.filter(c => 
                (filter === 'completed' && c.status === 'completed_by_user') || 
                (filter !== 'completed' && c.status === filter)
            );
        }
        setFilteredChallenges(tempChallenges);
    }, [filter, challenges]);

    const handleJoinChallenge = async (challengeId) => {
        try {
            await joinChallengeAPI(challengeId);
            alert(t('challenges_page.join_success'));
            const updatedChallenges = challenges.map(c =>
                c.id === challengeId ? { ...c, status: 'active', participants: (c.participants || 0) + 1, userProgress: 0 } : c
            );
            setChallenges(updatedChallenges);
        } catch (joinError) {
            alert(t('challenges_page.join_error', { message: joinError.message }));
        }
    };

    const filterOptions = [
        { value: 'all', label: t('challenges_page.filters.all') },
        { value: 'active', label: t('challenges_page.filters.active') },
        { value: 'upcoming', label: t('challenges_page.filters.upcoming') },
        { value: 'completed', label: t('challenges_page.filters.completed') },
        { value: 'expired', label: t('challenges_page.filters.expired') },
    ];

    return (
        <div className="challenges-page-scoped challenges-page-layout">
            <Navbar isAuthenticated={true} />

            <main className="challenges-main-content">
                <div className="challenges-header-section">
                    <h1><Icon name="challenges" /> {t('challenges_page.title')}</h1>
                    <p>{t('challenges_page.subtitle')}</p>
                </div>

                <div className="challenges-filter-bar">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            className={`filter-button ${filter === opt.value ? 'active' : ''}`}
                            onClick={() => setFilter(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="loader-container-main">
                        <div className="loader-spinner-main"></div>
                        <p>{t('challenges_page.loading')}</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="error-message-box-main">
                        <Icon name="alerts" className="error-icon"/> {t(error)}
                    </div>
                )}

                {!loading && !error && (
                    <div className="challenges-grid">
                        {filteredChallenges.length > 0 ? (
                            filteredChallenges.map(challenge => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    onJoinChallenge={handleJoinChallenge}
                                />
                            ))
                        ) : (
                            <div className="no-challenges-message">
                                <Icon name="challenges" />
                                <p>{t('challenges_page.no_challenges')}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChallengesPage;