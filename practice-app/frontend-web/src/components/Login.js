import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Stil dosyası eklendi

const Login = () => {
    const [credentials, setCredentials] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!credentials.identifier || !credentials.password) {
            setError('Please enter both Username/Email and Password.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username: credentials.identifier, // Backend accepts username or email as 'username'
                password: credentials.password,
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            alert('Login successful!');
            navigate('/waste');
        } catch (error) {
            console.error('Login failed:', error);
            setError('Invalid Username/Email or Password.');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login to Zero Waste Challenge</h2>
                <div className="form-group">
                    <label htmlFor="identifier">Username or Email</label>
                    <input
                        id="identifier"
                        type="text"
                        placeholder="Enter Username or Email"
                        value={credentials.identifier}
                        onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
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