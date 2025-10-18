import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import useTranslation
import Navbar from '../common/Navbar'; // Import the shared Navbar
import './EventsPage.css';

// --- Mock Data for Events ---
// This data is not translated, as it would come from an API
const mockEvents = [
  {
    id: 1,
    title: 'Community Tree Planting Day',
    description: 'Join us to plant native trees in Willow Creek Park. A great way to give back to nature and beautify our community.',
    location: 'Willow Creek Park',
    date: '2025-11-08',
    imageUrl: 'https://placehold.co/600x400/2ECC71/FFFFFF?text=Tree+Planting',
    likes: 128,
    participating: false,
  },
  {
    id: 2,
    title: 'Zero-Waste Workshop: Kitchen Edition',
    description: 'Learn practical tips and tricks to reduce food and packaging waste in your kitchen. Includes a free starter kit!',
    location: 'Green Living Center',
    date: '2025-11-15',
    imageUrl: 'https://placehold.co/600x400/1ABC9C/FFFFFF?text=Workshop',
    likes: 94,
    participating: true,
  },
  {
    id: 3,
    title: 'Beach Cleanup Challenge',
    description: 'Help us clean up Sunrise Beach. Compete with teams to collect the most trash and win eco-friendly prizes.',
    location: 'Sunrise Beach',
    date: '2025-11-22',
    imageUrl: 'https://placehold.co/600x400/3498DB/FFFFFF?text=Beach+Cleanup',
    likes: 256,
    participating: false,
  },
    {
    id: 4,
    title: 'Sustainable Fashion Swap',
    description: 'Bring your gently used clothes and swap them for something new-to-you! A fun way to refresh your wardrobe without waste.',
    location: 'City Community Hall',
    date: '2025-12-06',
    imageUrl: 'https://placehold.co/600x400/9B59B6/FFFFFF?text=Fashion+Swap',
    likes: 152,
    participating: false,
  },
];

// Reusable Icon component, consistent with your other pages.
const Icon = ({ name, className = '' }) => {
  const icons = {
    events: '📅', like: '❤️', location: '📍', date: '🗓️', alerts: '⚠️'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const EventsPage = () => {
  // 2. Setup the translation hook
  const { t, i18n } = useTranslation(); 
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate fetching data from an API
    setLoading(true);
    setError('');
    setTimeout(() => {
      try {
        setEvents(mockEvents);
      } catch (err) {
        // Use the translation key for the error
        setError(t('eventsPage.error'));
      } finally {
        setLoading(false);
      }
    }, 1000); // 1-second delay to show loader
  }, [t]); // Add 't' as a dependency in case the language changes

  const handleParticipate = (eventId) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, participating: !event.participating } : event
    ));
  };

  const handleLike = (eventId) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, likes: event.likes + 1 } : event
    ));
  };

  return (
    <div className="events-page-layout">
      <Navbar isAuthenticated={true} />

      <main className="events-main-content">
        <div className="events-header-section">
          {/* 3. Use t() for all static text */}
          <h1><Icon name="events" /> {t('eventsPage.title')}</h1>
          <p>{t('eventsPage.subtitle')}</p>
        </div>

        {loading && (
          <div className="loader-container-main">
            <div className="loader-spinner-main" />
            <p>{t('eventsPage.loading')}</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="error-message-box-main">
            <Icon name="alerts" /> {error} {/* Error message is now set from state */}
          </div>
        )}

        {!loading && !error && (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <img src={event.imageUrl} alt={event.title} className="event-card-image" />
                <div className="event-card-content">
                  {/* API content remains untranslated */}
                  <h2>{event.title}</h2>
                  <div className="event-card-info">
                    <span>
                      <Icon name="date" /> 
                      {/* 3. Use i18n.language for dynamic date formatting */}
                      {new Date(event.date).toLocaleDateString(i18n.language, { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </span>
                    <span><Icon name="location" /> {event.location}</span>
                  </div>
                  <p className="event-card-description">{event.description}</p>
                  <div className="event-card-actions">
                    <button
                      className={`participate-btn ${event.participating ? 'participating' : ''}`}
                      onClick={() => handleParticipate(event.id)}
                    >
                      {/* 3. Use t() for button text */}
                      {event.participating ? t('eventsPage.participating') : t('eventsPage.participate')}
                    </button>
                    <button className="like-btn" onClick={() => handleLike(event.id)}>
                      <Icon name="like" /> {event.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventsPage;