import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getUserProfile, updateUserProfile } from '../../services/api'; 
import { useTranslation } from 'react-i18next';
import { Country, State } from 'country-state-city';
import Navbar from '../common/Navbar';
import './Profile.css'; 

const Icon = ({ name, className = "" }) => {
    const icons = {
        profile: '👤', firstName: '🧑', lastName: '🧑‍🦱', bio: '📝', location: '📍', 
        notifications: '🔔', save: '💾', alerts: '⚠️', privacy: '🕵️', settings: '⚙️'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const Profile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        city: '',
        country: '',
        notifications_enabled: false,
        is_anonymous: false 
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // YENİ: Alan bazlı hatalar (Blacklist için)
    const [fieldErrors, setFieldErrors] = useState({});

    const [allCountriesData, setAllCountriesData] = useState(Country.getAllCountries());
    const [availableCities, setAvailableCities] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        // eslint-disable-next-line
    }, [token]);

    useEffect(() => {
        if (profile.country) {
            const countryObj = allCountriesData.find(c => c.name === profile.country);
            if (countryObj) {
                setAvailableCities(State.getStatesOfCountry(countryObj.isoCode));
            } else {
                setAvailableCities([]);
            }
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
                setProfile({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    bio: data.bio || '',
                    city: data.city || '',
                    country: data.country || '',
                    notifications_enabled: data.notifications_enabled || false,
                    is_anonymous: data.is_anonymous || false 
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
        
        // YENİ: Kullanıcı yazarken hatayı temizle
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setFieldErrors({}); // Reset
        setIsSubmitting(true);
        try {
            const { email, username, id, date_joined, role, ...updatePayload } = profile;
            
            await updateUserProfile(updatePayload);
            setSuccessMessage(t('profile_page.success_update'));
            
            if (profile.first_name) localStorage.setItem('first_name', profile.first_name);

        } catch (err) {
            const errorData = err.response?.data;
            
            if (err.response?.status === 400 && errorData && typeof errorData === 'object') {
                 const newErrors = {};
                 const genericMessages = [];

                 Object.keys(errorData).forEach(key => {
                     let errorContent = errorData[key];
                     let msg = "";

                     // İç içe obje kontrolü (Nested object protection)
                     if (Array.isArray(errorContent)) {
                         msg = errorContent[0];
                     } else if (typeof errorContent === 'object' && errorContent !== null) {
                         // Nested obje: { bio: { bio: "Error" } } durumu
                         if (errorContent[key]) {
                             const nested = errorContent[key];
                             msg = Array.isArray(nested) ? nested[0] : nested;
                         } else {
                             const firstVal = Object.values(errorContent)[0];
                             msg = Array.isArray(firstVal) ? firstVal[0] : firstVal;
                         }
                     } else {
                         msg = errorContent;
                     }

                     // React child hatası almamak için string olduğundan emin ol
                     if (typeof msg === 'object') {
                         msg = JSON.stringify(msg);
                     }

                     // --- TRANSLATION LOGIC (BLACKLIST) ---
                     if (typeof msg === 'string' && msg.toLowerCase().includes("banned word")) {
                         msg = t('profile_page.error_banned_word');
                     }
                     // -------------------------------------

                     if (['first_name', 'last_name', 'bio'].includes(key)) {
                         newErrors[key] = msg;
                     } else {
                         genericMessages.push(`${key.replace(/_/g, ' ')}: ${msg}`);
                     }
                 });

                 setFieldErrors(newErrors);
                 
                 if (genericMessages.length > 0) {
                     setError(genericMessages.join('; '));
                 } else {
                     setError(t('profile_page.error_update_validation')); 
                 }
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
            <Navbar isAuthenticated={true} />

            <main className="profile-main-content">
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
                            
                            {/* --- KİŞİSEL BİLGİLER --- */}
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="first_name"><Icon name="firstName" /> {t('profile_page.form.first_name_label')}</label>
                                    <input 
                                        id="first_name" 
                                        name="first_name" 
                                        type="text" 
                                        placeholder={t('profile_page.form.first_name_placeholder')} 
                                        value={profile.first_name || ''} 
                                        onChange={handleChange} 
                                        disabled={isSubmitting}
                                        style={fieldErrors.first_name ? {borderColor: '#dc3545'} : {}}
                                    />
                                    {/* Blacklist hatası */}
                                    {fieldErrors.first_name && <small style={{color: '#dc3545'}}>{fieldErrors.first_name}</small>}
                                </div>
                                <div className="form-field">
                                    <label htmlFor="last_name"><Icon name="lastName" /> {t('profile_page.form.last_name_label')}</label>
                                    <input 
                                        id="last_name" 
                                        name="last_name" 
                                        type="text" 
                                        placeholder={t('profile_page.form.last_name_placeholder')} 
                                        value={profile.last_name || ''} 
                                        onChange={handleChange} 
                                        disabled={isSubmitting}
                                        style={fieldErrors.last_name ? {borderColor: '#dc3545'} : {}}
                                    />
                                    {/* Blacklist hatası */}
                                    {fieldErrors.last_name && <small style={{color: '#dc3545'}}>{fieldErrors.last_name}</small>}
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="bio"><Icon name="bio" /> {t('profile_page.form.bio_label')}</label>
                                <textarea 
                                    id="bio" 
                                    name="bio" 
                                    placeholder={t('profile_page.form.bio_placeholder')} 
                                    value={profile.bio || ''} 
                                    onChange={handleChange} 
                                    rows="4" 
                                    disabled={isSubmitting}
                                    style={fieldErrors.bio ? {borderColor: '#dc3545'} : {}}
                                />
                                {/* Blacklist hatası */}
                                {fieldErrors.bio && <small style={{color: '#dc3545'}}>{fieldErrors.bio}</small>}
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
                                            <option key={c.isoCode} value={c.name}>{c.name}</option>
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
                                            <option key={city.isoCode} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <hr className="form-divider" />

                            <div className="preferences-section">
                                <h3 className="section-title"><Icon name="settings" /> {t('profile_page.preferences_title')}</h3>
                                
                                <div className="form-field form-field-checkbox">
                                    <input type="checkbox" id="notifications_enabled" name="notifications_enabled" checked={profile.notifications_enabled || false} onChange={handleChange} disabled={isSubmitting}/>
                                    <label htmlFor="notifications_enabled" className="checkbox-label">
                                        <Icon name="notifications" /> {t('profile_page.form.notifications_label')}
                                    </label>
                                </div>

                                <div className="form-field form-field-checkbox">
                                    <input type="checkbox" id="is_anonymous" name="is_anonymous" checked={profile.is_anonymous || false} onChange={handleChange} disabled={isSubmitting}/>
                                    <label htmlFor="is_anonymous" className="checkbox-label">
                                        <Icon name="privacy" /> {t('profile_page.form.anonymous_label')}
                                    </label>
                                </div>
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