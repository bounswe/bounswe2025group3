import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// getWasteCategories fonksiyonunu import etmeyi unutmayın
import { getWasteLogs, addWasteLog, getSubCategories, getWasteCategories } from '../../services/api';
import Navbar from '../common/Navbar';
import './WasteLog.css';

const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆',
        logNew: '➕', list: '📋', alerts: '⚠️', dashboard: '🏠',
        back: '↩️', category: '🏷️', quantity: '⚖️', disposal: '♻️',
        notes: '📝', retry: '🔄', goal: '🎯', submit: '✔️',
        // Yeni kategoriler için ikonlar
        batteries: '🔋', 
        electronic: '🔌',
        glass: '🏺',
        organic: '🍎',
        paper: '📄',
        plastic: '🥤',
        metal: '🥫',
        recyclable: '♻️',
        cooking_oil: '🛢️'
    };
    
    // API'den gelen isim büyük/küçük harf veya boşluk içerebilir, standardize ediyoruz
    const key = name ? name.toLowerCase().replace(/ /g, '_') : 'category';
    // Tam eşleşme yoksa 'category' ikonunu göster
    return <span className={`icon ${className}`}>{icons[key] || icons['category']}</span>;
};

const WasteLog = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');

    const [logs, setLogs] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]); // Ana kategoriler için state
    
    const [form, setForm] = useState({ subcategory: '', quantity: '', disposal_method: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token]);

    // --- Yardımcı Çeviri Fonksiyonları ---
    const getCategoryTrans = (apiName) => {
        if (!apiName) return "";
        const key = apiName.toLowerCase().replace(/ /g, "_");
        return t(`waste_categories.${key}`, { defaultValue: apiName });
    };

    const getUnitTrans = (unit) => {
        if (!unit) return "";
        return t(`units.${unit.toLowerCase()}`, { defaultValue: unit });
    };

    // --- Veri Çekme ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Üç veriyi paralel çekiyoruz: Loglar, Alt Kategoriler ve Ana Kategoriler
            const [logsRes, subCategoriesRes, categoriesRes] = await Promise.all([ 
                getWasteLogs(), 
                getSubCategories(),
                getWasteCategories() 
            ]);

            // API dokümanına göre veriler "results" anahtarı içinde geliyor (Pagination)
            // Eğer results yoksa (pagination kapalıysa) direkt datayı alıyoruz.
            const logsData = logsRes.results || logsRes;
            const subCatsData = subCategoriesRes.results || subCategoriesRes;
            const catsData = categoriesRes.results || categoriesRes;

            setLogs(Array.isArray(logsData) ? logsData : []);
            setSubCategories(Array.isArray(subCatsData) ? subCatsData : []);
            setCategories(Array.isArray(catsData) ? catsData : []);

            if (!Array.isArray(subCatsData) || subCatsData.length === 0) {
                // Sadece uyarı, engel değil
                console.warn("No subcategories found"); 
            }
        } catch (err) {
            console.error("Error fetching waste data:", err);
            setError('waste_log_page.error_fetch_failed');
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

    // --- ID ve İsim Eşleştirme Mantığı ---
    
    // 1. Kategori ID'sinden Kategori İsmine ulaşmak için bir "Sözlük" (Map) oluşturuyoruz.
    // Örn: { 1: "Recyclable", 3: "Batteries" }
    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.id] = cat.name;
    });

    // 2. Alt kategorileri, bulduğumuz bu isimlere göre grupluyoruz.
    const groupedSubCategories = subCategories.reduce((acc, sc) => {
        // sc.category API'den ID olarak geliyor (Örn: 3)
        // categoryMap[3] bize "Batteries" ismini veriyor.
        const categoryId = sc.category; 
        const categoryName = categoryMap[categoryId] || 'Other'; 
        
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(sc);
        return acc;
    }, {});

    const getScoreForSubcategory = (subcategoryId) => {
        const subcategory = subCategories.find(sc => sc.id === parseInt(subcategoryId));
        return subcategory?.score_per_unit || 'N/A';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subcategory || !form.quantity) {
            setError('waste_log_page.error_select_category_and_quantity');
            return;
        }
        const quantity = parseFloat(form.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            setError('waste_log_page.error_quantity_positive');
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
            
            // Log eklendikten sonra sadece logları yenilemek yeterli olabilir ama
            // tutarlılık için fetchData çağırıyoruz.
            await fetchData();
            
            setForm({ subcategory: '', quantity: '', disposal_method: '', notes: '' });
            // alert('Waste log added successfully!'); 
        } catch (err) {
            setError('waste_log_page.error_add_log_failed');
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
                        <Icon name="alerts" className="error-icon"/> {t(error)}
                        {error === 'waste_log_page.error_no_categories' && (
                            <button onClick={fetchData} disabled={loading} className="retry-button">
                                <Icon name="retry"/> {t('waste_log_page.retry_button')}
                            </button>
                        )}
                    </div>
                )}

                <div className="wastelog-form-and-list-container">
                    {/* --- FORM BÖLÜMÜ --- */}
                    <section className="wastelog-form-card">
                        <h3 className="form-card-title"><Icon name="logNew"/> {t('waste_log_page.form.title')}</h3>
                        <form onSubmit={handleSubmit} className="wastelog-form">
                            <div className="form-field">
                                <label htmlFor="subcategory"><Icon name="category"/> {t('waste_log_page.form.category_label')}</label>
                                <select 
                                    id="subcategory" 
                                    name="subcategory" 
                                    value={form.subcategory} 
                                    onChange={handleInputChange} 
                                    disabled={loading || loadingSubmit || subCategories.length === 0} 
                                    required
                                >
                                    <option value="">{t('waste_log_page.form.category_placeholder')}</option>
                                    {Object.entries(groupedSubCategories).map(([mainCatName, items]) => (
                                        <optgroup key={mainCatName} label={getCategoryTrans(mainCatName)}>
                                            {items.map((sc) => (
                                                <option key={sc.id} value={sc.id}>
                                                    {getCategoryTrans(sc.name)} ({getUnitTrans(sc.unit)}) - {sc.score_per_unit || 0} pts
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                {form.subcategory && (
                                    <div className="score-display">
                                        <Icon name="goal" /> {t('waste_log_page.form.score_per_item', { defaultValue: 'Points per item' })}: <span className="score-value">{getScoreForSubcategory(form.subcategory)} pts</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="form-field">
                                <label htmlFor="quantity"><Icon name="quantity"/> {t('waste_log_page.form.quantity_label')}</label>
                                <input 
                                    id="quantity" 
                                    name="quantity" 
                                    type="number" 
                                    placeholder={t('waste_log_page.form.quantity_placeholder')} 
                                    value={form.quantity} 
                                    onChange={handleInputChange} 
                                    min="0.01" 
                                    step="any" 
                                    disabled={loading || loadingSubmit || subCategories.length === 0} 
                                    required 
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="disposal_method"><Icon name="disposal"/> {t('waste_log_page.form.disposal_label')}</label>
                                <select id="disposal_method" name="disposal_method" value={form.disposal_method} onChange={handleInputChange} disabled={loading || loadingSubmit}>
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
                                <textarea id="notes" name="notes" placeholder={t('waste_log_page.form.notes_placeholder')} value={form.notes} onChange={handleInputChange} rows="3" disabled={loading || loadingSubmit} />
                            </div>

                            <button type="submit" className="submit-log-button" disabled={loading || loadingSubmit || subCategories.length === 0}>
                                {loadingSubmit ? (
                                    <>{t('waste_log_page.form.submit_button_adding')}</>
                                ) : (
                                    <><Icon name="submit"/> {t('waste_log_page.form.submit_button')}</>
                                )}
                            </button>
                        </form>
                    </section>

                    {/* --- LİSTE BÖLÜMÜ --- */}
                    <section className="wastelog-list-card">
                        <h3 className="list-card-title"><Icon name="list"/> {t('waste_log_page.log_list.title')}</h3>
                        {loading && !loadingSubmit && <p className="loading-text">{t('waste_log_page.log_list.loading')}</p>}
                        {!loading && logs.length === 0 && <p className="no-logs-message">{t('waste_log_page.log_list.no_logs')}</p>}
                        
                        {!loading && logs.length > 0 && (
                            <ul className="wastelog-items-list">
                                {logs.slice(0, 10).map((log) => {
                                    const subCategoryDetails = subCategories.find(sc => sc.id === log.sub_category);
                                    
                                    // Log listesi için de ikon bulmamız lazım.
                                    // Log -> sub_category ID -> category ID -> Category Name -> Icon
                                    let categoryNameForIcon = 'category';
                                    if (subCategoryDetails) {
                                        // subCategoryDetails.category bir ID'dir (Örn: 3)
                                        const catID = subCategoryDetails.category;
                                        // Map'ten ismi buluyoruz (Örn: "Batteries")
                                        categoryNameForIcon = categoryMap[catID] || 'category';
                                    }

                                    // API'de bazen sub_category_name dönüyor, dönmezse biz buluyoruz
                                    const rawName = log.sub_category_name || subCategoryDetails?.name;
                                    const rawUnit = subCategoryDetails?.unit;

                                    return (
                                        <li key={log.id} className="wastelog-item">
                                            <div className="item-main-info">
                                                <span className="item-category">
                                                    <Icon name={categoryNameForIcon} /> 
                                                    {rawName ? getCategoryTrans(rawName) : t('waste_log_page.log_list.unknown_category')}
                                                </span>
                                                <span className="item-quantity">
                                                    {Number(log.quantity).toFixed(2)} {getUnitTrans(rawUnit) || 'units'}
                                                </span>
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