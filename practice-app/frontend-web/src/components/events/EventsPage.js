import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import './EventsPage.css'; // Assuming this CSS file contains the necessary styles

// 1. Import the new API function
import { getEvents } from '../../services/api'; 

// --- Component Definitions ---

// Reusable Icon component
const Icon = ({ name, className = '' }) => {
  const icons = {
    events: '📅', like: '❤️', location: '📍', date: '🗓️', alerts: '⚠️', user: '👤'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

// 2. Remove the local EVENTS_API_URL constant

const EventsPage = () => {
  const { t, i18n } = useTranslation();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch events from the API
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      // 3. Use the centralized getEvents function
      // getEvents handles the URL, authentication, and returns the results array directly.
      const data = await getEvents();
      
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      // 4. Update error handling for Axios responses
      // Axios errors often contain response details in err.response
      const errorMessage = err.response?.data?.detail || err.message;
      setError(t('eventsPage.error') + `: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [t]); // Add 't' as a dependency in case the language changes

  // NOTE: These handlers are placeholder stubs as they require separate POST/PATCH API calls
  const handleParticipate = (eventId) => {
    // Placeholder for API call to toggle participation
    // IMPORTANT: Do not use alert() in production code. Use a custom modal instead.
    console.log(`Attempting to toggle participation for event ${eventId}`);
    // eslint-disable-next-line no-alert
    alert(t('eventsPage.participationFeaturePending'));
  };

  const handleLike = (eventId) => {
    // Placeholder for API call to toggle like
    // IMPORTANT: Do not use alert() in production code. Use a custom modal instead.
    console.log(`Attempting to like event ${eventId}`);
    // eslint-disable-next-line no-alert
    alert(t('eventsPage.likeFeaturePending'));
  };

  return (
    <div className="events-page-scoped events-page-layout">
      <Navbar isAuthenticated={true} />

      <main className="events-main-content">
        <div className="events-header-section">
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
            <Icon name="alerts" /> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="events-grid">
            {events.map(event => (
              // Using the API data properties: title, description, location, date, image, i_am_participating, participants_count, likes_count
              <div key={event.id} className="event-card">
                {/* Use 'event.image' property (can be null) */}
                <img 
                  src={event.image || 'https://placehold.co/600x400/CCCCCC/000000?text=No+Image'} 
                  alt={event.title} 
                  className="event-card-image" 
                />
                <div className="event-card-content">
                  <h2>{event.title}</h2>
                  <div className="event-card-info">
                    <span>
                      <Icon name="date" /> 
                      {/* Format the ISO date string '2025-11-19T14:32:24.788000Z' */}
                      {new Date(event.date).toLocaleDateString(i18n.language, { 
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <span><Icon name="location" /> {event.location}</span>
                  </div>
                  <p className="event-card-description">{event.description}</p>
                  
                  <div className="event-card-creator">
                    <Icon name="user" /> {t('eventsPage.creator')}: <strong>{event.creator_username}</strong>
                  </div>
                  
                  <div className="event-card-actions">
                    <button
                      // Use 'event.i_am_participating'
                      className={`participate-btn ${event.i_am_participating ? 'participating' : ''}`}
                      onClick={() => handleParticipate(event.id)}
                    >
                      {/* Use t() for button text */}
                      {event.i_am_participating ? t('eventsPage.participating') : t('eventsPage.participate')}
                    </button>
                    <button className="like-btn" onClick={() => handleLike(event.id)}>
                      {/* Use 'event.likes_count' */}
                      <Icon name="like" /> {event.likes_count}
                    </button>
                    <span className="participants-count">
                      <Icon name="user" /> {event.participants_count} {t('eventsPage.participants')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {events.length === 0 && !loading && !error && (
          <p className="no-events-message">{t('eventsPage.noEvents')}</p>
        )}
      </main>
    </div>
  );
};

export default EventsPage;