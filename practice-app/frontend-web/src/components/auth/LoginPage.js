import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import Header from '../common/Header';
//import jwt_decode from 'jwt-decode'; // Optional if you want to decode the token

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';
const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = process.env.REACT_APP_GITHUB_REDIRECT_URI || 'http://localhost:3000/github-callback';

const handleSocialLogin = (provider) => {
    console.debug('Social login initiated:', { provider, API_URL });
    if (provider === 'google') {
        window.location.href = `${API_URL}/accounts/google/login/`;
    }
    else if (provider === 'github') {
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`;
        window.location.href = githubAuthUrl;
    }
    // You can handle other providers similarly
};



const LoginPage = () => {
    const { t } = useTranslation();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!credentials.email || !credentials.password) {
            setError('Please enter both Email and Password.');
            return;
        }
        try {
            console.debug('Login attempt:', { email: credentials.email, apiUrl: API_URL });
            const response = await axios.post(`${API_URL}/api/token/`, {
                email: credentials.email,
                password: credentials.password,
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('role', response.data.role);
            navigate('/dashboard');
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData) {
                const errorMessage = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('; ');
                setError(errorMessage || 'Invalid Email or Password.');
            } else {
                setError('Login failed: ' + (error.message || 'Unknown error'));
            }
            console.error('Login failed:', errorData || error.message);
        }
    };

    // Handle Google login response
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            console.debug('Google login attempt:', { credential: !!credentialResponse.credential, apiUrl: API_URL });
            // Send the Google credential to your backend
            const response = await axios.post(`${API_URL}/api/auth/google/`, {
                id_token: credentialResponse.credential
            });
            
            // Save tokens and user info
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('role', response.data.role || 'user');
            
            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Google login failed:', error);
            setError('Google login failed: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
        }
    };

    return (
        // *** THE FIX IS HERE: Add the 'login-page-scoped' class for scoping ***
        <div className="login-page-scoped login-page">
            <Header />
            
            <div className="login-container">
                <div className="main-content">
                    <div className="form-section">
                        <h1 className="main-heading">
                            {t('login.title_line1')}<br />
                            {t('login.title_line2')}
                        </h1>
                        <p className="welcome-text">{t('login.welcome')}</p>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="email-section">
                                <div className="section-indicator">
                                    <div className="indicator-dot"></div>
                                    <span>{t('login.email_section_title')}</span>
                                </div>
                                
                                <div className="input-box">
                                    <label htmlFor="email">{t('login.email_label')}</label>
                                    <input
                                        id="email" type="email" placeholder="test@example.com"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                <div className="input-box">
                                    <label htmlFor="password">{t('login.password_label')}</label>
                                    <input
                                        id="password" type="password" placeholder="***************"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                {error && <p className="error-message">{error}</p>}
                                
                                <div className="options">
                                    <label className="remember-me">
                                        <input 
                                            type="checkbox" checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                        />
                                        <span>{t('login.remember_me')}</span>
                                    </label>
                                    <Link to="/forgot-password" className="forgot-password">
                                        {t('login.forgot_password')}
                                    </Link>
                                </div>
                                
                                <div className="action-buttons">
                                    <button type="submit" className="login-btn">
                                        {t('login.login_button')}
                                    </button>
                                    <button type="button" className="signup-btn" onClick={() => navigate('/signup')}>
                                        {t('login.signup_button')}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="social-section">
                                <p className="or-login">{t('login.social_login_prompt')}</p>
                                <div className="social-options">
                                    <button type="button" className="social-button github" onClick={() => handleSocialLogin('github')}>
                                        <i className="social-icon github-icon"></i>
                                        <span>{t('login.github_button')}</span>
                                    </button>
                                    <button type="button" className="social-button linkedin" onClick={() => handleSocialLogin('linkedin')}>
                                        <i className="social-icon linkedin-icon"></i>
                                        <span>{t('login.linkedin_button')}</span>
                                    </button>
                                    <div className="social-button google">
                                        <GoogleLogin
                                            onSuccess={handleGoogleLoginSuccess}
                                            onError={() => { setError(t('login.error_google_failed')); }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div className="image-section">
                        <img src="/wasteimage.png" alt="Recycling bin character" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;