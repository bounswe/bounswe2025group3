import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

// Social login functionality
const handleSocialLogin = (provider) => {
    console.log(`Attempting to login with ${provider}`);
    // This would typically redirect to OAuth flow
    // For example: window.location.href = `http://127.0.0.1:8000/api/auth/${provider}/`;
};

const LoginPage = () => {
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
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
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

    return (
        <div className="login-page">
            <div className="nav-container">
                <nav className="navbar">
                <Link to="/" className="navbar-brand">
                        <img src="/icon.png" alt="Greener Logo" className="navbar-logo-image" />
                        <span className="navbar-app-name">GREENER</span>
                    </Link>
                    <ul className="main-nav">
                        <li className="nav-item"> {/* Removed 'active' class from Home */}
                            <Link to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about">About us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li className="nav-item active"> {/* Added 'active' class to Login */}
                            <Link to="/login">Login</Link>
                        </li>
                        <li className="nav-item">
                        <Link to="/signup"className="nav-button-style signup-button-style">Sign Up</Link>
            </li>
                    </ul>
                </nav>
            </div>
            
            <div className="login-container">
                <div className="main-content">
                    <div className="form-section">
                        <h1 className="main-heading">
                            Log Your Wastes And Recycle<br />
                            For A Better Nature
                        </h1>
                        <p className="welcome-text">Welcome back! Please login to your account.</p>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="email-section">
                                <div className="section-indicator">
                                    <div className="indicator-dot"></div>
                                    <span>Email Section</span>
                                </div>
                                
                                <div className="input-box">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="test@example.com"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                <div className="input-box">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="***************"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                {error && <p className="error-message">{error}</p>}
                                
                                <div className="options">
                                    <label className="remember-me">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                        />
                                        <span>Remember Me</span>
                                    </label>
                                    <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>

                                </div>
                                
                                <div className="action-buttons">
                                    <button type="submit" className="login-btn">
                                        Login
                                    </button>
                                    <button
                                        type="button"
                                        className="signup-btn"
                                        onClick={() => navigate('/signup')}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                            
                            <div className="social-section">
                                <p className="or-login">Or login with</p>
                                <div className="social-options">
                                    <button 
                                        type="button" 
                                        className="social-button facebook"
                                        onClick={() => handleSocialLogin('facebook')}
                                    >
                                        <i className="social-icon facebook-icon"></i>
                                        <span>Facebook</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        className="social-button linkedin"
                                        onClick={() => handleSocialLogin('linkedin')}
                                    >
                                        <i className="social-icon linkedin-icon"></i>
                                        <span>LinkedIn</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        className="social-button google"
                                        onClick={() => handleSocialLogin('google')}
                                    >
                                        <i className="social-icon google-icon"></i>
                                        <span>Google</span>
                                    </button>
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