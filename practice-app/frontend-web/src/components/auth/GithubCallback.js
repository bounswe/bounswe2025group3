import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const GithubCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) {
            setError('No code found in URL.');
            setLoading(false);
            return;
        }

        // Exchange code for access token via backend
        const exchangeCodeForToken = async () => {
            try {
                // You may need a backend endpoint to exchange code for access token
                // For now, assume the backend can handle code directly at /api/auth/github/
                const response = await axios.post(`${API_URL}/api/auth/github/`, {
                    code: code // Send both for flexibility
                });
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('email', response.data.email);
                localStorage.setItem('role', response.data.role || 'user');
                setLoading(false);
                navigate('/dashboard');
            } catch (err) {
                setError('GitHub login failed: ' + (err.response?.data?.error || err.message || 'Unknown error'));
                setLoading(false);
            }
        };
        exchangeCodeForToken();
    }, [navigate]);

    if (loading) {
        return <div>Logging in with GitHub...</div>;
    }
    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }
    return null;
};

export default GithubCallback; 