import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useTranslation } from 'react-i18next';

// 1. Import your reusable Header component
import Header from '../common/Header';
import InfoBox from './InfoBox';

// Icon component (can be moved to its own file later)
const Icon = ({ name, className = "" }) => {
    const icons = {
        leaf: '🌿',
        arrowLeft: '←',
        arrowRight: '→',
        quote: '❝',
        logWaste: '/icons/waste.png',
        joinChallenges: '/icons/challenge.png',
        earnRewards: '/icons/reward.png',
    };
    if (name === 'logWaste' || name === 'joinChallenges' || name === 'earnRewards') {
        return <img src={icons[name]} alt={name} className={`feature-icon ${className}`} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += `<span class="icon-fallback">${name.replace(/([A-Z])/g, ' $1').trim()}</span>`; }} />;
    }
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const Home = () => {
    const { t } = useTranslation();

    const ecoTips = t('home.eco_tips', { returnObjects: true });
    const badges = t('home.badges', { returnObjects: true });
    const testimonials = t('home.testimonials.quotes', { returnObjects: true });

    const [currentTip, setCurrentTip] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % ecoTips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ecoTips.length]);

    const handlePrevTip = () => {
        setCurrentTip((prev) => (prev - 1 + ecoTips.length) % ecoTips.length);
    };

    const handleNextTip = () => {
        setCurrentTip((prev) => (prev + 1) % ecoTips.length);
    };

    return (
        <div>
            {/* 2. Render the Header component */}
            <Header />

            {/* The rest of your page content remains unchanged */}
            <div className="home-container">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>{t('home.hero.title')}</h1>
                        <p>{t('home.hero.subtitle')}</p>
                        <div className="hero-buttons">
                            <Link to="/signup">
                                <button className="cta-button primary">{t('home.hero.journey_button')}</button>
                            </Link>
                            <Link to="/login">
                                <button className="cta-button secondary">{t('common.nav.login')}</button>
                            </Link>
                        </div>
                    </div>
                </section>
                
                <section className="mission-section">
                    <h2>{t('home.mission.title')}</h2>
                    <p>{t('home.mission.subtitle')}</p>
                    <div className="mission-features">
                        <div className="feature">
                            <Icon name="logWaste" />
                            <h3>{t('home.mission.features.log.title')}</h3>
                            <p>{t('home.mission.features.log.description')}</p>
                        </div>
                        <div className="feature">
                            <Icon name="joinChallenges" />
                            <h3>{t('home.mission.features.join.title')}</h3>
                            <p>{t('home.mission.features.join.description')}</p>
                        </div>
                        <div className="feature">
                            <Icon name="earnRewards" />
                            <h3>{t('home.mission.features.earn.title')}</h3>
                            <p>{t('home.mission.features.earn.description')}</p>
                        </div>
                    </div>
                </section>

                <section className="tips-section">
                    <h2>{t('home.tips.title')}</h2>
                    <div className="tips-carousel">
                        <button className="carousel-arrow left" onClick={handlePrevTip}><Icon name="arrowLeft" /></button>
                        <div className="tip-card">
                            <p>{ecoTips[currentTip]?.text}</p>
                            <span className="tip-category">
                                {ecoTips[currentTip]?.related_category
                                    ? `${t('home.tips.category_prefix')}: ${ecoTips[currentTip].related_category}`
                                    : `${t('home.tips.topic_prefix')}: ${ecoTips[currentTip].topic}`}
                            </span>
                        </div>
                        <button className="carousel-arrow right" onClick={handleNextTip}><Icon name="arrowRight" /></button>
                    </div>
                </section>

                <section className="rewards-section">
                    <h2>{t('home.rewards.title')}</h2>
                    <p>{t('home.rewards.subtitle')}</p>
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
                    <h2>{t('home.testimonials.title')}</h2>
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
            </div>

            {/* The Footer JSX remains here */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo"><Icon name="leaf" /> Greener</div>
                    <ul className="footer-links">
                        <li><Link to="/">{t('common.nav.home')}</Link></li>
                        <li><Link to="/about">{t('common.nav.about')}</Link></li>
                        <li><Link to="/blog">{t('common.nav.blog')}</Link></li>
                    </ul>
                    <p>© {new Date().getFullYear()} Greener. {t('common.footer.rights')}</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;