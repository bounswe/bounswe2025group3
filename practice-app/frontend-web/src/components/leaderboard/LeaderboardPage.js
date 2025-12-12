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
        medalSilver: '🥈', medalBronze: '🥉', alerts: '⚠️'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const LeaderboardPage = () => {
    const { t } = useTranslation();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                // 1. API'den ham veriyi al
                const rawData = await getLeaderboard(); 
                
                // 2. Veriyi bileşenin beklediği formata dönüştür
                let transformedData = rawData.map((user, index) => ({
                    id: user.id,
                    // Backend artık 'username' yerine 'display_name' gönderiyor (Anonimlik için)
                    displayName: user.display_name, 
                    score: parseFloat(user.total_score), 
                    rank: index + 1, 
                    // Avatar seed'i olarak da display_name kullanıyoruz
                    avatarSeed: user.display_name 
                }));

                // 3. Mevcut kullanıcıyı işaretle
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
    }, [navigate, currentUserId]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Icon name="medalGold" className="rank-icon gold" />;
        if (rank === 2) return <Icon name="medalSilver" className="rank-icon silver" />;
        if (rank === 3) return <Icon name="medalBronze" className="rank-icon bronze" />;
        return <span className="rank-number">{rank}</span>;
    };

    // Basit avatar placeholder bileşeni
    const AvatarPlaceholder = ({ username, seed }) => {
        // Eğer kullanıcı anonim ise '?' göster, değilse baş harfini göster
        const isAnonymous = username === 'anonymous_user';
        const initial = isAnonymous ? '?' : (username ? username.charAt(0).toUpperCase() : '?');
        
        // Seed'e göre renk üret (Anonimler için sabit veya farklı bir renk mantığı olabilir)
        let hash = 0;
        const seedString = seed || 'default';
        for (let i = 0; i < seedString.length; i++) {
            hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Anonim kullanıcılar için gri ton, diğerleri için renkli
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
                                                {/* Anonim Kontrolü: Backend 'anonymous_user' gönderirse çeviriyi göster */}
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