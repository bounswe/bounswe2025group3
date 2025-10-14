import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = () => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'tr' : 'en';
        i18n.changeLanguage(newLang);
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
                    <li className="nav-item">
                       <button onClick={toggleLanguage} className="language-toggle-button">
                            {i18n.language === 'en' ? 'TR' : 'EN'}
                       </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Header;