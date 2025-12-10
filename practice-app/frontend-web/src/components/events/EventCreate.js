import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Country, State } from 'country-state-city';
import Navbar from '../common/Navbar';
import './EventCreate.css'; 
import { useNavigate } from 'react-router-dom'; 
import { createEvent } from '../../services/api'; 

const Icon = ({ name, className = '' }) => {
  const icons = {
    events: '📅', back: '⬅️', plus: '➕', upload: '📤', trash: '🗑️'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const EventCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  const fileInputRef = useRef(null);
  
  const initialData = {
    title: '',
    description: '',
    location: '',
    district: '',
    duration: '',
    equipment: '',
    date: new Date().toISOString().substring(0, 16), 
    image: null, 
  };
  
  const [formData, setFormData] = useState(initialData);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      });
      setFormData(prev => ({ ...prev, image: file }));
      setFormError('');
    } else {
      setFormError(t('eventsPage.errorImageOnly') || 'Please upload an image file (jpg, png).');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    if (formData.image && formData.image.preview) {
      URL.revokeObjectURL(formData.image.preview);
    }
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      setFormError(t('eventsPage.formRequired'));
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      
      let fullDescription = formData.description;
      if (formData.district) fullDescription += `\n\nDistrict: ${formData.district}`;
      if (formData.duration) fullDescription += `\nDuration: ${formData.duration} hours`;
      if (formData.equipment) fullDescription += `\nEquipment Needed: ${formData.equipment}`;

      dataToSend.append('description', fullDescription);
      dataToSend.append('location', formData.location);
      dataToSend.append('date', new Date(formData.date).toISOString());
      
      if (formData.image) {
        dataToSend.append('image', formData.image, formData.image.name); 
      }
      
      const response = await createEvent(dataToSend);
      
      setFormData(initialData);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      
      showMessage(t('eventsPage.createSuccess'), 'success');

    } catch (err) {
      console.error('Failed to create event:', err);
      const errorMessage = err.response?.data?.detail || err.message;
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

  return (
    <div className="event-create-scoped event-create-layout">
      <Navbar isAuthenticated={true} />

      <main className="create-main-content">
        <div className="create-header-section">
          <h1><Icon name="plus" /> {t('eventsPage.createTitle')}</h1>
          <p>{t('eventsPage.subtitle')}</p>
        </div>
        
        {message && (
          <div className={`feedback-message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="create-form-container">
          <form onSubmit={handleSubmit} className="event-create-form">
            {formError && <p className="form-error">{formError}</p>}
            
            {/* 1. BAŞLIK */}
            <div className="form-group">
              <label>{t('eventsPage.placeholderTitle')}</label>
              <input 
                name="title" 
                type="text" 
                value={formData.title} 
                onChange={handleChange} 
                required
              />
            </div>

            {/* 2. AÇIKLAMA */}
            <div className="form-group">
              <label>{t('eventsPage.placeholderDescription')}</label>
              <textarea
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows="4"
                required
              />
            </div>

            {/* 3. KONUM SEÇİMİ (Ülke -> Şehir -> İlçe/Mahalle) */}
            <div className="form-group">
              <label>{t('eventsPage.placeholderLocation')}</label>
              
              {/* Ülke ve Şehir Yan Yana */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  required
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--dashboard-input-border)', backgroundColor: 'var(--dashboard-input-bg)', color: 'var(--dashboard-text-primary)' }}
                >
                  <option value="">{t('profile_page.form.select_country')}</option>
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
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--dashboard-input-border)', backgroundColor: 'var(--dashboard-input-bg)', color: 'var(--dashboard-text-primary)' }}
                >
                  <option value="">{t('profile_page.form.select_city')}</option>
                  {selectedCountry &&
                    State.getStatesOfCountry(selectedCountry).map((state, index) => (
                      <option key={`${state.name}-${index}`} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* İlçe/Mahalle (Alt Satır) */}
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.9em', color: 'var(--dashboard-text-medium)', marginBottom: '5px', display:'block' }}>
                    {t('eventsPage.labelDistrict')}
                </label>
                <input 
                    name="district" 
                    type="text" 
                    value={formData.district} 
                    onChange={handleChange} 
                    placeholder={t('eventsPage.placeholderDistrict')} 
                />
              </div>
            </div>

            {/* 4. TARİH, SÜRE VE EKİPMAN */}
            <div className="form-row">
                {/* Tarih */}
                <div className="form-field">
                    <label>{t('eventsPage.labelDateTime')}</label>
                    <input 
                        name="date" 
                        type="datetime-local" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                {/* Süre */}
                <div className="form-field">
                    <label>{t('eventsPage.labelDuration')}</label>
                    <input 
                        name="duration" 
                        type="number" 
                        value={formData.duration} 
                        onChange={handleChange} 
                        placeholder={t('eventsPage.placeholderDuration')} 
                        min="0"
                    />
                </div>
            </div>

            {/* Ekipman (Tam Genişlik) */}
            <div className="form-group">
                <label>{t('eventsPage.labelEquipment')}</label>
                <input 
                    name="equipment" 
                    type="text" 
                    value={formData.equipment} 
                    onChange={handleChange} 
                    placeholder={t('eventsPage.placeholderEquipment')} 
                />
            </div>

            {/* 5. GÖRSEL YÜKLEME (EN SON) */}
            <div className="form-group image-upload-group">
              <label>{t('eventsPage.labelImage')}</label>
              
              <div 
                className={`dropzone ${isDragging ? 'active' : ''} ${formData.image ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
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
                        title={t('eventsPage.imageRemoveTitle')}
                    >
                        <Icon name="trash" />
                    </button>
                  </div>
                ) : isDragging ? (
                  <p className="dropzone-text">
                    <Icon name="upload" /> {t('eventsPage.dragDropActive')}
                  </p>
                ) : (
                  <p className="dropzone-text">
                    <Icon name="upload" /> {t('eventsPage.dragDropInactive')}
                  </p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('eventsPage.buttonCreating') : t('eventsPage.buttonCreate')}
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