import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar'; // Import the shared Navbar
import './EventsPage.css';

// --- Mock Data for Events ---
// In a real application, you would fetch this from your API services.
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Stores a regular string now

  useEffect(() => {
    // Simulate fetching data from an API
    setLoading(true);
    setError('');
    setTimeout(() => {
      try {
        // In a real app, you would call a service like `getEvents()`
        setEvents(mockEvents);
      } catch (err) {
        setError('Failed to load events. Please try again later.'); // Set a direct error string
      } finally {
        setLoading(false);
      }
    }, 1000); // 1-second delay to show loader
  }, []);

  const handleParticipate = (eventId) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, participating: !event.participating } : event
    ));
    // In a real app, you would also call an API service to update participation status
  };

  const handleLike = (eventId) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, likes: event.likes + 1 } : event
    ));
    // In a real app, you would also call an API service to update the like count
  };

  return (
    <div className="events-page-layout">
      {/* Use the shared Navbar component */}
      <Navbar isAuthenticated={true} />

      <main className="events-main-content">
        <div className="events-header-section">
          <h1><Icon name="events" /> Upcoming Events</h1>
          <p>Get involved, meet like-minded people, and make a difference.</p>
        </div>

        {loading && (
          <div className="loader-container-main">
            <div className="loader-spinner-main" />
            <p>Loading Events…</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="error-message-box-main">
            <Icon name="alerts" /> {error} {/* Display the error string directly */}
          </div>
        )}

        {!loading && !error && (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <img src={event.imageUrl} alt={event.title} className="event-card-image" />
                <div className="event-card-content">
                  {/* Event titles and descriptions from API don't need translation */}
                  <h2>{event.title}</h2>
                  <div className="event-card-info">
                    <span><Icon name="date" /> {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span><Icon name="location" /> {event.location}</span>
                  </div>
                  <p className="event-card-description">{event.description}</p>
                  <div className="event-card-actions">
                    <button
                      className={`participate-btn ${event.participating ? 'participating' : ''}`}
                      onClick={() => handleParticipate(event.id)}
                    >
                      {event.participating ? 'You are going!' : 'Participate'}
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