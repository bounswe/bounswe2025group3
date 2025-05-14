// src/pages/auth/ForgotPasswordPage.js (or your preferred path)
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Reusing styles
// You might want a specific CSS for minor adjustments:
// import './ForgotPasswordPage.css'; 

const ForgotPasswordPage = () => {
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
            setError('Please enter your email address.');
            setLoading(false);
            return;
        }

        try {
            // Replace with your backend endpoint for initiating password reset
            await axios.post('http://127.0.0.1:8000/api/auth/password_reset/', { email });
            setMessage('If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).');
            setEmail(''); // Clear the form
        } catch (err) {
            // Even if the email doesn't exist, it's good practice for security
            // to show a generic success message to prevent email enumeration.
            // However, for user feedback during development, you might show more specific errors.
            // For production, always show a generic success message.
            setMessage('If an account with that email exists, a password reset link has been sent.');
            console.error('Forgot password error:', err.response?.data || err.message);
            // setError('Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page forgot-password-page"> {/* Reusing login-page structure */}
            <div className="nav-container">
                <nav className="navbar">
                <Link to="/" className="navbar-brand">
                        <img src="/icon.png" alt="Greener Logo" className="navbar-logo-image" />
                        <span className="navbar-app-name">GREENER</span>
                    </Link>
                    <ul className="main-nav">
                        <li className="nav-item"><Link to="/">Home</Link></li>
                        <li className="nav-item"><Link to="/about">About us</Link></li>
                        <li className="nav-item"><Link to="/blog">Blog</Link></li>
                        <li className="nav-item"><Link to="/login">Login</Link></li>
                        <li className="nav-item"><Link to="/signup">Sign Up</Link></li>
                    </ul>
                </nav>
            </div>
            
            <div className="login-container">
                <div className="main-content"> {/* You might want to simplify this if no image */}
                    <div className="form-section">
                        <h1 className="main-heading">Forgot Your Password?</h1>
                        <p className="welcome-text">
                            No worries! Enter your email address below, and we'll send you a link to reset your password.
                        </p>
                        
                        <form onSubmit={handleSubmit}>
                            {/* Can reuse .email-section or create a new wrapper */}
                            <div className="email-section">
                                {message && <p className="success-message">{message}</p>}
                                {error && <p className="error-message">{error}</p>}

                                <div className="input-box">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div className="action-buttons">
                                    <button type="submit" className="login-btn" disabled={loading}>
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </div>
                                <p className="alternate-action-text" style={{ marginTop: '1.5rem' }}>
                                    Remember your password? <Link to="/login">Log In</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                    {/* Optional: You can remove the image-section or keep it */}
                    <div className="image-section">
                        <img src="/wasteimage.png" alt="Illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;