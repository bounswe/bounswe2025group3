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
  
  const getLocalDateTime = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };
  
  const initialData = {
    title: '',
    description: '',
    location: '',
    district: '', 
    duration: '', 
    equipment: '',
    date: getLocalDateTime(), 
    image: null, 
  };
  
  const [formData, setFormData] = useState(initialData);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Alan bazlı hatalar için state
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000); 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Kullanıcı değiştirdiğinde o alanın hatasını temizle
    if (fieldErrors[e.target.name]) {
        setFieldErrors(prev => ({...prev, [e.target.name]: null}));
    }
    // District için özel kontrol (backend ismi exact_location)
    if (e.target.name === 'district' && fieldErrors.exact_location) {
        setFieldErrors(prev => ({...prev, exact_location: null}));
    }
    // Equipment için özel kontrol (backend ismi equipment_needed)
    if (e.target.name === 'equipment' && fieldErrors.equipment_needed) {
        setFieldErrors(prev => ({...prev, equipment_needed: null}));
    }
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setFormData(prev => ({ ...prev, location: '' }));
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      Object.assign(file, { preview: URL.createObjectURL(file) });
      setFormData(prev => ({ ...prev, image: file }));
      setFieldErrors(prev => ({ ...prev, image: null }));
    } else {
      setFieldErrors(prev => ({ ...prev, image: t('eventsPage.errorImageOnly') || 'Lütfen sadece resim dosyası yükleyiniz.' }));
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => { if (e.target.files.length > 0) processFile(e.target.files[0]); };
  
  const removeImage = (e) => {
    e.stopPropagation();
    if (formData.image?.preview) URL.revokeObjectURL(formData.image.preview);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); // Reset errors

    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      setFieldErrors({ general: t('eventsPage.formRequired') });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('description', formData.description);
      dataToSend.append('location', formData.location);
      dataToSend.append('date', new Date(formData.date).toISOString());
      
      if (formData.district) {
          dataToSend.append('exact_location', formData.district);
      }
      
      if (formData.duration) {
          const hours = parseFloat(formData.duration);
          const minutes = Math.round(hours * 60);
          dataToSend.append('duration', minutes);
      }
      
      if (formData.equipment) {
          dataToSend.append('equipment_needed', formData.equipment);
      }

      if (formData.image) {
        dataToSend.append('image_file', formData.image, formData.image.name); 
      }
      
      await createEvent(dataToSend);
      
      setFormData(initialData);
      setSelectedCountry(''); 
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      showMessage(t('eventsPage.createSuccess') || 'Etkinlik başarıyla oluşturuldu!', 'success');

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
            const fieldError = Array.isArray(err.response.data[field]) 
              ? err.response.data[field][0]
              : err.response.data[field];
            
            // Check if it's a banned word error and format it nicely
            if (typeof fieldError === 'string' && fieldError.includes('banned word')) {
              const match = fieldError.match(/banned word: '([^']+)'/);
              const bannedWord = match ? match[1] : 'that word';
              return `❌ ${field.charAt(0).toUpperCase() + field.slice(1)} contains a prohibited word`;
            }
            return `${field}: ${fieldError}`;
          });
          errorMessage = errorMessages.join(' | ') || JSON.stringify(err.response.data);
        } else {
          errorMessage = err.response.data;
        }
      }
      showMessage(errorMessage, 'error');   } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => { navigate('/events'); };

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
            {fieldErrors.general && <p className="form-error">{fieldErrors.general}</p>}
            
            <div className="form-group">
              <label>{t('eventsPage.placeholderTitle')}</label>
              <input 
                name="title" 
                type="text" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                style={fieldErrors.title ? {borderColor: '#dc3545'} : {}}
              />
              {/* Blacklist hatası */}
              {fieldErrors.title && <small style={{color: '#dc3545'}}>{fieldErrors.title}</small>}
            </div>

            <div className="form-group">
              <label>{t('eventsPage.placeholderDescription')}</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows="4" 
                required 
                style={fieldErrors.description ? {borderColor: '#dc3545'} : {}}
              />
               {/* Blacklist hatası */}
               {fieldErrors.description && <small style={{color: '#dc3545'}}>{fieldErrors.description}</small>}
            </div>

            <div className="form-group">
              <label>{t('eventsPage.placeholderLocation')}</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select value={selectedCountry} onChange={handleCountryChange} required className="form-select">
                  <option value="">{t('profile_page.form.select_country')}</option>
                  {Country.getAllCountries().map((c) => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                </select>
                <select name="location" value={formData.location} onChange={handleChange} required disabled={!selectedCountry} className="form-select">
                  <option value="">{t('profile_page.form.select_city')}</option>
                  {selectedCountry && State.getStatesOfCountry(selectedCountry).map((s, i) => <option key={`${s.name}-${i}`} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label className="sub-label">{t('eventsPage.labelDistrict') || 'İlçe / Semt'}</label>
                <input 
                    name="district" 
                    type="text" 
                    value={formData.district} 
                    onChange={handleChange} 
                    placeholder={t('eventsPage.placeholderDistrict')} 
                    style={fieldErrors.exact_location ? {borderColor: '#dc3545'} : {}}
                />
                {/* Blacklist hatası (Backend exact_location döner) */}
                {fieldErrors.exact_location && <small style={{color: '#dc3545'}}>{fieldErrors.exact_location}</small>}
              </div>
            </div>

            <div className="form-row-split">
                <div className="form-group">
                    <label>{t('eventsPage.labelDateTime')}</label>
                    <input name="date" type="datetime-local" value={formData.date} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label>{t('eventsPage.labelDuration')} ({t('eventsPage.unitHours') || 'Saat'})</label>
                    <input 
                        name="duration" 
                        type="number" 
                        value={formData.duration} 
                        onChange={handleChange} 
                        placeholder={t('eventsPage.placeholderDurationExample', 'Örn: 1.5')}
                        min="0"
                        step="0.1" 
                    />
                </div>
            </div>

            <div className="form-group equipment-group">
                <label>{t('eventsPage.labelEquipment')}</label>
                <input 
                    name="equipment" 
                    type="text" 
                    value={formData.equipment} 
                    onChange={handleChange} 
                    placeholder={t('eventsPage.placeholderEquipment')} 
                    style={fieldErrors.equipment_needed ? {borderColor: '#dc3545'} : {}}
                />
                {/* Blacklist hatası (Backend equipment_needed döner) */}
                {fieldErrors.equipment_needed && <small style={{color: '#dc3545'}}>{fieldErrors.equipment_needed}</small>}
            </div>

            <div className="form-group image-upload-group">
              <label>{t('eventsPage.labelImage')}</label>
              <div 
                className={`dropzone ${isDragging ? 'active' : ''} ${formData.image ? 'has-file' : ''}`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input type="file" accept="image/*" onChange={handleFileSelect} ref={fileInputRef} style={{ display: 'none' }} />
                {formData.image ? (
                  <div className="file-preview">
                    <div className="file-info">
                        {formData.image.preview && <img src={formData.image.preview} alt="Preview" className="image-preview-thumb" />}
                        <div className="text-info"><strong>{formData.image.name}</strong><br/><small>{Math.round(formData.image.size/1024)} KB</small></div>
                    </div>
                    <button type="button" className="remove-btn" onClick={removeImage}><Icon name="trash" /></button>
                  </div>
                ) : (
                  <p className="dropzone-text"><Icon name="upload" /> {isDragging ? t('eventsPage.dragDropActive') : t('eventsPage.dragDropInactive')}</p>
                )}
              </div>
              {fieldErrors.image && <small style={{color: '#dc3545'}}>{fieldErrors.image}</small>}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? t('eventsPage.buttonCreating') : t('eventsPage.buttonCreate')}
              </button>
            </div>
          </form>
        </div>
        <div className="back-button-container">
          <button onClick={handleGoBack} className="btn-back"><Icon name="back" className="mr-2" />{t('eventsPage.backToEvents')}</button>
        </div>
      </main>
    </div>
  );
};

export default EventCreate;