import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Using NavLink for active class
import { useTranslation } from 'react-i18next';
import './AboutUsPage.css'; // Your specific CSS for this page
import Header from '../common/Header';

// Team members - student names
const teamMembersData = [
    { name: 'Ahmet Okta', avatarSeed: 'ahmet' },
    { name: 'Barathan Aslan', avatarSeed: 'barathan' },
    { name: 'Berke Kartal', avatarSeed: 'berke' },
    { name: 'Mehmet Çağlar Kurt', avatarSeed: 'caglar' },
    { name: 'Mehmet Emin Atak', avatarSeed: 'emin' },
    { name: 'Mustafa Taha Söylemez', avatarSeed: 'taha' },
    { name: 'Muhammet Berkay Keskin', avatarSeed: 'berkay' },
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
    const color = `hsl(${hash % 360}, 75%, 60%)`;
    return (
        <div className="team-avatar-simple" style={{ backgroundColor: color }}>
            {initial}
        </div>
    );
};

const AboutUsPage = () => {
    const { t } = useTranslation();
    const coreValues = t('about.values.list', { returnObjects: true });

    return (
        // *** THE FIX IS HERE ***
        // Add the 'about-us-page' class to the main wrapper
        <div className="about-us-page page-wrapper about-us-page-wrapper">
            <Header />

            <div className="content-container">
                <header className="page-header">
                    <h1>{t('about.header.title')}</h1>
                    <p>{t('about.header.subtitle')}</p>
                </header>

                <section className="about-content-section">
                    <h2>{t('about.vision.title')}</h2>
                    <p>{t('about.vision.text')}</p>
                </section>

                <section className="about-content-section">
                    <h2>{t('about.who_we_are.title')}</h2>
                    <p>{t('about.who_we_are.text')}</p>
                </section>

                <section className="about-content-section">
                    <h2>{t('about.values.title')}</h2>
                    <ul className="values-list">
                        {coreValues.map((value) => (
                            <li key={value.name}>
                                <strong><span className="value-icon">{value.icon}</span> {value.name}</strong> {value.description}
                            </li>
                        ))}
                    </ul>
                </section>

                 <section className="about-content-section team-section-simple">
                    <h2>{t('about.team.title')}</h2>
                    <p className="team-intro">{t('about.team.subtitle')}</p>
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

            <footer className="simple-footer">
                <p>{t('about.simple_footer', { year: new Date().getFullYear() })}</p>
            </footer>
        </div>
    );
};

export default AboutUsPage;