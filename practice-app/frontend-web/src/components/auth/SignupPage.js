import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
//import './LoginPage.css'; // For shared base styles
import './SignupPage.css'; // For signup-specific styles
import { useTranslation } from 'react-i18next';
import Header from '../common/Header'; // Shared header component

// Use environment variable or default to localhost:10000
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

const SignupPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '', // Changed from password1 to password to match backend
    password2: '',
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    country: '',
  });

const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to register.');
      return;
    }

    // Prepare data for submission, backend might expect 'password' not 'password1'
    const submissionData = { ...formData };
    //delete submissionData.password2; // Don't send password2 to backend

    try {
      console.debug('Registration attempt:', { 
        email: formData.email, 
        username: formData.username,
        apiUrl: API_URL 
      });
      // Ensure your backend endpoint for registration is correct
      // and it expects 'password' field not 'password1'.
      // If it expects 'password1', change 'password' back to 'password1' in state and here.
      await axios.post(`${API_URL}/api/auth/register/`, submissionData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const msg = data
        ? Object.entries(data)
            .map(([k, v]) => {
              const fieldName = k.replace('_', ' '); // Make field names more readable
              return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${Array.isArray(v) ? v.join(', ') : v}`;
            })
            .join('; ')
        : err.message || 'Unknown error';
      setError(`Registration failed: ${msg}`);
      console.error('Signup failed:', data || err.message);
    }
  };

  return (
    // *** THE FIX IS HERE: Add the 'signup-page-scoped' class for scoping ***
    <div className="signup-page-scoped signup-page">
      <Header />

      {/* --- RE-USING LOGIN CONTAINER STRUCTURE --- */}
      {/* We scope the inner elements with .signup-page-scoped */}
      <div className="login-container">
        <div className="main-content">
          <div className="form-section">
            <h1 className="main-heading">
              {t('signup.title_part1')}{' '}
              <span style={{ color: 'var(--accent-navbar)' }}>{t('signup.title_part2')}</span>{' '}
              {t('signup.title_part3')}
            </h1>
            <p className="welcome-text">{t('signup.subtitle')}</p>
            <p className="mandatory-note">
              {t('signup.mandatory_note').split('*')[0]}
              <span className="asterisk">*</span>
              {t('signup.mandatory_note').split('*')[1]}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-columns">
                <div className="form-col">
                  {/* Username, Email, Password, Confirm Password Inputs */}
                   <div className="input-box">
                    <label htmlFor="username">
                      {t('signup.username_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="username" name="username" type="text" placeholder={t('signup.placeholder_username')} value={formData.username} onChange={handleChange} required />
                  </div>
                  <div className="input-box">
                    <label htmlFor="email">
                      {t('signup.email_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="email" name="email" type="email" placeholder={t('signup.placeholder_email')} value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="input-box">
                    <label htmlFor="password">
                      {t('signup.password_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="password" name="password" type="password" placeholder={t('signup.placeholder_password')} value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="input-box">
                    <label htmlFor="password2">
                      {t('signup.confirm_password_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="password2" name="password2" type="password" placeholder={t('signup.placeholder_confirm_password')} value={formData.password2} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-col">
                  {/* First Name, Last Name, City, Country Inputs */}
                   <div className="input-box">
                    <label htmlFor="first_name">{t('signup.first_name_label')}</label>
                    <input id="first_name" name="first_name" type="text" placeholder={t('signup.placeholder_first_name')} value={formData.first_name} onChange={handleChange} />
                  </div>
                  <div className="input-box">
                    <label htmlFor="last_name">{t('signup.last_name_label')}</label>
                    <input id="last_name" name="last_name" type="text" placeholder={t('signup.placeholder_last_name')} value={formData.last_name} onChange={handleChange} />
                  </div>
                  <div className="input-box">
                    <label htmlFor="city">{t('signup.city_label')}</label>
                    <input id="city" name="city" type="text" placeholder={t('signup.placeholder_city')} value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="input-box">
                    <label htmlFor="country">{t('signup.country_label')}</label>
                    <input id="country" name="country" type="text" placeholder={t('signup.placeholder_country')} value={formData.country} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="input-box bio-input-box">
                <label htmlFor="bio">{t('signup.bio_label')}</label>
                <textarea id="bio" name="bio" placeholder={t('signup.placeholder_bio')} rows={4} value={formData.bio} onChange={handleChange} className="bio-full" />
              </div>

              <div className="terms-box">
                <input
                  type="checkbox" id="terms" name="terms"
                  checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <label htmlFor="terms">
                  {t('signup.accept_terms_prefix', 'I accept the ')}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer">
                    {t('signup.accept_terms_link', 'Terms and Conditions')}
                  </Link>
                </label>
              </div>

              {error && <p className="error-message">{error}</p>}

              {/* --- Re-using action-buttons structure from login --- */}
              <div className="action-buttons">
                <button type="submit" className="login-btn">{t('signup.signup_button')}</button>
                <button type="button" className="signup-btn" onClick={() => navigate('/login')}>
                  {t('signup.back_to_login_button')}
                </button>
              </div>
            </form>
            <p className="alternate-action-text">
              {t('signup.alternate_action_prompt')}{' '}
              <Link to="/login">{t('signup.alternate_action_login')}</Link>
            </p>
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