import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { getChallenges, joinChallengeAPI } from '../services/api'; // Assuming API services
import ChallengeCard from './ChallengeCard.js'; // Adjust path if needed
import './ChallengesPage.css';

// Re-usable Icon component (or import if you've centralized it)
const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿',
        waste: '🗑️',
        leaderboard: '📊',
        challenges: '🏆',
        dashboard: '🏠',
        alerts: '⚠️',
        filter: 'Filter', // Or an actual filter icon
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

// Mock API calls - replace with your actual API
const getChallenges = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 'ch1', title: 'Plastic-Free Week', description: 'Commit to using no single-use plastics for 7 days. Track your progress and share tips!', category: 'Waste Reduction', status: 'active', reward: { points: 150, badge: 'Plastic Buster' }, endDate: '2024-12-31', participants: 1203, userProgress: 60 },
                { id: 'ch2', title: '30-Day Composting Challenge', description: 'Start and maintain a compost bin for 30 days. Turn your organic waste into valuable soil.', category: 'Organic Waste', status: 'upcoming', reward: { points: 200, badge: 'Compost King' }, startDate: '2025-01-15', participants: 0 },
                { id: 'ch3', title: 'Meatless Monday Master', description: 'Go meat-free every Monday for a month to reduce your carbon footprint.', category: 'Dietary Impact', status: 'completed_by_user', reward: { points: 100 }, endDate: '2024-11-30', participants: 850 },
                { id: 'ch4', title: 'Energy Saver Sprint', description: 'Reduce your household energy consumption by 10% this month.', category: 'Energy Conservation', status: 'active', reward: { points: 120 }, endDate: '2024-12-20', participants: 970, userProgress: 30 },
                { id: 'ch5', title: 'Local Commute Champion', description: 'Use public transport, bike, or walk for your daily commute for 5 consecutive days.', category: 'Transportation', status: 'expired', reward: { points: 80 }, endDate: '2024-10-31', participants: 600 }
            ]);
        }, 1000);
    });
};
const joinChallengeAPI = async (challengeId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`Joined challenge ${challengeId}`);
            // Simulate success or failure
            if (Math.random() > 0.1) { // 90% success rate
                resolve({ message: `Successfully joined ${challengeId}` });
            } else {
                reject(new Error("Failed to join challenge. Server error."));
            }
        }, 500);
    });
};


const ChallengesPage = () => {
    const [challenges, setChallenges] = useState([]);
    const [filteredChallenges, setFilteredChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'upcoming', 'completed'
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        const fetchChallenges = async () => {
            setLoading(true);
            try {
                const data = await getChallenges();
                setChallenges(data);
                setFilteredChallenges(data); // Initially show all
                setError('');
            } catch (err) {
                setError('Failed to load challenges. Please try again later.');
                console.error('Error fetching challenges:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, [navigate]);

    useEffect(() => {
        // Apply filter when 'filter' or 'challenges' state changes
        let tempChallenges = [...challenges];
        if (filter === 'active') {
            tempChallenges = challenges.filter(c => c.status === 'active');
        } else if (filter === 'upcoming') {
            tempChallenges = challenges.filter(c => c.status === 'upcoming');
        } else if (filter === 'completed') {
            tempChallenges = challenges.filter(c => c.status === 'completed_by_user');
        } else if (filter === 'expired') {
            tempChallenges = challenges.filter(c => c.status === 'expired');
        }
        setFilteredChallenges(tempChallenges);
    }, [filter, challenges]);


    const handleJoinChallenge = async (challengeId) => {
        // Optimistic UI update (optional) or just show loader
        // For simplicity, we'll refetch or assume API updates status
        try {
            await joinChallengeAPI(challengeId);
            alert(`You've joined the challenge!`);
            // Refetch challenges or update the specific challenge's status locally
            const updatedChallenges = challenges.map(c =>
                c.id === challengeId ? { ...c, status: 'active', participants: (c.participants || 0) + 1, userProgress: 0 } : c
            );
            setChallenges(updatedChallenges);
        } catch (joinError) {
            alert(`Could not join challenge: ${joinError.message}`);
            console.error("Join challenge error:", joinError);
        }
    };

    const filterOptions = [
        { value: 'all', label: 'All Challenges' },
        { value: 'active', label: 'Active' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'completed', label: 'My Completed' },
        { value: 'expired', label: 'Past Challenges' },
    ];

    return (
        <div className="challenges-page-layout">
            {/* --- Top Navigation Bar --- */}
            <header className="dashboard-top-nav">
                <Link to="/" className="app-logo">
                    <Icon name="logo" /> Greener
                </Link>
                <nav className="main-actions-nav">
                    <NavLink to="/dashboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="dashboard" /> Dashboard {/* Make sure 'dashboard' icon is in your Icon component */}
                    </NavLink>
                    <NavLink to="/waste" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="waste" /> Waste Log
                    </NavLink>
                    <NavLink to="/leaderboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="leaderboard" /> Leaderboard
                    </NavLink>
                    <NavLink to="/challenges" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="challenges" /> Challenges
                    </NavLink>
                </nav>
            </header>

            {/* --- Main Content Area for Challenges --- */}
            <main className="challenges-main-content">
                <div className="challenges-header-section">
                    <h1><Icon name="challenges" /> Eco Challenges</h1>
                    <p>Join challenges, make an impact, and earn rewards!</p>
                </div>

                <div className="challenges-filter-bar">
                    {/* <Icon name="filter" /> */}
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
                        <p>Loading challenges...</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="error-message-box-main">
                        <Icon name="alerts" className="error-icon"/> {error}
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
                                <p>No challenges found for the selected filter. Try another one!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChallengesPage;