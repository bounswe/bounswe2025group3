import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
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
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login to Zero Waste Challenge</h2>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter Email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter Password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;