import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../services/api'; // Assuming you have this API service
import { useTranslation } from 'react-i18next'; // 1. Import hook
import Navbar from '../common/Navbar'; // 2. Import shared Navbar
import './LeaderboardPage.css'; // We'll create this

// Re-usable Icon component (or import if you've centralized it)
const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿',
        waste: '🗑️',
        leaderboard: '📊',
        challenges: '🏆',
        profile: '👤',
        trophy: '🏆',
        star: '⭐',
        dashboard: '🏠',
        up: '🔼',
        down: '🔽',
        goal: '🎯',
        medalGold: '🥇',
        medalSilver: '🥈',
        medalBronze: '🥉',
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const LeaderboardPage = () => {
    const { t } = useTranslation();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('user_id'); // Assuming you store user_id

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // 1. Get raw data from API
                const rawData = await getLeaderboard(); 
                
                // 2. Transform raw data to match what the component expects
                let transformedData = rawData.map((user, index) => ({
                    id: user.id,
                    username: user.username,
                    // Map total_waste_quantity to score and convert to number
                    score: parseFloat(user.total_waste_quantity), 
                    // Add rank based on the API's sorted order
                    rank: index + 1, 
                    // Add avatarSeed for the placeholder
                    avatarSeed: user.username 
                }));

                // 3. Mark the current user
                if (currentUserId) {
                    transformedData = transformedData.map(user => ({
                        ...user,
                        isCurrentUser: String(user.id) === currentUserId
                    }));
                }

                // 4. Set the final, correct data into state
                setLeaderboardData(transformedData);
                setError('');
            } catch (err) {
                setError('Failed to load leaderboard data. Please try again later.');
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [navigate, currentUserId]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Icon name="medalGold" className="rank-icon gold" />;
        if (rank === 2) return <Icon name="medalSilver" className="rank-icon silver" />;
        if (rank === 3) return <Icon name="medalBronze" className="rank-icon bronze" />;
        return <span className="rank-number">{rank}</span>;
    };

    // Simple avatar placeholder using initials or a generated color
    const AvatarPlaceholder = ({ username, seed }) => {
        const initial = username ? username.charAt(0).toUpperCase() : '?';
        // Basic hash function for a somewhat consistent color based on seed
        let hash = 0;
        for (let i = 0; i < (seed?.length || 0); i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 60%, 70%)`;
        return (
            <div className="avatar-placeholder" style={{ backgroundColor: color }}>
                {initial}
            </div>
        );
    };


    return (
        <div className="leaderboard-page-scoped leaderboard-page-layout">
            {/* 4. Use the shared Navbar component */}
            <Navbar isAuthenticated={true} />

            <main className="leaderboard-main-content">
                {/* 5. Replace all static text with the t() function */}
                <div className="leaderboard-header-section">
                    <h1><Icon name="trophy" /> {t('leaderboard_page.title')}</h1>
                    <p>{t('leaderboard_page.subtitle')}</p>
                </div>

                {loading && (
                    <div className="loader-container-main">
                        <div className="loader-spinner-main"></div>
                        <p>{t('leaderboard_page.loading')}</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="error-message-box-main">
                         <Icon name="alerts" className="error-icon" /> {t(error)} {/* Translate the key */}
                    </div>
                )}

                {!loading && !error && leaderboardData.length > 0 && (
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>{t('leaderboard_page.table.rank')}</th>
                                    <th>{t('leaderboard_page.table.player')}</th>
                                    <th>{t('leaderboard_page.table.score')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((user) => (
                                    <tr key={user.id} className={user.isCurrentUser ? 'current-user-row' : ''}>
                                        <td className="rank-cell">{getRankIcon(user.rank)}</td>
                                        <td className="player-cell">
                                            <AvatarPlaceholder username={user.username} seed={user.avatarSeed || user.username} />
                                            <span className="player-name">{user.username}</span>
                                            {user.isCurrentUser && <span className="you-badge">{t('leaderboard_page.you_badge')}</span>}
                                        </td>
                                        <td className="score-cell">{user.score} kg</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && leaderboardData.length === 0 && (
                     <div className="empty-leaderboard-message">
                        <Icon name="leaderboard" />
                        <p>{t('leaderboard_page.empty_state')}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeaderboardPage;