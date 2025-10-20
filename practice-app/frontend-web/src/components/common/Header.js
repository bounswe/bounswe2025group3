import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.css';
import ThemeSwitcher from './ThemeSwitcher';
import './ThemeSwitcher.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [langChecked, setLangChecked] = useState(i18n.language === 'en');

  useEffect(() => {
    setLangChecked(i18n.language === 'en'); // i18n ile sync
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = langChecked ? 'tr' : 'en'; // checkbox state’e göre toggle
    setLangChecked(!langChecked);              // slider anında hareket etsin
    i18n.changeLanguage(newLang);              // dil değişsin
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="nav-container">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <img src="/icon.png" alt="Greener Logo" className="navbar-logo-image" />
          <span className="navbar-app-name">GREENER</span>
        </Link>
        <ul className="main-nav">
          {/* Language toggle */}
          <li className="nav-item toggle-item">
            <label className="ios-switch">
              <input 
                type="checkbox" 
                checked={langChecked} 
                onChange={toggleLanguage} 
              />
              <span className="ios-slider"></span>
              <span className="ios-label">{langChecked ? 'EN' : 'TR'}</span>
            </label>
          </li>

          {/* Theme toggle */}
          <li className="nav-item theme-switcher-li">
            <ThemeSwitcher />
          </li>

          <li className="nav-item">
            <NavLink to="/" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('common.nav.home')}</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/about" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('common.nav.about')}</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/blog" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('common.nav.blog')}</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/login" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('common.nav.login')}</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/signup" className="nav-button-style signup-button-style">{t('common.nav.signup')}</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
