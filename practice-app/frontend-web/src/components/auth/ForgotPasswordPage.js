import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../common/Header';
import './ForgotPasswordPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

// Helper function to get the current theme from local storage
const getCurrentTheme = () => {
    // *** FIX 1: Default to 'green' to match the ThemeSwitcher's default state ***
    return localStorage.getItem('theme') || 'green';
};

const ForgotPasswordPage = () => {
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
    const navigate = useNavigate();

    // Use useEffect to listen for theme changes
    useEffect(() => {
        const handleStorageChange = () => {
            setCurrentTheme(getCurrentTheme());
        };

        // This event fires when localStorage is changed in ANOTHER tab.
        // For same-tab updates, we also need a custom event.
        window.addEventListener('storage', handleStorageChange);

        // Your ThemeSwitcher likely updates state, but doesn't notify other components.
        // A custom event is a good way to solve this globally.
        // Let's assume the switcher will dispatch this event.
        const handleThemeChange = () => {
            setCurrentTheme(getCurrentTheme());
        }
        document.addEventListener('themeChanged', handleThemeChange);


        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('themeChanged', handleThemeChange);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!email) {
            setError(t('forgot_password.error_enter_email'));
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_URL}/api/auth/password_reset/`, { email });
            setMessage(t('forgot_password.success_message'));
            setEmail('');
        } catch (err) {
            setMessage(t('forgot_password.success_message'));
            console.error('Forgot password error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // *** FIX 2: Check for 'blue' to match the value set by the ThemeSwitcher ***
    const imageSrc = currentTheme === 'blue' ? '/wasteimage-blue.png' : '/wasteimage.png';

    return (
        <div className="forgot-password-page-scoped forgot-password-page">
            <Header />
            
            <div className="login-container">
                <div className="main-content">
                    <div className="form-section">
                        <h1 className="main-heading">{t('forgot_password.title')}</h1>
                        <p className="welcome-text">{t('forgot_password.subtitle')}</p>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="email-section">
                                {message && <p className="success-message">{message}</p>}
                                {error && <p className="error-message">{error}</p>}

                                <div className="input-box">
                                    <label htmlFor="email">{t('forgot_password.email_label')}</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder={t('forgot_password.placeholder_email')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div className="action-buttons">
                                    <button type="submit" className="login-btn" disabled={loading}>
                                        {loading ? t('forgot_password.button_sending') : t('forgot_password.button_send_link')}
                                    </button>
                                </div>
                                <p className="alternate-action-text" style={{ marginTop: '1.5rem' }}>
                                    {t('forgot_password.alternate_action_prompt')}{' '}
                                    <Link to="/login">{t('common.nav.login')}</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                    <div className="image-section">
                        <img src={imageSrc} alt="Illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;