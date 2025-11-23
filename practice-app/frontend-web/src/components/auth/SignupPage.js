import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';
import { useTranslation } from 'react-i18next';
import Header from '../common/Header';
import { Country, City, State } from 'country-state-city';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const getCurrentTheme = () => {
  return localStorage.getItem('theme') || 'green';
};

const SignupPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '', email: '', password1: '', password2: '',
    first_name: '', last_name: '', bio: '', city: '', country: '', state: '',
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());

  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(getCurrentTheme());
    };
    document.addEventListener('themeChanged', handleThemeChange);
    return () => {
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const country = Country.getCountryByCode(countryCode);
    setSelectedCountryCode(countryCode);
    setFormData(prev => ({ ...prev, country: country ? country.name : '', city: '', state: '' }));
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    const state = State.getStateByCodeAndCountry(stateCode, selectedCountryCode);
    setSelectedStateCode(stateCode);
    setFormData(prev => ({ ...prev, city: '', state: state ? state.name : '' }));
  };

  const handleCityChange = (e) => {
    setFormData(prev => ({ ...prev, city: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password1 !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to register.');
      return;
    }

    const submissionData = { ...formData };

    try {
      console.debug('Registration attempt:', { 
        email: formData.email, 
        username: formData.username,
        apiUrl: apiUrl 
      });
      await axios.post(`${apiUrl}/auth/register/`, submissionData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const msg = data
        ? Object.entries(data)
            .map(([k, v]) => {
              const fieldName = k.replace('_', ' ');
              return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${Array.isArray(v) ? v.join(', ') : v}`;
            })
            .join('; ')
        : err.message || 'Unknown error';
      setError(`Registration failed: ${msg}`);
      console.error('Signup failed:', data || err.message);
    }
  };

  const imageSrc = currentTheme === 'blue' ? '/wasteimage-blue.png' : '/wasteimage.png';

  return (
    <div className="signup-page-scoped signup-page">
      <Header />

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
                {/* --- UPDATED ORDER: LEFT COLUMN --- */}
                <div className="form-col">
                  <div className="input-box">
                    <label htmlFor="email">
                      {t('signup.email_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="email" name="email" type="email" placeholder={t('signup.placeholder_email')} value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="input-box">
                    <label htmlFor="first_name">{t('signup.first_name_label')}</label>
                    <input id="first_name" name="first_name" type="text" placeholder={t('signup.placeholder_first_name')} value={formData.first_name} onChange={handleChange} />
                  </div>
                  <div className="input-box">
                    <label htmlFor="password1">
                      {t('signup.password_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="password1" name="password1" type="password" placeholder={t('signup.placeholder_password')} value={formData.password1} onChange={handleChange} required />
                  </div>
                  <div className="input-box">
                    <label htmlFor="country">{t('signup.country_label')}</label>
                    <select
                        id="country"
                        name="country"
                        value={selectedCountryCode}
                        onChange={handleCountryChange}
                        style={{ height: '45px', width: '100%', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">{t('signup.placeholder_country')}</option>
                        {Country.getAllCountries().map((country) => (
                            <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* --- UPDATED ORDER: RIGHT COLUMN --- */}
                <div className="form-col">
                   <div className="input-box">
                    <label htmlFor="username">
                      {t('signup.username_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="username" name="username" type="text" placeholder={t('signup.placeholder_username')} value={formData.username} onChange={handleChange} required />
                  </div>
                  <div className="input-box">
                    <label htmlFor="last_name">{t('signup.last_name_label')}</label>
                    <input id="last_name" name="last_name" type="text" placeholder={t('signup.placeholder_last_name')} value={formData.last_name} onChange={handleChange} />
                  </div>
                  <div className="input-box">
                    <label htmlFor="password2">
                      {t('signup.confirm_password_label')}<span className="asterisk">*</span>
                    </label>
                    <input id="password2" name="password2" type="password" placeholder={t('signup.placeholder_confirm_password')} value={formData.password2} onChange={handleChange} required />
                  </div>
                   <div className="input-box">
                    <label htmlFor="state">{t('signup.city_state_label')}</label>
                    <select
                        id="state"
                        name="state"
                        value={selectedStateCode}
                        onChange={handleStateChange}
                        disabled={!selectedCountryCode}
                        style={{ height: '45px', width: '100%', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">{t('signup.placeholder_city_state')}</option>
                        {selectedCountryCode && State.getStatesOfCountry(selectedCountryCode).map((state, index) => (
                            <option key={`${state.isoCode}-${index}`} value={state.isoCode}>{state.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-box bio-input-box">
                <label htmlFor="bio">{t('signup.bio_label')}</label>
                <textarea id="bio" name="bio" placeholder={t('signup.placeholder_bio')} rows={4} value={formData.bio} onChange={handleChange} className="bio-full" />
              </div>
              
              <div className="terms-box">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required 
                />

                <label htmlFor="terms">
                  {t('signup.accept_terms_prefix')} 
                  <Link to="/terms" target="_blank" rel="noopener noreferrer">
                    {t('signup.accept_terms_link')}
                  </Link>
                  {t('signup.accept_terms_suffix')}
                </label>
              </div>

              {error && <p className="error-message">{error}</p>}

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
            <img src={imageSrc} alt="Recycling illustration" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;