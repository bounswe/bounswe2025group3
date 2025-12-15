import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, NavLink } from 'react-router-dom'; 
import Navbar from '../common/Navbar';
import './EventsPage.css'; 
import { getEvents, toggleParticipation, toggleLike, deleteEvent } from '../../services/api'; 

const Icon = ({ name, className = '' }) => {
  const icons = {
    events: '📅', like: '❤️', location: '📍', date: '🗓️', alerts: '⚠️', user: '👤', plus: '➕',
    time: '⏱️', tool: '🔧', district: '🏙️', delete: '🗑️'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const EventsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); 
  const token = localStorage.getItem('access_token');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const currentUserId = Number(localStorage.getItem('user_id')); 

  useEffect(() => {
    if (!token) {
        navigate('/login');
        return;
    }
    
    // Theme detection - check for blue-high-contrast class on body
    const checkTheme = () => {
      const isDark = document.body.classList.contains('blue-high-contrast');
      setIsDarkTheme(isDark);
    };
    
    // Initial check
    checkTheme();
    
    // Listen for theme changes via MutationObserver on body
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Listen to custom themeChanged event
    const handleThemeChange = () => {
      checkTheme();
    };
    document.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('themeChanged', handleThemeChange);
    };
    // eslint-disable-next-line
  }, [token]);
  
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000); 
  };

  // SÜRE FORMATLAMA (DÜZELTİLMİŞ)
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    
    // Varsayılan değerler (sa, dk) eklendi
    if (h > 0 && m > 0) return `${h} ${t('eventsPage.unitHoursShort', 'sa')} ${m} ${t('eventsPage.unitMinutesShort', 'dk')}`;
    if (h > 0) return `${h} ${t('eventsPage.unitHours', 'Saat')}`;
    return `${m} ${t('eventsPage.unitMinutes', 'Dakika')}`;
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      const errorMessage = err.response?.data?.detail || err.message;
      setError(t('eventsPage.error') + `: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, [t]); 

  const handleParticipate = async (eventId) => {
    const originalEvents = [...events];
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    const event = events[eventIndex];
    const newStatus = !event.i_am_participating;
    const updatedEvents = [...events];
    updatedEvents[eventIndex] = { ...event, i_am_participating: newStatus, participants_count: event.participants_count + (newStatus ? 1 : -1) };
    setEvents(updatedEvents);
    try {
      await toggleParticipation(eventId);
      showMessage(newStatus ? t('eventsPage.participateSuccess') : t('eventsPage.unparticipateSuccess'), 'success');
    } catch (err) {
      setEvents(originalEvents);
      showMessage(t('eventsPage.participateError'), 'error');
    }
  };

  const handleLike = async (eventId) => {
    const originalEvents = [...events];
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    const event = events[eventIndex];
    const newStatus = !event.i_liked;
    const updatedEvents = [...events];
    updatedEvents[eventIndex] = { ...event, i_liked: newStatus, likes_count: event.likes_count + (newStatus ? 1 : -1) };
    setEvents(updatedEvents);
    try {
      await toggleLike(eventId);
      showMessage(newStatus ? t('eventsPage.likeSuccess') : t('eventsPage.unlikeSuccess'), 'success');
    } catch (err) {
      setEvents(originalEvents);
      showMessage(t('eventsPage.likeError'), 'error');
    }
  };

  const handleDelete = async (eventId) => {
    setDeleteConfirm(eventId);
  };

  const confirmDelete = async (eventId) => {
    setDeleteConfirm(null);
    const originalEvents = [...events];
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);

    try {
      await deleteEvent(eventId);
      showMessage(t('eventsPage.deleteSuccess'), 'success');
    } catch (err) {
      setEvents(originalEvents);
      const errorMessage = err.response?.data?.detail || t('eventsPage.deleteError');
      showMessage(errorMessage, 'error');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="events-page-scoped events-page-layout">
      <Navbar isAuthenticated={true} />

      {message && (
        <div className={`feedback-toast ${message.type} ${isDarkTheme ? 'dark-theme' : ''}`}>
          <div className="toast-content">{message.type === 'success' ? '✅' : '⚠️'} {message.text}</div>
        </div>
      )}

      {deleteConfirm && (
        <div className="delete-modal-overlay">
          <div className={`delete-modal ${isDarkTheme ? 'dark-theme' : ''}`}>
            <div className={`delete-modal-header ${isDarkTheme ? 'dark-theme' : ''}`}>
              <Icon name="delete" /> {t('eventsPage.confirmDelete')}
            </div>
            <div className={`delete-modal-body ${isDarkTheme ? 'dark-theme' : ''}`}>
              <p>{t('eventsPage.deleteConfirmMessage', 'Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')}</p>
            </div>
            <div className={`delete-modal-footer ${isDarkTheme ? 'dark-theme' : ''}`}>
              <button className={`btn-cancel ${isDarkTheme ? 'dark-theme' : ''}`} onClick={cancelDelete}>
                {t('common.cancel', 'İptal Et')}
              </button>
              <button className="btn-delete" onClick={() => confirmDelete(deleteConfirm)}>
                {t('common.delete', 'Evet, Sil')}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="events-main-content">
        <div className="events-header-section">
          <h1><Icon name="events" /> {t('eventsPage.title')}</h1>
          <p>{t('eventsPage.subtitle')}</p>
          <NavLink to="/events/create" className="add-event-btn">
            <Icon name="plus" className="mr-2" /> {t('eventsPage.buttonAdd')}
          </NavLink>
        </div>

        {loading && <div className="loader-container-main"><div className="loader-spinner-main" /><p>{t('eventsPage.loading')}</p></div>}
        {error && !loading && <div className="error-message-box-main"><Icon name="alerts" /> {error}</div>}

        {!loading && !error && (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <img src={event.image || 'https://placehold.co/600x400/CCCCCC/000000?text=No+Image'} alt={event.title} className="event-card-image" />
                <div className="event-card-content">
                  
                  <h2>{event.title}</h2>
                  
                  <div className="event-card-info">
                    <span className="info-item">
                      <Icon name="date" /> 
                      {new Date(event.date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="info-item">
                        <Icon name="location" /> {event.location}
                    </span>
                  </div>

                  {/* --- GÜNCELLENEN KISIM: BAŞLIKLI FORMAT --- */}
                  <div className="event-details-grid">
                      {/* İlçe */}
                      {event.exact_location && (
                          <div className="detail-tag">
                              <Icon name="district" /> 
                              {/* Başlık: Veri */}
                              <span>{t('eventsPage.labelDistrict', 'İlçe')}: {event.exact_location}</span>
                          </div>
                      )}
                      
                      {/* Süre */}
                      {(event.duration !== null && event.duration !== undefined) && (
                          <div className="detail-tag">
                              <Icon name="time" /> 
                              {/* Başlık: Veri */}
                              <span>{t('eventsPage.labelDuration', 'Süre')}: {formatDuration(event.duration)}</span>
                          </div>
                      )}

                      {/* Ekipman */}
                      {event.equipment_needed && (
                          <div className="detail-tag full-width">
                              <Icon name="tool" /> 
                              {/* Başlık: Veri */}
                              <span>{t('eventsPage.labelEquipment', 'Gereken Ekipman')}: {event.equipment_needed}</span>
                          </div>
                      )}
                  </div>
                  {/* ------------------------------------------- */}

                  <p className="event-card-description">
                      <strong>{t('eventsPage.labelDescription', 'Açıklama')}: </strong>
                      {event.description}
                  </p>
                  
                  <div className="event-card-actions">
                    <button className={`participate-btn ${event.i_am_participating ? 'participating' : ''}`} onClick={() => handleParticipate(event.id)}>
                      {event.i_am_participating ? `✓ ${t('eventsPage.participating')}` : t('eventsPage.participate')}
                    </button>
                    <div className="right-actions">
                        <button className={`like-btn ${event.i_liked ? 'liked' : ''}`} onClick={() => handleLike(event.id)}>
                            <Icon name="like" /> {event.likes_count}
                        </button>
                        <span className="participants-count"><Icon name="user" /> {event.participants_count}</span>
                        {currentUserId === event.creator && (
                          <button className="delete-btn" onClick={() => handleDelete(event.id)} title={t('eventsPage.deleteButton', 'Etkinliği Sil')}>
                            <Icon name="delete" />
                          </button>
                        )}
                    </div>
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