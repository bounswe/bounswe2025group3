import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Navbar from '../common/Navbar'; // Removed this
import './Home.css';

// Mock eco-tips since /api/v1/waste/suggestions/ requires authentication
const mockEcoTips = [
    { id: 1, text: 'Switch to reusable bags to cut plastic waste.', related_category: 'Plastic', topic: 'Waste Reduction' },
    { id: 2, text: 'Compost food scraps to enrich your garden soil.', related_category: 'Organic', topic: 'Waste Reduction' },
    { id: 3, text: 'Recycle old electronics at certified centers.', related_category: 'Electronic', topic: 'Waste Reduction' },
    { id: 4, text: 'Fix leaks to conserve water at home.', related_category: null, topic: 'Water Conservation' },
];

// Mock badges
const mockBadges = [
    { name: 'First Step', description: 'Log your first waste reduction', icon: '/icons/first-step.png' },
    { name: 'Plastic Buster', description: 'Reduce 10 kg of plastic waste', icon: '/icons/plastic-buster.png' },
    { name: 'Sustainability Streak', description: 'Log waste reduction for 7 days', icon: '/icons/streak.png' },
];

const Home = () => {
    const [currentTip, setCurrentTip] = useState(0);

    // Carousel auto-scroll for eco-tips
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % mockEcoTips.length);
        }, 5000); // Change tip every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handlePrevTip = () => {
        setCurrentTip((prev) => (prev - 1 + mockEcoTips.length) % mockEcoTips.length);
    };

    const handleNextTip = () => {
        setCurrentTip((prev) => (prev + 1) % mockEcoTips.length);
    };

    return (
        <div className="home-container">
            {/* === New Navigation Bar START === */}
            <div className="nav-container">
                <nav className="navbar">
                    <ul className="main-nav">
                        <li className="nav-item active"> {/* Home is active */}
                            <Link to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about">About us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/login">Login</Link>
                        </li>
                        <li className="nav-item">
                        <Link to="/signup">Sign Up</Link>
            </li>
                    </ul>
                </nav>
            </div>
            {/* === New Navigation Bar END === */}

            {/* Removed: <Navbar isAuthenticated={false} /> */}

            {/* Hero Section */}
            <section className="hero-section">
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
                <h2>Why Zero Waste Challenge?</h2>
                <p>Empower yourself to reduce waste, set goals, and join a global movement for sustainability.</p>
                <div className="mission-features">
                    <div className="feature">
                        <img src="/icons/waste.png" alt="Waste Tracking" className="feature-icon" />
                        <h3>Log Waste</h3>
                        <p>Track your waste reduction with detailed logs by category and quantity.</p>
                    </div>
                    <div className="feature">
                        <img src="/icons/challenge.png" alt="Challenges" className="feature-icon" />
                        <h3>Join Challenges</h3>
                        <p>Participate in fun community challenges to reduce waste together.</p>
                    </div>
                    <div className="feature">
                        <img src="/icons/reward.png" alt="Rewards" className="feature-icon" />
                        <h3>Earn Rewards</h3>
                        <p>Unlock badges and virtual eco-world achievements for your efforts.</p>
                    </div>
                </div>
            </section>

            {/* Eco-Tips Carousel */}
            <section className="tips-section">
                <h2>Sustainability Tips</h2>
                <div className="tips-carousel">
                    <button className="carousel-arrow left" onClick={handlePrevTip}>←</button>
                    <div className="tip-card">
                        <p>{mockEcoTips[currentTip].text}</p>
                        <span className="tip-category">
                            {mockEcoTips[currentTip].related_category
                                ? `Category: ${mockEcoTips[currentTip].related_category}`
                                : `Topic: ${mockEcoTips[currentTip].topic}`}
                        </span>
                    </div>
                    <button className="carousel-arrow right" onClick={handleNextTip}>→</button>
                </div>
            </section>

            {/* Rewards Showcase */}
            <section className="rewards-section">
                <h2>Unlock Amazing Rewards</h2>
                <p>Earn badges and build your virtual eco-world as you reduce waste!</p>
                <div className="rewards-grid">
                    {mockBadges.map((badge) => (
                        <div key={badge.name} className="reward-card">
                            <img src={badge.icon} alt={badge.name} className="reward-icon" />
                            <h3>{badge.name}</h3>
                            <p>{badge.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <h2>Our Community</h2>
                <div className="testimonials">
                    <div className="testimonial">
                        <p>"Logging my waste helped me reduce plastic by 10 kg and earn my Plastic Buster badge!"</p>
                        <span>- Emma, Eco Explorer</span>
                    </div>
                    <div className="testimonial">
                        <p>"The challenges are so motivating! I love competing with my friends."</p>
                        <span>- Liam, Green Starter</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">Greener</div>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li> {/* Updated to / */}
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                        {/* You might want to add Login here too for consistency */}
                    </ul>
                    <p>© 2025 Greener. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;