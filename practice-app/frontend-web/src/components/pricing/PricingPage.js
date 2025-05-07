import React from 'react';
import { Link } from 'react-router-dom';
import './PricingPage.css';

const PricingPage = () => {
    return (
        <div className="page-wrapper">
            <div className="nav-container">
                <nav className="navbar">
                    <ul className="main-nav">
                        <li className="nav-item">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about">About us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li className="nav-item active"> {/* Current page is active */}
                            <Link to="/pricing">Pricing</Link>
                        </li>
                         <li className="nav-item">
                            <Link to="/login">Login</Link>
                        </li>
                    </ul>
                </nav>
            </div>
            
            <div className="content-container">
                <header className="page-header">
                    <h1>Our Pricing Plans</h1>
                    <p>Choose a plan that's right for your waste management needs.</p>
                </header>

                <div className="pricing-plans">
                    <div className="plan-card">
                        <h2>Basic</h2>
                        <p className="price">$10<span>/month</span></p>
                        <ul>
                            <li>Log up to 50 waste items</li>
                            <li>Basic reporting</li>
                            <li>Email support</li>
                            <li>Community access</li>
                        </ul>
                        <button className="plan-button">Choose Plan</button>
                    </div>

                    <div className="plan-card featured">
                        <h2>Pro</h2>
                        <p className="price">$25<span>/month</span></p>
                        <span className="featured-badge">Most Popular</span>
                        <ul>
                            <li>Log unlimited waste items</li>
                            <li>Advanced reporting & analytics</li>
                            <li>Priority email support</li>
                            <li>API Access</li>
                            <li>Monthly insights</li>
                        </ul>
                        <button className="plan-button">Choose Plan</button>
                    </div>

                    <div className="plan-card">
                        <h2>Enterprise</h2>
                        <p className="price">Contact Us</p>
                        <ul>
                            <li>Custom solutions</li>
                            <li>Dedicated account manager</li>
                            <li>On-site training (optional)</li>
                            <li>Custom integrations</li>
                            <li>24/7 Premium Support</li>
                        </ul>
                        <button className="plan-button">Contact Sales</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;