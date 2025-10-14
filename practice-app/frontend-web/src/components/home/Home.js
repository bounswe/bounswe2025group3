import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom'; // Using NavLink for active class
import './Home.css';
import InfoBox from './InfoBox';

// Mock eco-tips and badges (keeping these from your original code)
const mockEcoTips = [
    { id: 1, text: 'Switch to reusable bags to cut plastic waste.', related_category: 'Plastic', topic: 'Waste Reduction' },
    { id: 2, text: 'Compost food scraps to enrich your garden soil.', related_category: 'Organic', topic: 'Waste Reduction' },
    { id: 3, text: 'Recycle old electronics at certified centers.', related_category: 'Electronic', topic: 'Waste Reduction' },
    { id: 4, text: 'Fix leaks to conserve water at home.', related_category: null, topic: 'Water Conservation' },
];
const mockBadges = [
    { name: 'First Step', description: 'Log your first waste reduction', icon: '/icons/first-step.png' },
    { name: 'Plastic Buster', description: 'Reduce 10 kg of plastic waste', icon: '/icons/plastic-buster.png' },
    { name: 'Sustainability Streak', description: 'Log waste reduction for 7 days', icon: '/icons/streak.png' },
];
// Icon component (assuming you have this or similar)
const Icon = ({ name, className = "" }) => {
    const icons = {
        leaf: '🌿', // For footer logo
        arrowLeft: '←', // For carousel
        arrowRight: '→', // For carousel
        quote: '❝', // For testimonials
        // Example for feature icons if paths are an issue
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
    const [currentTip, setCurrentTip] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % mockEcoTips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handlePrevTip = () => {
        setCurrentTip((prev) => (prev - 1 + mockEcoTips.length) % mockEcoTips.length);
    };

    const handleNextTip = () => {
        setCurrentTip((prev) => (prev + 1) % mockEcoTips.length);
    };

    return (
        <div className="home-container"> {/* Renamed to home-page-wrapper in previous advanced example, but keeping home-container as per your CSS */}
            {/* === Updated Navigation Bar START === */}
            <div className="nav-container">
                <nav className="navbar"> {/* This will be display: flex */}
                    {/* Logo and App Name - Added Here */}
                    <Link to="/" className="navbar-brand">
                        <img src="/icon.png" alt="Greener Logo" className="navbar-logo-image" />
                        <span className="navbar-app-name">GREENER</span>
                    </Link>

                    <ul className="main-nav">
                        {/* Using NavLink for active class styling */}
                        <li className="nav-item">
                            <NavLink to="/" className={({isActive}) => isActive ? "active-link-class" : ""}>Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/about" className={({isActive}) => isActive ? "active-link-class" : ""}>About us</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/blog" className={({isActive}) => isActive ? "active-link-class" : ""}>Blog</NavLink>
                        </li>
                        {/* Adding Pricing back as it's a common public page */}
                        
                        <li className="nav-item">
                            <NavLink to="/login" className={({isActive}) => isActive ? "active-link-class" : ""}>Login</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/signup" className="nav-button-style signup-button-style">Sign Up</NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            {/* === Updated Navigation Bar END === */}

            {/* Hero Section */}
            <section className="hero-section">
                {/* ... (rest of your hero section JSX) ... */}
                <div className="hero-content">
                    <h1>Make Every Day a Zero Waste Day</h1>
                    <p>Join our community to track waste, earn rewards, and live sustainably!</p>
                    <div className="hero-buttons">
                        <Link to="/signup">
                            <button className="cta-button primary">Start Your Journey</button>
                        </Link>
                        <Link to="/login">
                            <button className="cta-button secondary">Log In</button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                 {/* ... (rest of your mission section JSX) ... */}
                <h2>Why Zero Waste Challenge?</h2>
                <p>Empower yourself to reduce waste, set goals, and join a global movement for sustainability.</p>
                <div className="mission-features">
                    <div className="feature">
                        <Icon name="logWaste" /> {/* Using Icon component */}
                        <h3>Log Waste</h3>
                        <p>Track your waste reduction with detailed logs by category and quantity.</p>
                    </div>
                    <div className="feature">
                        <Icon name="joinChallenges" /> {/* Using Icon component */}
                        <h3>Join Challenges</h3>
                        <p>Participate in fun community challenges to reduce waste together.</p>
                    </div>
                    <div className="feature">
                        <Icon name="earnRewards" /> {/* Using Icon component */}
                        <h3>Earn Rewards</h3>
                        <p>Unlock badges and virtual eco-world achievements for your efforts.</p>
                    </div>
                </div>
            </section>

            {/* Eco-Tips Carousel */}
            <section className="tips-section">
                 {/* ... (rest of your tips section JSX) ... */}
                <h2>Sustainability Tips</h2>
                <div className="tips-carousel">
                    <button className="carousel-arrow left" onClick={handlePrevTip}><Icon name="arrowLeft" /></button>
                    <div className="tip-card">
                        <p>{mockEcoTips[currentTip].text}</p>
                        <span className="tip-category">
                            {mockEcoTips[currentTip].related_category
                                ? `Category: ${mockEcoTips[currentTip].related_category}`
                                : `Topic: ${mockEcoTips[currentTip].topic}`}
                        </span>
                    </div>
                    <button className="carousel-arrow right" onClick={handleNextTip}><Icon name="arrowRight" /></button>
                </div>
            </section>

            {/* Rewards Showcase */}
            <section className="rewards-section">
                {/* ... (rest of your rewards section JSX) ... */}
                <h2>Unlock Amazing Rewards</h2>
                <p>Earn badges and build your virtual eco-world as you reduce waste!</p>
                <div className="rewards-grid">
                    {mockBadges.map((badge) => (
                        <div key={badge.name} className="reward-card">
                            <img src={badge.icon} alt={badge.name} className="reward-icon" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += `<span class="icon-fallback-badge">${badge.name.charAt(0)}</span>`; }}/>
                            <h3>{badge.name}</h3>
                            <p>{badge.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                {/* ... (rest of your testimonials section JSX) ... */}
                <h2>Our Community</h2>
                <div className="testimonials">
                    <div className="testimonial">
                        <p><Icon name="quote" /> "Logging my waste helped me reduce plastic by 10 kg and earn my Plastic Buster badge!"</p>
                        <span>- Emma, Eco Explorer</span>
                    </div>
                    <div className="testimonial">
                        <p><Icon name="quote" /> "The challenges are so motivating! I love competing with my friends."</p>
                        <span>- Liam, Green Starter</span>
                    </div>
                </div>
            </section>

            {/* ✅ New InfoBox Section */}
            <section className="info-box-section">
                <InfoBox />
            </section>

            {/* Footer */}
            <footer className="footer">
                {/* ... (rest of your footer JSX) ... */}
                <div className="footer-content">
                    <div className="footer-logo"><Icon name="leaf" /> Greener</div> {/* Using Icon component */}
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                    </ul>
                    <p>© {new Date().getFullYear()} Greener. All rights reserved.</p> {/* Dynamic year */}
                </div>
            </footer>
        </div>
    );
};

export default Home;