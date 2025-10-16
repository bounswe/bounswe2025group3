// src/pages/auth/ForgotPasswordPage.js (or your preferred path)
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LoginPage.css'; // Reusing styles
import Header from '../common/Header';
// You might want a specific CSS for minor adjustments:
// import './ForgotPasswordPage.css'; 

// Use environment variable or default to localhost:10000
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

const ForgotPasswordPage = () => {
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!email) {
            setError(t('forgot_password.error_enter_email')); // Use translated error
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_URL}/api/auth/password_reset/`, { email });
            setMessage(t('forgot_password.success_message')); // Use translated success message
            setEmail('');
        } catch (err) {
            // Per security best practice, show the same success message even on failure
            setMessage(t('forgot_password.success_message'));
            console.error('Forgot password error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page forgot-password-page">
            {/* 4. Use the shared Header component */}
            <Header />
            
            <div className="login-container">
                <div className="main-content">
                    <div className="form-section">
                        {/* 5. Replace all static text with t() function */}
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
                        <img src="/wasteimage.png" alt="Illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;