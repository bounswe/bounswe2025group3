import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../services/api'; 
import { useTranslation } from 'react-i18next'; 
import Navbar from '../common/Navbar'; 
import './LeaderboardPage.css'; 

const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆',
        profile: '👤', trophy: '🏆', star: '⭐', dashboard: '🏠',
        up: '🔼', down: '🔽', goal: '🎯', medalGold: '🥇',
        medalSilver: '🥈', medalBronze: '🥉', alerts: '⚠️', filter: '🔍'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const LeaderboardPage = () => {
    const { t } = useTranslation();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // YENİ: Zaman dilimi state'i (Varsayılan: 'all')
    // Seçenekler: 'all', 'yearly', 'monthly', 'weekly', 'daily'
    const [timeframe, setTimeframe] = useState('all');

    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('user_id'); 
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        // eslint-disable-next-line
    }, [token]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // YENİ: timeframe parametresini gönderiyoruz
                const rawData = await getLeaderboard(timeframe); 
                
                let transformedData = rawData.map((user, index) => ({
                    id: user.id,
                    displayName: user.display_name, 
                    score: parseFloat(user.total_score), 
                    rank: index + 1, 
                    avatarSeed: user.display_name 
                }));

                if (currentUserId) {
                    transformedData = transformedData.map(user => ({
                        ...user,
                        isCurrentUser: String(user.id) === currentUserId
                    }));
                }

                setLeaderboardData(transformedData);
                setError('');
            } catch (err) {
                setError('leaderboard_page.error_load_failed');
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
        // YENİ: timeframe değiştiğinde useEffect tekrar çalışsın
    }, [navigate, currentUserId, timeframe]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Icon name="medalGold" className="rank-icon gold" />;
        if (rank === 2) return <Icon name="medalSilver" className="rank-icon silver" />;
        if (rank === 3) return <Icon name="medalBronze" className="rank-icon bronze" />;
        return <span className="rank-number">{rank}</span>;
    };

    const AvatarPlaceholder = ({ username, seed }) => {
        const isAnonymous = username === 'anonymous_user';
        const initial = isAnonymous ? '?' : (username ? username.charAt(0).toUpperCase() : '?');
        
        let hash = 0;
        const seedString = seed || 'default';
        for (let i = 0; i < seedString.length; i++) {
            hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = isAnonymous ? '#ccc' : `hsl(${hash % 360}, 60%, 70%)`;
        
        return (
            <div className="avatar-placeholder" style={{ backgroundColor: color }}>
                {initial}
            </div>
        );
    };

    return (
        <div className="leaderboard-page-scoped leaderboard-page-layout">
            <Navbar isAuthenticated={true} />

            <main className="leaderboard-main-content">
                <div className="leaderboard-header-section">
                    <h1><Icon name="trophy" /> {t('leaderboard_page.title')}</h1>
                    <p>{t('leaderboard_page.subtitle')}</p>
                    
                    {/* YENİ: Filtre Butonları */}
                    <div className="leaderboard-filters">
                        {['all', 'yearly', 'monthly', 'weekly', 'daily'].map((period) => (
                            <button
                                key={period}
                                className={`filter-btn ${timeframe === period ? 'active' : ''}`}
                                onClick={() => setTimeframe(period)}
                            >
                                {t(`leaderboard_page.filters.${period}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="loader-container-main">
                        <div className="loader-spinner-main"></div>
                        <p>{t('leaderboard_page.loading')}</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="error-message-box-main">
                         <Icon name="alerts" className="error-icon" /> {t(error)}
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
                                            <AvatarPlaceholder 
                                                username={user.displayName} 
                                                seed={user.avatarSeed} 
                                            />
                                            <span className="player-name">
                                                {user.displayName === 'anonymous_user' 
                                                    ? t('leaderboard_page.anonymous_user', 'Anonymous User') 
                                                    : user.displayName
                                                }
                                            </span>
                                            {user.isCurrentUser && <span className="you-badge">{t('leaderboard_page.you_badge')}</span>}
                                        </td>
                                        <td className="score-cell">{user.score} {t('leaderboard_page.score_suffix')}</td>
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