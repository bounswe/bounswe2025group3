import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Added Link, NavLink
import { getUserProfile, updateUserProfile } from '../../services/api'; // Assuming path is correct
// Removed: import Navbar from '../common/Navbar';
import './Profile.css'; // We will heavily update this

// Re-usable Icon component (or import if you've centralized it)
const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿',
        waste: '🗑️',
        leaderboard: '📊',
        challenges: '🏆',
        dashboard: '🏠',
        profile: '👤',
        firstName: '🧑', // Person icon
        lastName: '🧑‍🦱', // Could be same or slightly different
        bio: '📝',
        location: '📍', // For city/country
        notifications: '🔔',
        save: '💾',
        alerts: '⚠️',
        loadingSpinner: '⏳', // Placeholder for a CSS spinner
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const Profile = () => {
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        city: '',
        country: '',
        notifications_enabled: false,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        

        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getUserProfile();
                setProfile(data || { // Ensure profile is an object even if API returns null/undefined
                    first_name: '',
                    last_name: '',
                    bio: '',
                    city: '',
                    country: '',
                    notifications_enabled: false,
                });
            } catch (err) {
                setError('Failed to fetch your profile. Please try again.');
                console.error('Fetch profile error:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);
        try {
            // Create a payload with only the fields the API expects
            const { email, username, id, ...updatePayload } = profile;
            await updateUserProfile(updatePayload);
            setSuccessMessage('Profile updated successfully!');
            // Optionally, update localStorage if first_name is used elsewhere
            if (profile.first_name) localStorage.setItem('first_name', profile.first_name);

        } catch (err) {
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                 const messages = Object.entries(errorData)
                    .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(val) ? val.join(', ') : val}`)
                    .join('; ');
                setError(messages || 'Failed to update profile. Please check your input.');
            } else {
                setError('Failed to update profile. An unknown error occurred.');
            }
            console.error('Update profile error:', errorData || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-page-layout">
            {/* --- Top Navigation Bar --- */}
            <header className="dashboard-top-nav">
                <Link to="/" className="app-logo">
                    <Icon name="logo" /> Greener
                </Link>
                <nav className="main-actions-nav">
                    <NavLink to="/dashboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="dashboard" /> Dashboard
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

            {/* --- Main Content Area for Profile --- */}
            <main className="profile-main-content">
                <div className="profile-header-section">
                    <h1><Icon name="profile" /> Your Profile</h1>
                    <p>Manage your personal information and preferences.</p>
                </div>

                {loading && (
                    <div className="loader-container-main">
                        <div className="loader-spinner-main"></div>
                        <p>Loading your profile...</p>
                    </div>
                )}

                {!loading && (
                    <div className="profile-form-card">
                        {error && (
                            <div className="message-box error-box">
                                <Icon name="alerts" /> {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="message-box success-box">
                                <Icon name="save" /> {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="first_name"><Icon name="firstName" /> First Name</label>
                                    <input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        placeholder="Enter your first name"
                                        value={profile.first_name || ''}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="last_name"><Icon name="lastName" /> Last Name</label>
                                    <input
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        placeholder="Enter your last name"
                                        value={profile.last_name || ''}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="bio"><Icon name="bio" /> Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    placeholder="Tell us a bit about yourself and your eco-journey..."
                                    value={profile.bio || ''}
                                    onChange={handleChange}
                                    rows="4"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="city"><Icon name="location" /> City</label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        placeholder="Your city"
                                        value={profile.city || ''}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="country"><Icon name="location" /> Country</label>
                                    <input
                                        id="country"
                                        name="country"
                                        type="text"
                                        placeholder="Your country"
                                        value={profile.country || ''}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="form-field form-field-checkbox">
                                <input
                                    type="checkbox"
                                    id="notifications_enabled"
                                    name="notifications_enabled"
                                    checked={profile.notifications_enabled || false}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="notifications_enabled" className="checkbox-label">
                                    <Icon name="notifications" /> Enable Email Notifications
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-profile-button" disabled={isSubmitting || loading}>
                                    {isSubmitting ? (
                                        <><span className="button-spinner"></span> Updating...</>
                                    ) : (
                                        <><Icon name="save" /> Update Profile</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;