// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const SignupPage = () => {
  /* ---------- state ---------- */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    country: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /* ---------- submit ---------- */
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
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      const msg = data
        ? Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('; ')
        : err.message || 'Unknown error';
      setError(`Registration failed: ${msg}`);
      console.error('Signup failed:', data || err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <nav className="navbar">
          <div className="logo">Greener</div>
          <ul className="nav-links">
            <li>Home</li>
            <li>About us</li>
            <li>Blog</li>
            <li>Pricing</li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="form-section">
            <h2 className="main-heading">
              Join the <span style={{ color: 'var(--accent)' }}>Zero Waste</span> Movement
            </h2>
            <p>Create an account to start logging and recycling your waste.</p>
            <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span> Fields marked with * are mandatory to
              fill.
            </p>

            <form onSubmit={handleSubmit}>

              <div className="form-columns">

                <div className="form-col">
                  <div className="input-box">
                    <label htmlFor="username">
                      Username<span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>
                    </label>
                    <input
                      id="username"
                      type="text"
                      placeholder="Enter Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="email">
                      Email<span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="password1">
                      Password<span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>
                    </label>
                    <input
                      id="password1"
                      type="password"
                      placeholder="Enter Password"
                      value={formData.password1}
                      onChange={(e) => setFormData({ ...formData, password1: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="password2">
                      Confirm Password<span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>
                    </label>
                    <input
                      id="password2"
                      type="password"
                      placeholder="Confirm Password"
                      value={formData.password2}
                      onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-col">
                  <div className="input-box">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      id="first_name"
                      type="text"
                      placeholder="Enter First Name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      id="last_name"
                      type="text"
                      placeholder="Enter Last Name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      placeholder="Enter City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      type="text"
                      placeholder="Enter Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="input-box">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  rows={12}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bio-full"
                />
              </div>

              {error && <p className="error">{error}</p>}

              <div className="buttons">
                <button type="submit" className="login">Sign Up</button>
                <button type="button" className="signup" onClick={() => navigate('/')}>
                  Back to Login
                </button>
              </div>
            </form>
          </div>

          <div className="image-section">
            <img src="/wasteimage.png" alt="Recycling illustration" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;