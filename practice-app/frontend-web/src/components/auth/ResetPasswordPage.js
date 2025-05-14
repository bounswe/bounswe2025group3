// src/pages/auth/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import './LoginPage.css'; // Reusing styles
// import './ResetPasswordPage.css'; // For specific styles

// Use environment variable or default to localhost:10000
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { uid, token } = useParams(); // Get uid and token from URL path parameters
    
    // Alternative if uid/token are query params:
    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const uidFromQuery = queryParams.get('uid');
    // const tokenFromQuery = queryParams.get('token');

    // useEffect(() => {
    //     // Optional: Validate token presence early, though backend will do the final validation
    //     if (!uid || !token) {
    //         setError("Invalid password reset link. Please request a new one.");
    //         // navigate('/forgot-password'); // Or show error and hide form
    //     }
    // }, [uid, token, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!password || !confirmPassword) {
            setError('Please enter and confirm your new password.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) { // Basic validation, backend should enforce more
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        try {
            console.debug('Password reset confirmation:', { uid, token, apiUrl: API_URL });
            // Replace with your backend endpoint for confirming password reset
            // The backend will use the uid and token to verify the request
            await axios.post(`${API_URL}/api/auth/password_reset_confirm/${uid}/${token}/`, {
            // Or if sending uid/token in body:
            // await axios.post(`${API_URL}/api/auth/password_reset_confirm/`, {
                // uid: uid, // uidFromQuery
                // token: token, // tokenFromQuery
                new_password1: password,
                new_password2: confirmPassword,
            });
            setMessage('Your password has been successfully reset! You can now log in with your new password.');
            // navigate('/login', { state: { message: 'Password reset successfully. Please log in.' } }); // Optional: pass message
            setTimeout(() => navigate('/login'), 3000); // Redirect after a delay
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                 const errorMessage = Object.entries(errorData)
                    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('; ');
                setError(errorMessage || 'Failed to reset password. The link may be invalid or expired.');
            } else {
                 setError('Failed to reset password. Please try again or request a new link.');
            }
            console.error('Reset password error:', errorData || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page reset-password-page">
            <div className="nav-container">
                <nav className="navbar">
                     <ul className="main-nav">
                        <li className="nav-item"><Link to="/">Home</Link></li>
                        <li className="nav-item"><Link to="/login">Login</Link></li>
                    </ul>
                </nav>
            </div>
            
            <div className="login-container">
                <div className="main-content">
                    <div className="form-section">
                        <h1 className="main-heading">Reset Your Password</h1>
                        
                        {message && <p className="success-message">{message}</p>}
                        {error && <p className="error-message">{error}</p>}

                        {!message && ( // Only show form if no success message
                            <form onSubmit={handleSubmit}>
                                <div className="email-section"> {/* Reusing class for structure */}
                                    <p className="welcome-text" style={{textAlign: 'left', marginBottom: '1.5rem'}}>
                                        Please enter your new password below. Make sure it's secure!
                                    </p>
                                    <div className="input-box">
                                        <label htmlFor="password">New Password</label>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="input-box">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    
                                    <div className="action-buttons">
                                        <button type="submit" className="login-btn" disabled={loading}>
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                        {message && (
                             <Link to="/login" className="login-btn" style={{display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none'}}>
                                Back to Login
                            </Link>
                        )}
                    </div>
                    <div className="image-section">
                        <img src="/wasteimage.png" alt="Illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;