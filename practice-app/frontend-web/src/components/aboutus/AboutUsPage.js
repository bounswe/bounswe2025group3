import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUsPage.css';

const AboutUsPage = () => {
    return (
        <div className="page-wrapper">
            <div className="nav-container">
                <nav className="navbar">
                    <ul className="main-nav">
                        <li className="nav-item">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="nav-item active"> {/* Current page is active */}
                            <Link to="/about">About us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li className="nav-item">
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
                    <h1>About Our Mission</h1>
                    <p>Dedicated to making waste management simpler and more effective for a sustainable future.</p>
                </header>

                <section className="about-section">
                    <h2>Our Vision</h2>
                    <p>
                        We envision a world where waste is minimized, resources are conserved, and every individual and organization
                        plays an active role in creating a circular economy. Our platform is designed to empower you with the tools
                        and insights needed to make responsible waste decisions.
                    </p>
                </section>

                <section className="about-section">
                    <h2>Who We Are</h2>
                    <p>
                        We are a passionate team of environmentalists, technologists, and innovators committed to leveraging
                        technology for environmental good. Founded on the principle that small changes can lead to significant
                        impact, we strive to provide intuitive and powerful solutions for waste tracking and recycling.
                    </p>
                </section>

                <section className="about-section">
                    <h2>Our Commitment</h2>
                    <p>
                        <strong>Sustainability:</strong> We are committed to promoting sustainable practices through our platform and operations.
                    </p>
                    <p>
                        <strong>Innovation:</strong> We continuously seek innovative ways to improve waste management processes and user experience.
                    </p>
                    <p>
                        <strong>Community:</strong> We believe in the power of community and aim to foster a network of environmentally conscious users.
                    </p>
                </section>

                 <section className="about-section team-section">
                    <h2>Meet The Team (Placeholder)</h2>
                    <div className="team-members">
                        <div className="team-member">
                            <img src="https://via.placeholder.com/150/008000/FFFFFF?text=Team+Member" alt="Team Member 1" />
                            <h3>Jane Doe</h3>
                            <p>CEO & Co-founder</p>
                        </div>
                        <div className="team-member">
                            <img src="https://via.placeholder.com/150/008000/FFFFFF?text=Team+Member" alt="Team Member 2" />
                            <h3>John Smith</h3>
                            <p>CTO & Co-founder</p>
                        </div>
                        <div className="team-member">
                            <img src="https://via.placeholder.com/150/008000/FFFFFF?text=Team+Member" alt="Team Member 3" />
                            <h3>Alice Green</h3>
                            <p>Head of Sustainability</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUsPage;