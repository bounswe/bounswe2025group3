import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Added Link, NavLink
import { getUserProfile, updateUserProfile } from '../../services/api'; // Assuming path is correct
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
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
    const { t } = useTranslation();
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        city: '',
        country: '',
        notifications_enabled: false,
    });
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    // eslint-disable-next-line
    }, [token]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const [allCountriesData, setAllCountriesData] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);

    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setAllCountriesData(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch countries:', err));
    }, []);

    useEffect(() => {
        if (profile.country) {
            const countryData = allCountriesData.find(c => c.country === profile.country);
            setAvailableCities(countryData ? countryData.cities : []);
        } else {
            setAvailableCities([]);
        }
    }, [profile.country, allCountriesData]);

    useEffect(() => {
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
                setError(t('profile_page.error_fetch'));
                console.error('Fetch profile error:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [t]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prevProfile => {
            const updated = {
                ...prevProfile,
                [name]: type === 'checkbox' ? checked : value,
            };
            if (name === 'country') {
                updated.city = '';
            }
            return updated;
        });
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
            setSuccessMessage(t('profile_page.success_update'));
            // Optionally, update localStorage if first_name is used elsewhere
            if (profile.first_name) localStorage.setItem('first_name', profile.first_name);

        } catch (err) {
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                 const messages = Object.entries(errorData)
                    .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(val) ? val.join(', ') : val}`)
                    .join('; ');
                    setError(t('profile_page.error_update_validation'));
            } else {
                setError(t('profile_page.error_update_generic'));
            }
            console.error('Update profile error:', errorData || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-page-scoped profile-page-layout">
            {/* 4. Use the shared Navbar component */}
            <Navbar isAuthenticated={true} />

            <main className="profile-main-content">
                {/* 5. Replace all static text with the t() function */}
                <div className="profile-header-section">
                    <h1><Icon name="profile" /> {t('profile_page.title')}</h1>
                    <p>{t('profile_page.subtitle')}</p>
                </div>

                {loading && (
                    <div className="loader-container-main">
                        <div className="loader-spinner-main"></div>
                        <p>{t('profile_page.loading')}</p>
                    </div>
                )}

                {!loading && (
                    <div className="profile-form-card">
                        {error && <div className="message-box error-box"><Icon name="alerts" /> {error}</div>}
                        {successMessage && <div className="message-box success-box"><Icon name="save" /> {successMessage}</div>}
                        
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="first_name"><Icon name="firstName" /> {t('profile_page.form.first_name_label')}</label>
                                    <input id="first_name" name="first_name" type="text" placeholder={t('profile_page.form.first_name_placeholder')} value={profile.first_name || ''} onChange={handleChange} disabled={isSubmitting}/>
                                </div>
                                <div className="form-field">
                                    <label htmlFor="last_name"><Icon name="lastName" /> {t('profile_page.form.last_name_label')}</label>
                                    <input id="last_name" name="last_name" type="text" placeholder={t('profile_page.form.last_name_placeholder')} value={profile.last_name || ''} onChange={handleChange} disabled={isSubmitting}/>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="bio"><Icon name="bio" /> {t('profile_page.form.bio_label')}</label>
                                <textarea id="bio" name="bio" placeholder={t('profile_page.form.bio_placeholder')} value={profile.bio || ''} onChange={handleChange} rows="4" disabled={isSubmitting}/>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="country"><Icon name="location" /> {t('profile_page.form.country_label')}</label>
                                    <select 
                                        id="country" 
                                        name="country" 
                                        value={profile.country || ''} 
                                        onChange={handleChange} 
                                        disabled={isSubmitting}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    >
                                        <option value="">{t('profile_page.form.select_country') || 'Select Country'}</option>
                                        {allCountriesData.map((c) => (
                                            <option key={c.country} value={c.country}>{c.country}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label htmlFor="city"><Icon name="location" /> {t('profile_page.form.city_label')}</label>
                                    <select 
                                        id="city" 
                                        name="city" 
                                        value={profile.city || ''} 
                                        onChange={handleChange} 
                                        disabled={isSubmitting || !profile.country}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    >
                                        <option value="">{t('profile_page.form.select_city') || 'Select City'}</option>
                                        {availableCities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-field form-field-checkbox">
                                <input type="checkbox" id="notifications_enabled" name="notifications_enabled" checked={profile.notifications_enabled || false} onChange={handleChange} disabled={isSubmitting}/>
                                <label htmlFor="notifications_enabled" className="checkbox-label">
                                    <Icon name="notifications" /> {t('profile_page.form.notifications_label')}
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-profile-button" disabled={isSubmitting || loading}>
                                    {isSubmitting ? (
                                        <>{t('profile_page.form.button_updating')}</>
                                    ) : (
                                        <><Icon name="save" /> {t('profile_page.form.button_update')}</>
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