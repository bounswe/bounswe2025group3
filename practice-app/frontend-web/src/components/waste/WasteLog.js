import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWasteLogs, addWasteLog, getSubCategories } from '../../services/api';
import Navbar from '../common/Navbar';
import './WasteLog.css';

const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆',
        logNew: '➕', list: '📋', alerts: '⚠️', dashboard: '🏠',
        back: '↩️', category: '🏷️', quantity: '⚖️', disposal: '♻️',
        notes: '📝', retry: '🔄', goal: '🎯', submit: '✔️'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const WasteLog = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [form, setForm] = useState({ subcategory: '', quantity: '', disposal_method: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null); // Will store the translation KEY
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [logsData, subCategoriesData] = await Promise.all([ getWasteLogs(), getSubCategories() ]);
            setLogs(Array.isArray(logsData) ? logsData : []);
            setSubCategories(Array.isArray(subCategoriesData) ? subCategoriesData : []);
            if (!Array.isArray(subCategoriesData) || subCategoriesData.length === 0) {
                setError('waste_log_page.error_no_categories'); // Store the key
            }
        } catch (err) {
            setError('waste_log_page.error_fetch_failed'); // Store the key
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subcategory || !form.quantity) {
            setError('waste_log_page.error_select_category_and_quantity'); // Store the key
            return;
        }
        const quantity = parseFloat(form.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            setError('waste_log_page.error_quantity_positive'); // Store the key
            return;
        }

        setLoadingSubmit(true);
        setError(null);
        try {
            const payload = {
                sub_category: parseInt(form.subcategory),
                quantity,
                disposal_method: form.disposal_method || undefined,
                notes: form.notes || undefined,
            };
            await addWasteLog(payload);
            const updatedLogsData = await getWasteLogs();
            setLogs(Array.isArray(updatedLogsData) ? updatedLogsData : []);
            setForm({ subcategory: '', quantity: '', disposal_method: '', notes: '' });
            alert('Waste log added successfully!');
        } catch (err) {
            setError('waste_log_page.error_add_log_failed'); // Store a generic key
            console.error('Error adding log:', err.response?.data || err.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="wastelog-page-scoped wastelog-page-layout">
            <Navbar isAuthenticated={true} />

            <main className="wastelog-main-content">
                <div className="wastelog-header-section">
                    <h1><Icon name="waste" /> {t('waste_log_page.title')}</h1>
                    <p>{t('waste_log_page.subtitle')}</p>
                </div>

                {error && (
                    <div className="error-message-box-main wastelog-error">
                        <Icon name="alerts" className="error-icon"/> {t(error)} {/* Translate the key here */}
                        {error === 'waste_log_page.error_no_categories' && (
                            <button onClick={fetchData} disabled={loading} className="retry-button">
                                <Icon name="retry"/> {t('waste_log_page.retry_button')}
                            </button>
                        )}
                    </div>
                )}

                {/* THE MISSING JSX IS NOW RESTORED */}
                <div className="wastelog-form-and-list-container">
                    <section className="wastelog-form-card">
                        <h3 className="form-card-title"><Icon name="logNew"/> {t('waste_log_page.form.title')}</h3>
                        <form onSubmit={handleSubmit} className="wastelog-form">
                            <div className="form-field">
                                <label htmlFor="subcategory"><Icon name="category"/> {t('waste_log_page.form.category_label')}</label>
                                <select id="subcategory" name="subcategory" value={form.subcategory} onChange={handleInputChange} disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0} required>
                                    <option value="">{t('waste_log_page.form.category_placeholder')}</option>
                                    {subCategories.map((sc) => <option key={sc.id} value={sc.id}>{sc.name} ({sc.unit})</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label htmlFor="quantity"><Icon name="quantity"/> {t('waste_log_page.form.quantity_label')}</label>
                                <input id="quantity" name="quantity" type="number" placeholder={t('waste_log_page.form.quantity_placeholder')} value={form.quantity} onChange={handleInputChange} min="0.01" step="any" disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0} required />
                            </div>
                            <div className="form-field">
                                <label htmlFor="disposal_method"><Icon name="disposal"/> {t('waste_log_page.form.disposal_label')}</label>
                                <select id="disposal_method" name="disposal_method" value={form.disposal_method} onChange={handleInputChange} disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0}>
                                    <option value="">{t('waste_log_page.form.disposal_placeholder')}</option>
                                    <option value="recycled">{t('waste_log_page.form.disposal_options.recycled')}</option>
                                    <option value="composted">{t('waste_log_page.form.disposal_options.composted')}</option>
                                    <option value="landfill">{t('waste_log_page.form.disposal_options.landfill')}</option>
                                    <option value="donated">{t('waste_log_page.form.disposal_options.donated')}</option>
                                    <option value="incinerated">{t('waste_log_page.form.disposal_options.incinerated')}</option>
                                    <option value="other">{t('waste_log_page.form.disposal_options.other')}</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label htmlFor="notes"><Icon name="notes"/> {t('waste_log_page.form.notes_label')}</label>
                                <textarea id="notes" name="notes" placeholder={t('waste_log_page.form.notes_placeholder')} value={form.notes} onChange={handleInputChange} rows="3" disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0} />
                            </div>
                            <button type="submit" className="submit-log-button" disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0}>
                                {loadingSubmit ? (
                                    <>{t('waste_log_page.form.submit_button_adding')}</>
                                ) : (
                                    <><Icon name="submit"/> {t('waste_log_page.form.submit_button')}</>
                                )}
                            </button>
                        </form>
                    </section>
                    <section className="wastelog-list-card">
                        <h3 className="list-card-title"><Icon name="list"/> {t('waste_log_page.log_list.title')}</h3>
                        {loading && !loadingSubmit && <p className="loading-text">{t('waste_log_page.log_list.loading')}</p>}
                        {!loading && logs.length === 0 && <p className="no-logs-message">{t('waste_log_page.log_list.no_logs')}</p>}
                        {!loading && logs.length > 0 && (
                            <ul className="wastelog-items-list">
                                {logs.slice(0, 10).map((log) => {
                                    const subCategoryDetails = subCategories.find(sc => sc.id === log.sub_category);
                                    return (
                                        <li key={log.id} className="wastelog-item">
                                            <div className="item-main-info">
                                                <span className="item-category"><Icon name="category" /> {log.sub_category_name || subCategoryDetails?.name || t('waste_log_page.log_list.unknown_category')}</span>
                                                <span className="item-quantity">{Number(log.quantity).toFixed(2)} {subCategoryDetails?.unit || 'units'}</span>
                                            </div>
                                            <div className="item-meta-info">
                                                <span className="item-score">{t('waste_log_page.log_list.score_prefix')}: {log.score || t('waste_log_page.log_list.score_na')}</span>
                                                {log.disposal_method && <span className="item-disposal">{t('waste_log_page.log_list.method_prefix')}: {log.disposal_method}</span>}
                                            </div>
                                            {log.notes && <p className="item-notes">{t('waste_log_page.log_list.notes_prefix')}: {log.notes}</p>}
                                            <span className="item-date">{t('waste_log_page.log_list.logged_prefix')}: {new Date(log.date_logged).toLocaleDateString()}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                         {!loading && logs.length > 10 && <p className="view-all-logs-link">{t('waste_log_page.log_list.view_all_prompt')}</p>}
                    </section>
                </div>

                <div className="page-actions">
                    <button onClick={() => navigate('/dashboard')} className="back-to-dashboard-button">
                        <Icon name="back"/> {t('waste_log_page.back_to_dashboard_button')}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default WasteLog;