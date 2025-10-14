import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Home.css';
import InfoBox from './InfoBox';
import { useTranslation } from 'react-i18next';

// Icon component remains the same
const Icon = ({ name, className = "" }) => {
    // ... same as before
};

const Home = () => {
    const { t, i18n } = useTranslation();

    // GET DYNAMIC DATA FROM TRANSLATION FILES
    const ecoTips = t('eco_tips', { returnObjects: true });
    const badges = t('badges', { returnObjects: true });
    const testimonials = t('testimonials.quotes', { returnObjects: true });

    const [currentTip, setCurrentTip] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % ecoTips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ecoTips.length]); // Add dependency to avoid issues on language change

    const handlePrevTip = () => {
        setCurrentTip((prev) => (prev - 1 + ecoTips.length) % ecoTips.length);
    };

    const handleNextTip = () => {
        setCurrentTip((prev) => (prev + 1) % ecoTips.length);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'tr' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="home-container">
            <div className="nav-container">
                <nav className="navbar">
                    <Link to="/" className="navbar-brand">
                        <img src="/icon.png" alt="Greener Logo" className="navbar-logo-image" />
                        <span className="navbar-app-name">GREENER</span>
                    </Link>
                    <ul className="main-nav">
                        <li className="nav-item">
                            <NavLink to="/" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('nav.home')}</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/about" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('nav.about')}</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/blog" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('nav.blog')}</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/login" className={({isActive}) => isActive ? "active-link-class" : ""}>{t('nav.login')}</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/signup" className="nav-button-style signup-button-style">{t('nav.signup')}</NavLink>
                        </li>
                        <li className="nav-item">
                           <button onClick={toggleLanguage} className="language-toggle-button">
                                {i18n.language === 'en' ? 'TR' : 'EN'}
                           </button>
                        </li>
                    </ul>
                </nav>
            </div>

            <section className="hero-section">
                <div className="hero-content">
                    <h1>{t('hero.title')}</h1>
                    <p>{t('hero.subtitle')}</p>
                    <div className="hero-buttons">
                        <Link to="/signup">
                            <button className="cta-button primary">{t('hero.journey_button')}</button>
                        </Link>
                        <Link to="/login">
                            <button className="cta-button secondary">{t('hero.login_button')}</button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mission-section">
                <h2>{t('mission.title')}</h2>
                <p>{t('mission.subtitle')}</p>
                <div className="mission-features">
                    <div className="feature">
                        <Icon name="logWaste" />
                        <h3>{t('mission.features.log.title')}</h3>
                        <p>{t('mission.features.log.description')}</p>
                    </div>
                    <div className="feature">
                        <Icon name="joinChallenges" />
                        <h3>{t('mission.features.join.title')}</h3>
                        <p>{t('mission.features.join.description')}</p>
                    </div>
                    <div className="feature">
                        <Icon name="earnRewards" />
                        <h3>{t('mission.features.earn.title')}</h3>
                        <p>{t('mission.features.earn.description')}</p>
                    </div>
                </div>
            </section>

            <section className="tips-section">
                <h2>{t('tips.title')}</h2>
                <div className="tips-carousel">
                    <button className="carousel-arrow left" onClick={handlePrevTip}><Icon name="arrowLeft" /></button>
                    <div className="tip-card">
                        <p>{ecoTips[currentTip]?.text}</p>
                        <span className="tip-category">
                            {ecoTips[currentTip]?.related_category
                                ? `${t('tips.category_prefix')}: ${ecoTips[currentTip].related_category}`
                                : `${t('tips.topic_prefix')}: ${ecoTips[currentTip].topic}`}
                        </span>
                    </div>
                    <button className="carousel-arrow right" onClick={handleNextTip}><Icon name="arrowRight" /></button>
                </div>
            </section>

            <section className="rewards-section">
                <h2>{t('rewards.title')}</h2>
                <p>{t('rewards.subtitle')}</p>
                <div className="rewards-grid">
                    {badges.map((badge) => (
                        <div key={badge.name} className="reward-card">
                            <img src={badge.icon} alt={badge.name} className="reward-icon" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += `<span class="icon-fallback-badge">${badge.name.charAt(0)}</span>`; }}/>
                            <h3>{badge.name}</h3>
                            <p>{badge.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="testimonials-section">
                <h2>{t('testimonials.title')}</h2>
                <div className="testimonials">
                    {testimonials.map((testimonial, index) => (
                        <div className="testimonial" key={index}>
                            <p><Icon name="quote" /> {testimonial.text}</p>
                            <span>{testimonial.author}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="info-box-section">
                <InfoBox />
            </section>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo"><Icon name="leaf" /> Greener</div>
                    <ul className="footer-links">
                        <li><Link to="/">{t('nav.home')}</Link></li>
                        <li><Link to="/about">{t('nav.about')}</Link></li>
                        <li><Link to="/blog">{t('nav.blog')}</Link></li>
                    </ul>
                    <p>© {new Date().getFullYear()} Greener. {t('footer.rights')}</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;