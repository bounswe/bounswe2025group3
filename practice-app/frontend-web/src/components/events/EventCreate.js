import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Country, State } from 'country-state-city';
import Navbar from '../common/Navbar';
import './EventCreate.css'; 
import { useNavigate } from 'react-router-dom'; 
import { createEvent } from '../../services/api'; 

// --- Helper Components ---
const Icon = ({ name, className = '' }) => {
  const icons = {
    events: '📅', back: '⬅️', plus: '➕', upload: '📤', trash: '🗑️'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const EventCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  const fileInputRef = useRef(null); // Gizli input'a erişmek için
  
  // State Tanımları
  const initialData = {
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().substring(0, 16), 
    image: null, 
  };
  
  const [formData, setFormData] = useState(initialData);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState(null);
  
  // Sürükleme Durumu için State (Kütüphanesiz)
  const [isDragging, setIsDragging] = useState(false);

  // --- Yardımcı Fonksiyonlar ---
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000); 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setFormData(prev => ({ ...prev, location: '' }));
  };

  // --- DOSYA İŞLEME FONKSİYONLARI (SAF REACT) ---

  // 1. Dosyayı işleyip state'e atayan yardımcı fonksiyon
  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Önizleme URL'si oluştur
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      });
      setFormData(prev => ({ ...prev, image: file }));
      setFormError('');
    } else {
      setFormError(t('eventsPage.errorImageOnly') || 'Please upload an image file (jpg, png).');
    }
  };

  // 2. Sürükleme Alanına Giriş
  const handleDragOver = (e) => {
    e.preventDefault(); // Tarayıcının dosyayı açmasını engelle
    setIsDragging(true);
  };

  // 3. Sürükleme Alanından Çıkış
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 4. Dosya Bırakıldığında (DROP)
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // 5. Normal Tıklama ile Seçim
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // 6. Dosyayı Kaldır
  const removeImage = (e) => {
    e.stopPropagation(); // Tıklamanın yukarı gitmesini engelle
    if (formData.image && formData.image.preview) {
      URL.revokeObjectURL(formData.image.preview);
    }
    setFormData(prev => ({ ...prev, image: null }));
  };

  // --- FORM GÖNDERME ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      setFormError(t('eventsPage.formRequired') || 'Please fill in all mandatory fields.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('description', formData.description);
      dataToSend.append('location', formData.location);
      dataToSend.append('date', new Date(formData.date).toISOString());
      
      if (formData.image) {
        dataToSend.append('image_file', formData.image, formData.image.name); 
      }
      
      const response = await createEvent(dataToSend);
      
      // Başarılı ise formu temizle
      setFormData(initialData);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Input'u da sıfırla
      
      showMessage(t('eventsPage.createSuccess') || `Event "${response.title}" created successfully!`, 'success');

    } catch (err) {
      console.error('Failed to create event:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle DRF validation errors - they can be in different formats
      let errorMessage = err.message;
      if (err.response?.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          // DRF validation errors are usually an object with field names
          const errorFields = Object.keys(err.response.data);
          const errorMessages = errorFields.map(field => {
            const fieldErrors = Array.isArray(err.response.data[field]) 
              ? err.response.data[field].join(', ')
              : err.response.data[field];
            return `${field}: ${fieldErrors}`;
          });
          errorMessage = errorMessages.join('; ') || JSON.stringify(err.response.data);
        } else {
          errorMessage = err.response.data;
        }
      }
      showMessage(t('eventsPage.createError') + `: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
      if (formData.image && formData.image.preview) {
        URL.revokeObjectURL(formData.image.preview);
      }
    }
  };

  const handleGoBack = () => {
    navigate('/events'); 
  };

  // --- RENDER ---
  return (
    <div className="event-create-scoped event-create-layout">
      <Navbar isAuthenticated={true} />

      <main className="create-main-content">
        <div className="create-header-section">
          <h1><Icon name="plus" /> {t('eventsPage.createTitle') || 'Create New Event'}</h1>
          <p>{t('eventsPage.subtitle') || 'Fill out the details to organize your community event.'}</p>
        </div>
        
        {message && (
          <div className={`feedback-message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="create-form-container">
          <form onSubmit={handleSubmit} className="event-create-form">
            {formError && <p className="form-error">{formError}</p>}
            
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
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  required
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">Select Country</option>
                  {Country.getAllCountries().map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={!selectedCountry}
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">Select City</option>
                  {selectedCountry &&
                    State.getStatesOfCountry(selectedCountry).map((state, index) => (
                      <option key={`${state.name}-${index}`} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                </select>
              </div>
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

            {/* --- SAF REACT DRAG & DROP ALANI --- */}
            <div className="form-group image-upload-group">
              <label>{"Event Image (Optional)"}</label>
              
              <div 
                className={`dropzone ${isDragging ? 'active' : ''} ${formData.image ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()} // Kutunun herhangi bir yerine tıklayınca input açılsın
              >
                {/* Gizli Input */}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                />
                
                {formData.image ? (
                  <div className="file-preview">
                    <div className="file-info">
                        {formData.image.preview && (
                        <img src={formData.image.preview} alt="Preview" className="image-preview-thumb" />
                        )}
                        <div className="text-info">
                            <strong>{formData.image.name}</strong> 
                            <br/>
                            <small>{Math.round(formData.image.size / 1024)} KB</small>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        className="remove-btn" 
                        onClick={removeImage}
                        title="Remove image"
                    >
                        <Icon name="trash" />
                    </button>
                  </div>
                ) : isDragging ? (
                  <p className="dropzone-text">
                    <Icon name="upload" /> { 'Drop the image here ...'}
                  </p>
                ) : (
                  <p className="dropzone-text">
                    <Icon name="upload" /> {'Drag and drop an image here, or click to select'}
                  </p>
                )}
              </div>
            </div>
            {/* ----------------------------- */}

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
        
        <div className="back-button-container">
          <button onClick={handleGoBack} className="btn-back">
            <Icon name="back" className="mr-2" />
            {t('eventsPage.backToEvents')}
          </button>
        </div>
      </main>
    </div>
  );
};

export default EventCreate;