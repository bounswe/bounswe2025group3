import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Using NavLink for active class
import './AboutUsPage.css'; // New CSS file

// Team members - student names
const teamMembersData = [
    { name: 'Ahmet Okta', avatarSeed: 'ahmet' },
    { name: 'Baran Korkmaz', avatarSeed: 'baran' },
    { name: 'Barathan Aslan', avatarSeed: 'barathan' },
    { name: 'Berke Kartal', avatarSeed: 'berke' },
    { name: 'Ege Uslu', avatarSeed: 'ege' },
    { name: 'Mehmet Çağlar Kurt', avatarSeed: 'caglar' },
    { name: 'Mehmet Emin Atak', avatarSeed: 'emin' },
    { name: 'Mustafa Taha Söylemez', avatarSeed: 'taha' },
    { name: 'Nilsu Tüysüz', avatarSeed: 'nilsu' },
    { name: 'Ömer Faruk Bayram', avatarSeed: 'omer' },
    { name: 'Selman Akman', avatarSeed: 'selman' },
];

// Simple avatar placeholder
const AvatarPlaceholder = ({ name, seed }) => {
    const initial = name ? name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : '?';
    let hash = 0;
    for (let i = 0; i < (seed?.length || 0); i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Consistent color generation with a fixed saturation and lightness for this style
    const color = `hsl(${hash % 360}, 75%, 60%)`; // Brighter avatar color
    return (
        <div className="team-avatar-simple" style={{ backgroundColor: color }}>
            {initial}
        </div>
    );
};

const AboutUsPage = () => {
    return (
        <div className="page-wrapper about-us-page-wrapper"> {/* Added specific class for potential overrides */}
            {/* --- Navigation Bar (from original login.js style) --- */}
            <div className="nav-container">
                <nav className="navbar">
                    <ul className="main-nav">
                        <li className="nav-item">
                            <NavLink to="/" className={({isActive}) => isActive ? "active-link-class" : ""}>Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/about" className={({isActive}) => isActive ? "active-link-class" : ""}>About us</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/blog" className={({isActive}) => isActive ? "active-link-class" : ""}>Blog</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/pricing" className={({isActive}) => isActive ? "active-link-class" : ""}>Pricing</NavLink>
                        </li>
                         <li className="nav-item">
                            <NavLink to="/login" className={({isActive}) => isActive ? "active-link-class" : ""}>Login</NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            
            <div className="content-container">
                <header className="page-header">
                    <h1>Our Story & Mission</h1>
                    <p>We are a group of students passionate about creating a sustainable future through technology.</p>
                </header>

                <section className="about-content-section">
                    <h2>Our Vision for GreenerLife</h2>
                    <p>
                        We envision a world where conscious consumption and effective waste management are second nature. "GreenerLife" is our student-driven initiative to build a platform that empowers individuals and communities to minimize waste, conserve resources, and actively participate in building a circular economy. We believe that with the right tools and insights, everyone can make a significant positive impact.
                    </p>
                </section>

                <section className="about-content-section">
                    <h2>Who We Are</h2>
                    <p>
                        We are a team of university students from various disciplines, united by our shared commitment to environmental sustainability and our enthusiasm for technology. This project began as a way to apply our learning to a real-world problem we care deeply about. As we develop GreenerLife, we aim to provide intuitive, impactful solutions for tracking waste and encouraging recycling.
                    </p>
                </section>

                <section className="about-content-section">
                    <h2>Our Core Values</h2>
                    <ul className="values-list">
                        <li>
                            <strong><span className="value-icon">🌿</span> Sustainability:</strong> Promoting eco-friendly practices in all aspects of our platform and encouraging users to do the same.
                        </li>
                        <li>
                            <strong><span className="value-icon">💡</span> Innovation:</strong> Continuously exploring new technologies and approaches to make waste management simpler and more effective.
                        </li>
                        <li>
                            <strong><span className="value-icon">🤝</span> Community:</strong> Fostering a supportive network where users can share ideas, motivate each other, and collectively work towards a greener planet.
                        </li>
                        <li>
                            <strong><span className="value-icon">🎓</span> Learning & Growth:</strong> As students, this project is a journey of learning. We are committed to growing our skills and knowledge to improve GreenerLife.
                        </li>
                    </ul>
                </section>

                 <section className="about-content-section team-section-simple">
                    <h2>Meet the Student Team</h2>
                    <p className="team-intro">The GreenerLife project is brought to you by a dedicated group of students:</p>
                    <div className="team-members-list-simple">
                        {teamMembersData.map((member) => (
                            <div key={member.name} className="team-member-item-simple">
                                <AvatarPlaceholder name={member.name} seed={member.avatarSeed} />
                                <span className="team-member-name-simple">{member.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Optional Simple Footer */}
            <footer className="simple-footer">
                <p>© {new Date().getFullYear()} GreenerLife Student Project.</p>
            </footer>
        </div>
    );
};

export default AboutUsPage;