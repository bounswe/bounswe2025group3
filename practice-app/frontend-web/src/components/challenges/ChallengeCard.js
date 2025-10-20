// src/components/ChallengeCard.js (or similar path)
import React from 'react';
import { Link } from 'react-router-dom'; // If details link to a separate page
import './ChallengeCard.css'; // We'll create this CSS file
import { useTranslation } from 'react-i18next'; // 1. Import hook

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
    const { t } = useTranslation();
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
                return { key: 'upcoming', icon: 'upcoming' };
            case 'active':
                return { key: 'active', icon: 'progress' };
            case 'completed_by_user':
                return { key: 'completed', icon: 'completed' };
            case 'expired':
                return { key: 'expired', icon: 'expired' };
            default:
                return { key: 'view', icon: 'view' };
        }
    };

    const statusInfo = getStatusInfo();
    const statusText = t(`challenge_card.status_${statusInfo.key}`);

    return (
        <div className={`challenge-card status-${status}`}>
            <div className="challenge-card-status-banner" data-status={statusText}>
                <Icon name={statusInfo.icon} /> {statusText}
            </div>
            <div className="challenge-card-content">
                <span className="challenge-card-category">{category}</span>
                <h3 className="challenge-card-title">{title}</h3>
                <p className="challenge-card-description">{description.substring(0, 100)}{description.length > 100 ? '...' : ''}</p>

                {status === 'active' && userProgress !== undefined && (
                    <div className="challenge-progress-bar-container">
                        <div className="challenge-progress-bar" style={{ width: `${userProgress}%` }}>
                            {userProgress}%
                        </div>
                    </div>
                )}

                <div className="challenge-card-meta">
                    {reward && (
                        <div className="meta-item reward-meta">
                            <Icon name="points" /> {reward.points} {t('challenge_card.points_suffix')}
                            {reward.badge && <> + <Icon name="badge" /> {reward.badge}</>}
                        </div>
                    )}
                    {endDate && status !== 'upcoming' && (
                        <div className="meta-item">
                            <Icon name="time" /> {t('challenge_card.meta_ends_on')} {new Date(endDate).toLocaleDateString()}
                        </div>
                    )}
                    {startDate && status === 'upcoming' && (
                        <div className="meta-item">
                            <Icon name="time" /> {t('challenge_card.meta_starts_on')} {new Date(startDate).toLocaleDateString()}
                        </div>
                    )}
                     <div className="meta-item">
                        <Icon name="users" /> {participants || 0} {t('challenge_card.meta_participants')}
                    </div>
                </div>
            </div>

            <div className="challenge-card-actions">
                {status === 'upcoming' && (
                    <button onClick={() => onJoinChallenge(id, 'join')} className="action-button join-button">
                        <Icon name="join" /> {t('challenge_card.action_join')}
                    </button>
                )}
                {status === 'active' && (
                    <Link to={`/challenges/${id}`} className="action-button view-button">
                        <Icon name="view" /> {t('challenge_card.action_view_progress')}
                    </Link>
                )}
                 {status === 'completed_by_user' && (
                    <div className="action-button completed-button-display">
                        <Icon name="completed" /> {t('challenge_card.action_completed')}
                    </div>
                )}
                {status === 'expired' && (
                    <div className="action-button expired-button-display">
                        <Icon name="expired" /> {t('challenge_card.action_ended')}
                    </div>
                )}
                {/* Fallback */}
                {!(status === 'upcoming' || status === 'active' || status === 'completed_by_user' || status === 'expired') && (
                     <Link to={`/challenges/${id}`} className="action-button view-button">
                        <Icon name="view" /> {t('challenge_card.action_view_details')}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ChallengeCard;