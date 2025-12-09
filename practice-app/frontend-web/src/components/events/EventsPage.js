import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Ensure useNavigate is imported cleanly from react-router-dom
import { useNavigate, NavLink } from 'react-router-dom'; 
import Navbar from '../common/Navbar';
import './EventsPage.css'; // Assuming this CSS file contains the necessary styles

// 1. Import all necessary API functions for display and actions (excluding createEvent)
import { getEvents, toggleParticipation, toggleLike } from '../../services/api'; 

// --- Component Definitions ---

// Reusable Icon component - ADDED 'plus' ICON
const Icon = ({ name, className = '' }) => {
  const icons = {
    events: '📅', like: '❤️', location: '📍', date: '🗓️', alerts: '⚠️', user: '👤', plus: '➕'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const EventsPage = () => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // Hook call is correct
    const token = localStorage.getItem('access_token');

    useEffect(() => {
    if (!token) {
        navigate('/login');
        return;
        }
    // eslint-disable-next-line
  }, [token]);
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // 2. Add state for user feedback messages
  const [message, setMessage] = useState(null); 
  
  // Helper function for user feedback (Not a hook)
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
  };

  // Function to fetch events (Not a hook)
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      // 3. Use the centralized getEvents function
      const data = await getEvents();
      
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      // Axios errors often contain response details in err.response
      const errorMessage = err.response?.data?.detail || err.message;
      setError(t('eventsPage.error') + `: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // useEffect hook is called unconditionally
  useEffect(() => {
    fetchEvents();
  }, [t]); // Add 't' as a dependency in case the language changes

  // 4. Refactor handleParticipate to use toggleParticipation API
  const handleParticipate = async (eventId) => {
    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;
    
    try {
      // Call the centralized API function
      await toggleParticipation(eventId);
      
      // Update local state based on the assumption the action was successful
      setEvents(prevEvents => prevEvents.map(event => {
        if (event.id === eventId) {
          const isParticipating = !event.i_am_participating;
          
          // Use hardcoded text if translation keys are missing, but rely on t()
          const successKey = isParticipating ? 'eventsPage.participateSuccess' : 'eventsPage.unparticipateSuccess';
          showMessage(t(successKey) || (isParticipating ? 'You are now participating!' : 'You are no longer participating.'), 'success');

          return { 
            ...event, 
            i_am_participating: isParticipating,
            // Update the count locally
            participants_count: event.participants_count + (isParticipating ? 1 : -1)
          };
        }
        return event;
      }));

    } catch (err) {
      console.error('Failed to toggle participation:', err);
      const errorMessage = err.response?.data?.detail || err.message;
      const errorKey = 'eventsPage.participateError';
      showMessage(t(errorKey) + `: ${errorMessage}`, 'error');
    }
  };

  // 5. Refactor handleLike to use toggleLike API
  const handleLike = async (eventId) => {
    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;

    try {
      // Call the centralized API function
      await toggleLike(eventId);

      setEvents(prevEvents => prevEvents.map(event => {
        if (event.id === eventId) {
          const isLiked = !event.i_liked;
          
          // Use hardcoded text if translation keys are missing, but rely on t()
          const successKey = isLiked ? 'eventsPage.likeSuccess' : 'eventsPage.unlikeSuccess';
          showMessage(t(successKey) || (isLiked ? 'Event liked!' : 'Event unliked.'), 'success');

          return { 
            ...event, 
            i_liked: isLiked,
            // Update the count locally
            likes_count: event.likes_count + (isLiked ? 1 : -1)
          };
        }
        return event;
      }));
      
    } catch (err) {
      console.error('Failed to toggle like:', err);
      const errorMessage = err.response?.data?.detail || err.message;
      const errorKey = 'eventsPage.likeError';
      showMessage(t(errorKey) + `: ${errorMessage}`, 'error');
    }
  };

  return (
    <div className="events-page-scoped events-page-layout">
      <Navbar isAuthenticated={true} />

      <main className="events-main-content">
        <div className="events-header-section">
          <h1><Icon name="events" /> {t('eventsPage.title')}</h1>
          <p>{t('eventsPage.subtitle')}</p>

          {/* UPDATED: Use NavLink for declarative navigation */}
          <NavLink 
            to="/events/create"
            // NavLink uses the 'className' prop for styling, treating it like the 'add-event-btn'
            className="add-event-btn"
          >
            <Icon name="plus" className="mr-2" />
            {t('eventsPage.buttonAdd') || 'Add New Event'}
          </NavLink>
        </div>

        {/* 6. Display feedback message */}
        {message && (
          <div className={`p-4 mb-4 rounded-lg shadow-md text-center ${message.type === 'success' ? 'success-message-box' : 'error-message-box'}`}>
            {message.text}
          </div>
        )}
        {/* End feedback message */}

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
                {/* Use 'event.image_url' property (can be null) */}
                <img 
                  src={event.image_url || 'https://placehold.co/600x400/CCCCCC/000000?text=No+Image'} 
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
                      // 7. Attach refactored handler
                      onClick={() => handleParticipate(event.id)}
                    >
                      {/* Use t() for button text */}
                      {event.i_am_participating ? t('eventsPage.participating') : t('eventsPage.participate')}
                    </button>
                    <button 
                      // Add 'liked' class for visual feedback if the user liked it
                      className={`like-btn ${event.i_liked ? 'liked' : ''}`} 
                      // 8. Attach refactored handler
                      onClick={() => handleLike(event.id)}
                    >
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