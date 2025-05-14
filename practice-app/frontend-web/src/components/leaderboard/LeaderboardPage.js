import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { getLeaderboard } from '../services/api'; // Assuming you have this API service
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

// Mock API call - replace with your actual API
const getLeaderboard = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, rank: 1, username: 'EcoWarriorJane', avatarSeed: 'jane', score: 1250, isCurrentUser: false },
                { id: 2, rank: 2, username: 'GreenThumbAlex', avatarSeed: 'alex', score: 1180, isCurrentUser: false },
                { id: 3, rank: 3, username: 'RecycleRahul', avatarSeed: 'rahul', score: 1100, isCurrentUser: false },
                { id: 4, rank: 4, username: 'SustainableSam', avatarSeed: 'sam', score: 950, isCurrentUser: true }, // Example current user
                { id: 5, rank: 5, username: 'PlanetSaverPat', avatarSeed: 'pat', score: 920, isCurrentUser: false },
                { id: 6, rank: 6, username: 'ZeroWasteZoe', avatarSeed: 'zoe', score: 880, isCurrentUser: false },
                { id: 7, rank: 7, username: 'ClimateCarlos', avatarSeed: 'carlos', score: 850, isCurrentUser: false },
                { id: 8, rank: 8, username: 'NatureNina', avatarSeed: 'nina', score: 760, isCurrentUser: false },
                { id: 9, rank: 9, username: 'EarthEnthusiast', avatarSeed: 'earth', score: 730, isCurrentUser: false },
                { id: 10, rank: 10, username: 'ForestFriend', avatarSeed: 'forest', score: 700, isCurrentUser: false },
            ]);
        }, 1000);
    });
};


const LeaderboardPage = () => {
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
                let data = await getLeaderboard();
                // If your API doesn't mark current user, do it client-side:
                if (currentUserId) {
                    data = data.map(user => ({
                        ...user,
                        isCurrentUser: String(user.id) === currentUserId
                    }));
                }
                setLeaderboardData(data);
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
        <div className="leaderboard-page-layout">
            {/* --- Top Navigation Bar (Same as Dashboard) --- */}
            <header className="dashboard-top-nav"> {/* Reusing class for consistent styling */}
                <Link to="/" className="app-logo">
                    <Icon name="logo" />
                    Greener
                </Link>
                <nav className="main-actions-nav">
                <NavLink to="/dashboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="dashboard" /> Dashboard {/* Make sure 'dashboard' icon is in your Icon component */}
                    </NavLink>
                    <NavLink to="/waste" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="waste" /> Waste Log
                    </NavLink>
                    <NavLink to="/goals"  className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="goal" /> Goals
                    </NavLink>
                    <NavLink to="/leaderboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="leaderboard" /> Leaderboard
                    </NavLink>
                    <NavLink to="/challenges" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="challenges" /> Challenges
                    </NavLink>
                </nav>
            </header>

            {/* --- Main Content Area for Leaderboard --- */}
            <main className="leaderboard-main-content">
                <div className="leaderboard-header-section">
                    <h1><Icon name="trophy" /> Community Leaderboard</h1>
                    <p>See who's leading the charge in making a positive environmental impact!</p>
                </div>

                {loading && (
                    <div className="loader-container-main"> {/* Reusing loader style */}
                        <div className="loader-spinner-main"></div>
                        <p>Loading champions...</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="error-message-box-main"> {/* Reusing error style */}
                         <Icon name="alerts" className="error-icon" /> {error}
                    </div>
                )}

                {!loading && !error && leaderboardData.length > 0 && (
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((user) => (
                                    <tr key={user.id} className={user.isCurrentUser ? 'current-user-row' : ''}>
                                        <td className="rank-cell">{getRankIcon(user.rank)}</td>
                                        <td className="player-cell">
                                            <AvatarPlaceholder username={user.username} seed={user.avatarSeed || user.username} />
                                            <span className="player-name">{user.username}</span>
                                            {user.isCurrentUser && <span className="you-badge">You</span>}
                                        </td>
                                        <td className="score-cell">{user.score} pts</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && leaderboardData.length === 0 && (
                     <div className="empty-leaderboard-message">
                        <Icon name="leaderboard" />
                        <p>The leaderboard is currently empty. Start logging your activities to get on the board!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeaderboardPage;