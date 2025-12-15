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
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
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
    if (fieldErrors[e.target.name]) {
        setFieldErrors(prev => ({...prev, [e.target.name]: null}));
    }
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

  // Basit E-posta format kontrolü
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    // --- FRONTEND VALIDASYONU (Boş alanlar ve E-posta formatı için) ---
    const errors = {};
    let hasError = false;

    // Basit E-posta regex
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.email) {
        errors.email = t('signup.error_required_field');
        hasError = true;
    } else if (!emailRegex.test(formData.email)) {
        errors.email = t('signup.error_email_invalid');
        hasError = true;
    }

    if (!formData.username) {
        errors.username = t('signup.error_required_field');
        hasError = true;
    }

    if (!formData.password1) {
        errors.password1 = t('signup.error_required_field'); 
        hasError = true;
    }

    if (!formData.password2) {
        errors.password2 = t('signup.error_required_field');
        hasError = true;
    }

    if (formData.password1 && formData.password2 && formData.password1 !== formData.password2) {
        setGeneralError(t('signup.error_passwords_no_match'));
        hasError = true;
    }

    if (!termsAccepted) {
        setGeneralError(t('signup.error_terms_required'));
        hasError = true;
    }

    if (hasError) {
        setFieldErrors(errors);
        return; 
    }
    // --- FRONTEND VALIDASYONU BİTİŞ ---

    const submissionData = { ...formData };

    try {
      await axios.post(`${apiUrl}/auth/register/`, submissionData);
      
      // JSON'a eklediğimiz success_message artık düzgün görünecek
      alert(t('signup.success_message'));
      navigate('/login');

    } catch (err) {
      const data = err.response?.data;
      
      if (err.response?.status === 400 && data) {
          const newFieldErrors = {};
          let genericMsg = "";

          Object.keys(data).forEach(key => {
              let errorContent = data[key];
              let errorMessage = "";

              // Hata içeriğini string'e dönüştürme mantığı
              if (Array.isArray(errorContent)) errorMessage = errorContent[0];
              else if (typeof errorContent === 'object' && errorContent !== null) {
                  if (errorContent[key]) errorMessage = Array.isArray(errorContent[key]) ? errorContent[key][0] : errorContent[key];
                  else errorMessage = Array.isArray(Object.values(errorContent)[0]) ? Object.values(errorContent)[0][0] : Object.values(errorContent)[0];
              } else errorMessage = errorContent;

              if (typeof errorMessage === 'object') errorMessage = JSON.stringify(errorMessage);

              // --- BACKEND HATA MESAJLARINI ÇEVİRİ İLE EŞLEŞTİRME ---
              
              // 1. Yasaklı Kelime
              if (errorMessage.includes("banned word")) {
                  errorMessage = t('signup.error_banned_word');
              } 
              // 2. Geçersiz Kullanıcı Adı (Karakter hatası)
              else if (errorMessage.includes("Enter a valid username")) {
                  errorMessage = t('signup.error_username_invalid');
              } 
              // 3. Geçersiz E-posta (Backend: "Enter a valid email address.")
              else if (errorMessage.includes("Enter a valid email address")) {
                errorMessage = t('signup.error_email_invalid');
            }// 3. Şifre Çok Kısa (Backend: "Password must be at least 6 characters long")
              else if (errorMessage.includes("at least 6 characters")) {
                  errorMessage = t('signup.error_password_too_short');
              }
              // 4. Şifre Sadece Sayısal (Backend: "Password cannot be entirely numeric")
              else if (errorMessage.includes("entirely numeric")) {
                  errorMessage = t('signup.error_password_numeric');
              }
              // 5. Zorunlu Alan (Backend'den gelirse)
              else if (errorMessage.includes("This field is required")) {
                  errorMessage = t('signup.error_required_field');
              }

              // -------------------------------------------------------

              if (['username', 'first_name', 'last_name', 'bio', 'email', 'password1', 'password2'].includes(key)) {
                  // Backend genelde password hatalarını "password" key'i ile değil,
                  // eğer serializer'da field adı password ise password, değilse password1 olarak döner.
                  // Bizim formumuzda password1 kullanıyoruz, backend muhtemelen non_field_errors veya password olarak dönüyordur.
                  // Eşleşmeyi garantiye almak için:
                  if (key === 'password') {
                      newFieldErrors['password1'] = errorMessage;
                  } else {
                      newFieldErrors[key] = errorMessage;
                  }
              } else {
                  genericMsg += `${key}: ${errorMessage} `;
              }
          });

          setFieldErrors(newFieldErrors);
          if (genericMsg) setGeneralError(genericMsg);
          
          if (Object.keys(newFieldErrors).length === 0 && !genericMsg && data.detail) {
              setGeneralError(data.detail);
          }
      } else {
          setGeneralError(err.message || 'Unknown error');
      }
    }
  };

  const imageSrc = currentTheme === 'blue' ? '/wasteimage-blue.png' : '/wasteimage.png';

  const getInputStyle = (fieldName) => {
      return fieldErrors[fieldName] ? { borderColor: '#dc3545' } : {};
  };

  // Password alanları için özel hata stili (password1 ve password2 isimleri state'teki keyler ile aynı olmalı)
  const getPasswordStyle = (fieldName) => {
      return fieldErrors[fieldName] ? { borderColor: '#dc3545' } : {};
  };

  return (
    <div className="signup-page-scoped signup-page">
      <Header />

      <div className="login-container">
        <div className="main-content">
          <div className="form-section">
            <h1 className="main-heading">
              {t('signup.title_part1')} <span style={{ color: 'var(--accent-navbar)' }}>{t('signup.title_part2')}</span> {t('signup.title_part3')}
            </h1>
            <p className="welcome-text">{t('signup.subtitle')}</p>
            <p className="mandatory-note">
              {t('signup.mandatory_note').split('*')[0]}<span className="asterisk">*</span>{t('signup.mandatory_note').split('*')[1]}
            </p>

            {/* DİKKAT: noValidate EKLENDİ */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-columns">
                {/* --- LEFT COLUMN --- */}
                <div className="form-col">
                  <div className="input-box">
                    <label htmlFor="email">{t('signup.email_label')}<span className="asterisk">*</span></label>
                    <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder={t('signup.placeholder_email')} 
                        value={formData.email} 
                        onChange={handleChange} 
                        style={getInputStyle('email')} 
                    />
                    {fieldErrors.email && <small style={{color: '#dc3545'}}>{fieldErrors.email}</small>}
                  </div>

                  <div className="input-box">
                    <label htmlFor="first_name">{t('signup.first_name_label')}</label>
                    <input id="first_name" name="first_name" type="text" placeholder={t('signup.placeholder_first_name')} value={formData.first_name} onChange={handleChange} style={getInputStyle('first_name')} />
                    {fieldErrors.first_name && <small style={{color: '#dc3545'}}>{fieldErrors.first_name}</small>}
                  </div>

                  <div className="input-box">
                    <label htmlFor="password1">{t('signup.password_label')}<span className="asterisk">*</span></label>
                    <input 
                        id="password1" 
                        name="password1" 
                        type="password" 
                        placeholder={t('signup.placeholder_password')} 
                        value={formData.password1} 
                        onChange={handleChange} 
                        style={getPasswordStyle('password1')}
                    />
                     {fieldErrors.password1 && <small style={{color: '#dc3545'}}>{fieldErrors.password1}</small>}
                  </div>

                  <div className="input-box">
                    <label htmlFor="country">{t('signup.country_label')}</label>
                    <select id="country" name="country" value={selectedCountryCode} onChange={handleCountryChange} style={{ height: '45px', width: '100%', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                        <option value="">{t('signup.placeholder_country')}</option>
                        {Country.getAllCountries().map((country) => (<option key={country.isoCode} value={country.isoCode}>{country.name}</option>))}
                    </select>
                  </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="form-col">
                   <div className="input-box">
                    <label htmlFor="username">{t('signup.username_label')}<span className="asterisk">*</span></label>
                    <input id="username" name="username" type="text" placeholder={t('signup.placeholder_username')} value={formData.username} onChange={handleChange} style={getInputStyle('username')} />
                    {fieldErrors.username && <small style={{color: '#dc3545'}}>{fieldErrors.username}</small>}
                  </div>

                  <div className="input-box">
                    <label htmlFor="last_name">{t('signup.last_name_label')}</label>
                    <input id="last_name" name="last_name" type="text" placeholder={t('signup.placeholder_last_name')} value={formData.last_name} onChange={handleChange} style={getInputStyle('last_name')} />
                    {fieldErrors.last_name && <small style={{color: '#dc3545'}}>{fieldErrors.last_name}</small>}
                  </div>

                  <div className="input-box">
                    <label htmlFor="password2">{t('signup.confirm_password_label')}<span className="asterisk">*</span></label>
                    <input 
                        id="password2" 
                        name="password2" 
                        type="password" 
                        placeholder={t('signup.placeholder_confirm_password')} 
                        value={formData.password2} 
                        onChange={handleChange} 
                        style={getPasswordStyle('password2')}
                    />
                    {fieldErrors.password2 && <small style={{color: '#dc3545'}}>{fieldErrors.password2}</small>}
                  </div>

                   <div className="input-box">
                    <label htmlFor="state">{t('signup.city_state_label')}</label>
                    <select id="state" name="state" value={selectedStateCode} onChange={handleStateChange} disabled={!selectedCountryCode} style={{ height: '45px', width: '100%', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                        <option value="">{t('signup.placeholder_city_state')}</option>
                        {selectedCountryCode && State.getStatesOfCountry(selectedCountryCode).map((state, index) => (<option key={`${state.isoCode}-${index}`} value={state.isoCode}>{state.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-box bio-input-box">
                <label htmlFor="bio">{t('signup.bio_label')}</label>
                <textarea id="bio" name="bio" placeholder={t('signup.placeholder_bio')} rows={4} value={formData.bio} onChange={handleChange} className="bio-full" style={getInputStyle('bio')} />
                {fieldErrors.bio && <small style={{color: '#dc3545', display: 'block', marginTop: '5px'}}>{fieldErrors.bio}</small>}
              </div>
              
              <div className="terms-box">
                <input type="checkbox" id="terms" name="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                <label htmlFor="terms">
                  {t('signup.accept_terms_prefix')} <Link to="/terms" target="_blank" rel="noopener noreferrer">{t('signup.accept_terms_link')}</Link>{t('signup.accept_terms_suffix')}
                </label>
              </div>

              {generalError && <p className="error-message">{generalError}</p>}

              <div className="action-buttons">
                <button type="submit" className="login-btn">{t('signup.signup_button')}</button>
                <button type="button" className="signup-btn" onClick={() => navigate('/login')}>{t('signup.back_to_login_button')}</button>
              </div>
            </form>
            
            <p className="alternate-action-text">
              {t('signup.alternate_action_prompt')} <Link to="/login">{t('signup.alternate_action_login')}</Link>
            </p>
          </div>
          <div className="image-section"><img src={imageSrc} alt="Recycling illustration" /></div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;