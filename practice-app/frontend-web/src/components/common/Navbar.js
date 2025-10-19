// src/components/common/Navbar.js
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css'; // Import the new CSS

// NOTE: It's best to move this Icon component to its own file 
// (e.g., src/components/common/Icon.js) and import it where needed.
const Icon = ({ name, className = '' }) => {
  const icons = {
    logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆', 
    dashboard: '🏠', goal: '🎯', language: '🌐', logout: '🚪', events: '📅',
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};


const Navbar = ({ isAuthenticated }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'tr' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    // Render nothing if not authenticated
    if (!isAuthenticated) {
        return null; 
    }

    return (
        <header className="dashboard-top-nav">
            <Link to="/dashboard" className="app-logo">
                <Icon name="logo" /> Greener
            </Link>

            <nav className="main-actions-nav">
                <button onClick={toggleLanguage} className="nav-action-item">
                    <Icon name="language" /> {i18n.language === 'en' ? 'TR' : 'EN'}
                </button>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
                    <Icon name="dashboard" /> {t('dashboard_nav.dashboard')}
                </NavLink>
                <NavLink to="/waste" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
                    <Icon name="waste" /> {t('dashboard_nav.waste_log')}
                </NavLink>
                <NavLink to="/goals" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
                    <Icon name="goal" /> {t('dashboard_nav.goals')}
                </NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
                    <Icon name="leaderboard" /> {t('dashboard_nav.leaderboard')}
                </NavLink>
                <NavLink to="/challenges" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
                    <Icon name="challenges" /> {t('dashboard_nav.challenges')}
                </NavLink>
                <NavLink to="/events" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
                    <Icon name="events" /> {t('dashboard_nav.events')}
                </NavLink>
                <button onClick={handleLogout} className="nav-action-item">
                    <Icon name="logout" /> {t('dashboard_nav.logout')}
                </button>
            </nav>
        </header>
    );
};

export default Navbar;