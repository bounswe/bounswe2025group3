import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import './EventCreate.css'; // Dedicated styles for the creation page
// FIX: Import the actual useNavigate hook from react-router-dom
import { useNavigate } from 'react-router-dom'; 

// Import necessary API functions
import { createEvent } from '../../services/api'; 

// --- Component Definitions ---

// Reusable Icon component
const Icon = ({ name, className = '' }) => {
  const icons = {
    events: '📅', back: '⬅️', plus: '➕'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};


const EventCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Use the actual hook
  
  const initialData = {
    title: '',
    description: '',
    location: '',
    // Default to current date/time in local format
    date: new Date().toISOString().substring(0, 16), 
    image: '',
  };
  
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState(null); 

  // Helper function for user feedback
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000); 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      setFormError(t('eventsPage.formRequired') || 'Please fill in all mandatory fields.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');

    try {
      // Convert local datetime string to ISO 8601 format (Z-suffix)
      const dateInISO = new Date(formData.date).toISOString();
      
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: dateInISO,
        // Send null if image field is empty
        image: formData.image || null 
      };

      const response = await createEvent(payload);
      
      // Reset form and show success
      setFormData(initialData);
      showMessage(t('eventsPage.createSuccess') || `Event "${response.title}" created successfully!`, 'success');

    } catch (err) {
      console.error('Failed to create event:', err);
      const errorMessage = err.response?.data?.detail || err.message;
      showMessage(t('eventsPage.createError') + `: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/events'); // This uses the actual navigate function
  };

  return (
    <div className="event-create-scoped event-create-layout">
      <Navbar isAuthenticated={true} />

      <main className="create-main-content">
        <div className="create-header-section">
          <h1><Icon name="plus" /> {t('eventsPage.createTitle') || 'Create New Event'}</h1>
          <p>{t('eventsPage.subtitle') || 'Fill out the details to organize your community event.'}</p>
        </div>
        
        {/* Feedback Message */}
        {message && (
          <div className={`feedback-message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        {/* Form Container */}
        <div className="create-form-container">
          <form onSubmit={handleSubmit} className="event-create-form">
            {formError && (
              <p className="form-error">{formError}</p>
            )}
            
            <div className="form-group">
              <label>{t('eventsPage.placeholderTitle') || "Event Title *"}</label>
              <input 
                name="title" 
                type="text" 
                value={formData.title} 
                onChange={handleChange} 
                required
              />
            </div>

            <div className="form-group">
              <label>{t('eventsPage.placeholderDescription') || "Description *"}</label>
              <textarea
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows="4"
                required
              />
            </div>
            
            <div className="form-group">
              <label>{t('eventsPage.placeholderLocation') || "Location *"}</label>
              <input 
                name="location" 
                type="text" 
                value={formData.location} 
                onChange={handleChange} 
                required
              />
            </div>

            <div className="form-group">
              <label>{t('eventsPage.labelDateTime') || 'Date and Time *'}</label>
              <input 
                name="date" 
                type="datetime-local" 
                value={formData.date} 
                onChange={handleChange} 
                required
              />
            </div>

            <div className="form-group">
              <label>{t('eventsPage.placeholderImage') || "Image URL (Optional)"}</label>
              <input 
                name="image" 
                type="url" 
                value={formData.image} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (t('eventsPage.buttonCreating') || 'Creating...') : (t('eventsPage.buttonCreate') || 'Create Event')}
              </button>
            </div>
          </form>
        </div>
        
        {/* Navigation Button */}
        <div className="back-button-container">
          <button onClick={handleGoBack} className="btn-back">
            <Icon name="back" className="mr-2" />
            {t('common.backToEvents') || 'Back to Events'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default EventCreate;