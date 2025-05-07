// src/components/ChallengeCard.js (or similar path)
import React from 'react';
import { Link } from 'react-router-dom'; // If details link to a separate page
import './ChallengeCard.css'; // We'll create this CSS file

// Re-usable Icon component (or import if you've centralized it)
const Icon = ({ name, className = "" }) => {
    const icons = {
        points: '⭐', // Example for reward points
        badge: '🎖️', // Example for reward badge
        time: '⏳',
        users: '👥',
        progress: '📊',
        join: '➕',
        view: '👀',
        completed: '✅',
        upcoming: '📅',
        expired: '🏁'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const ChallengeCard = ({ challenge, onJoinChallenge }) => {
    const {
        id,
        title,
        description,
        category,
        status, // 'upcoming', 'active', 'completed_by_user', 'expired'
        reward,
        endDate,
        startDate,
        participants,
        userProgress, // percentage if active for current user
        // image // Optional image URL
    } = challenge;

    const getStatusInfo = () => {
        switch (status) {
            case 'upcoming':
                return { text: 'Upcoming', icon: 'upcoming', className: 'status-upcoming' };
            case 'active':
                return { text: 'Active', icon: 'progress', className: 'status-active' };
            case 'completed_by_user':
                return { text: 'Completed!', icon: 'completed', className: 'status-completed' };
            case 'expired':
                return { text: 'Expired', icon: 'expired', className: 'status-expired' };
            default:
                return { text: 'View', icon: 'view', className: 'status-default' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`challenge-card status-${status}`}>
            {/* Optional: challenge.image && <img src={challenge.image} alt={title} className="challenge-card-image" /> */}
            <div className="challenge-card-status-banner" data-status={statusInfo.text}>
                <Icon name={statusInfo.icon} /> {statusInfo.text}
            </div>
            <div className="challenge-card-content">
                <span className="challenge-card-category">{category}</span>
                <h3 className="challenge-card-title">{title}</h3>
                <p className="challenge-card-description">{description.substring(0, 100)}{description.length > 100 ? '...' : ''}</p>

                {status === 'active' && userProgress !== undefined && (
                    <div className="challenge-progress-bar-container">
                        <div
                            className="challenge-progress-bar"
                            style={{ width: `${userProgress}%` }}
                        >
                            {userProgress}%
                        </div>
                    </div>
                )}

                <div className="challenge-card-meta">
                    {reward && (
                        <div className="meta-item reward-meta">
                            <Icon name="points" /> {reward.points} pts
                            {reward.badge && <> + <Icon name="badge" /> {reward.badge}</>}
                        </div>
                    )}
                    {endDate && status !== 'upcoming' && (
                        <div className="meta-item">
                            <Icon name="time" /> Ends: {new Date(endDate).toLocaleDateString()}
                        </div>
                    )}
                    {startDate && status === 'upcoming' && (
                        <div className="meta-item">
                            <Icon name="time" /> Starts: {new Date(startDate).toLocaleDateString()}
                        </div>
                    )}
                     <div className="meta-item">
                        <Icon name="users" /> {participants || 0} participants
                    </div>
                </div>
            </div>

            <div className="challenge-card-actions">
                {status === 'upcoming' && (
                    <button onClick={() => onJoinChallenge(id, 'join')} className="action-button join-button">
                        <Icon name="join" /> Join Challenge
                    </button>
                )}
                {status === 'active' && (
                     // Could link to a detailed challenge page or show progress
                    <Link to={`/challenges/${id}`} className="action-button view-button">
                        <Icon name="view" /> View Progress
                    </Link>
                )}
                 {status === 'completed_by_user' && (
                    <div className="action-button completed-button-display">
                        <Icon name="completed" /> Nicely Done!
                    </div>
                )}
                {status === 'expired' && (
                    <div className="action-button expired-button-display">
                        <Icon name="expired" /> Ended
                    </div>
                )}
                {/* Fallback or for general view */}
                {!(status === 'upcoming' || status === 'active' || status === 'completed_by_user' || status === 'expired') && (
                     <Link to={`/challenges/${id}`} className="action-button view-button">
                        <Icon name="view" /> View Details
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ChallengeCard;