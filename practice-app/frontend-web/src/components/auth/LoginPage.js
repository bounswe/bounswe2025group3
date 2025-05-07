import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import './LoginPage.css';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
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
            alert('Login successful!');
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
            <div className="login-container">
                <Navbar isAuthenticated={false} />
                <div className="main-content">
                    <div className="form-section">
                        <h2 className="main-heading">
                            Log Your Wastes And Recycle
                            <br />
                            For A Greener Future
                        </h2>
                        <p>Welcome back! Please login to your account.</p>
                        <form onSubmit={handleSubmit}>
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
                            {error && <p className="error">{error}</p>}
                            <div className="options">
                                <label>
                                    <input type="checkbox" /> Remember Me
                                </label>
                                <a href="#">Forgot Password?</a>
                            </div>
                            <div className="buttons">
                                <button type="submit" className="login">
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className="signup"
                                    onClick={() => navigate('/signup')}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </form>
                        <p className="social-login">Or login with</p>
                        <div className="social-links">
                            <span>Facebook</span>
                            <span>LinkedIn</span>
                            <span>Google</span>
                        </div>
                    </div>
                    <div className="image-section">
                        <img src="/wasteimage.png" alt="Waste illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;