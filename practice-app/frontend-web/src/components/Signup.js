import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: '',
        first_name: '',
        last_name: '',
        bio: '',
        city: '',
        country: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password1 !== formData.password2) {
            setError('Passwords do not match.');
            return;
        }
        try {
            await axios.post('http://127.0.0.1:8000/api/auth/register/', formData);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData) {
                const errorMessage = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('; ');
                setError(errorMessage || 'Registration failed. Please check your inputs.');
            } else {
                setError('Registration failed: ' + (error.message || 'Unknown error'));
            }
            console.error('Signup failed:', errorData || error.message);
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit} className="signup-form">
                <h2>Sign Up for Zero Waste Challenge</h2>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password1">Password</label>
                    <input
                        id="password1"
                        type="password"
                        placeholder="Enter Password"
                        value={formData.password1}
                        onChange={(e) => setFormData({ ...formData, password1: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password2">Confirm Password</label>
                    <input
                        id="password2"
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.password2}
                        onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                        id="first_name"
                        type="text"
                        placeholder="Enter First Name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                        id="last_name"
                        type="text"
                        placeholder="Enter Last Name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                        id="bio"
                        placeholder="Tell us about yourself"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                        id="city"
                        type="text"
                        placeholder="Enter City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                        id="country"
                        type="text"
                        placeholder="Enter Country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Signup;