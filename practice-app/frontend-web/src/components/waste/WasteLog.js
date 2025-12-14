import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { 
    getWasteLogs, 
    addWasteLog, 
    getSubCategories, 
    getWasteCategories,
    getUserScore 
} from '../../services/api';
import Navbar from '../common/Navbar';
import './WasteLog.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆',
        logNew: '➕', list: '📋', alerts: '⚠️', dashboard: '🏠',
        back: '↩️', category: '🏷️', quantity: '⚖️', disposal: '♻️',
        notes: '📝', retry: '🔄', goal: '🎯', submit: '✔️',
        batteries: '🔋', electronic: '🔌', glass: '🏺', organic: '🍎',
        paper: '📄', plastic: '🥤', metal: '🥫', recyclable: '♻️',
        cooking_oil: '🛢️', tree: '🌲', level: '🆙', badge: '🏅'
    };
    
    const key = name ? name.toLowerCase().replace(/ /g, '_') : 'category';
    return <span className={`icon ${className}`}>{icons[key] || icons['category']}</span>;
};

const WasteLog = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');

    const [logs, setLogs] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]); 
    
    const [currentTotalScore, setCurrentTotalScore] = useState(0);
    const [currentStreakStats, setCurrentStreakStats] = useState([]);

    const [form, setForm] = useState({ subcategory: '', quantity: '', disposal_method: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Notification helper
    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const TIERS = [
        { id: 'eco_explorer', min: 0 },
        { id: 'green_starter', min: 100 },
        { id: 'eco_advocate', min: 500 },
        { id: 'sustainability_hero', min: 1000 },
        { id: 'zero_waste_champion', min: 2500 },
        { id: 'planet_guardian', min: 5000 }
    ];

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token, navigate]);

    const getCategoryTrans = (apiName) => {
        if (!apiName) return "";
        const key = apiName.toLowerCase().replace(/ /g, "_");
        return t(`waste_categories.${key}`, { defaultValue: apiName });
    };

    const getUnitTrans = (unit) => {
        if (!unit) return "";
        return t(`units.${unit.toLowerCase()}`, { defaultValue: unit });
    };

    const getTierIndex = (score) => {
        let index = 0;
        for (let i = 0; i < TIERS.length; i++) {
            if (score >= TIERS[i].min) {
                index = i;
            }
        }
        return index;
    };

    const fetchStreakStats = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${apiUrl}/v1/waste/user/stats/?period=daily`, { headers });
            return res.data.data || [];
        } catch (error) {
            console.error("Error fetching streak stats", error);
            return [];
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [logsRes, subCategoriesRes, categoriesRes, scoreRes, streakRes] = await Promise.all([ 
                getWasteLogs(), 
                getSubCategories(),
                getWasteCategories(),
                getUserScore(),
                fetchStreakStats()
            ]);

            const logsData = logsRes.results || logsRes;
            const subCatsData = subCategoriesRes.results || subCategoriesRes;
            const catsData = categoriesRes.results || categoriesRes;

            setLogs(Array.isArray(logsData) ? logsData : []);
            setSubCategories(Array.isArray(subCatsData) ? subCatsData : []);
            setCategories(Array.isArray(catsData) ? catsData : []);
            
            setCurrentTotalScore(scoreRes.total_score || 0);
            setCurrentStreakStats(streakRes || []);

        } catch (err) {
            console.error("Error fetching waste data:", err);
            setError('waste_log_page.error_fetch_failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.id] = cat.name;
    });

    const groupedSubCategories = subCategories.reduce((acc, sc) => {
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

    const getEarnedBadgesList = (logsData, scoreData, streakData) => {
        // ... Mevcut kodunuzdaki badge listesi aynı kalacak ...
        const badgesDef = [
             { id: 'first_step', earned: logsData.length > 0, icon: '🎖' },
             { id: 'plastic_buster', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('plastic')).reduce((acc, curr) => acc + parseFloat(curr.quantity), 0) >= 10, icon: '🥤' },
             { id: 'sustainability_streak', earned: streakData.length >= 14, icon: '🔥' },
             { id: 'zero_waste_legend', earned: scoreData >= 5000, icon: '🌍' },
             { id: 'eco_warrior', earned: logsData.length >= 50, icon: '⚔️' },
             { id: 'tree_hugger', earned: scoreData >= 1000, icon: '🌿' },
             { id: 'recycling_master', earned: logsData.filter(l => l.disposal_location?.toLowerCase().includes('recycled') || l.disposal_location?.toLowerCase().includes('recycling')).length >= 30, icon: '♻️' },
             { id: 'compost_champion', earned: logsData.filter(l => l.disposal_location?.toLowerCase().includes('compost')).length >= 20, icon: '🌱' },
             { id: 'milestone_100', earned: logsData.length >= 100, icon: '💯' },
             { id: 'score_1500', earned: scoreData >= 1500, icon: '🏆' },
             { id: 'consistency_king', earned: streakData.length >= 30, icon: '👑' },
             { id: 'metal_maven', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('metal')).length >= 15, icon: '🔧' },
             { id: 'paper_pride', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('paper')).length >= 25, icon: '📄' },
             { id: 'glass_guru', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('glass')).length >= 10, icon: '🥃' },
             { id: 'eco_score_500', earned: scoreData >= 500, icon: '⭐' },
             { id: 'score_2000', earned: scoreData >= 2000, icon: '🥇' },
             { id: 'score_3000', earned: scoreData >= 3000, icon: '🥈' },
             { id: 'logs_200', earned: logsData.length >= 200, icon: '📋' },
             { id: 'logs_500', earned: logsData.length >= 500, icon: '🎯' },
             { id: 'streak_60', earned: streakData.length >= 60, icon: '🚀' },
             { id: 'plastic_50', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('plastic')).reduce((acc, curr) => acc + parseFloat(curr.quantity), 0) >= 50, icon: '💪' },
             { id: 'organic_50', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('organic') || l.sub_category_name?.toLowerCase().includes('food')).length >= 50, icon: '🍃' },
             { id: 'electronic_20', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('electronic') || l.sub_category_name?.toLowerCase().includes('e-waste')).length >= 20, icon: '🔌' },
             { id: 'textile_30', earned: logsData.filter(l => l.sub_category_name?.toLowerCase().includes('textile') || l.sub_category_name?.toLowerCase().includes('cloth')).length >= 30, icon: '👕' },
             { id: 'donate_50', earned: logsData.filter(l => l.disposal_location?.toLowerCase().includes('donated') || l.disposal_location?.toLowerCase().includes('reused')).length >= 50, icon: '🎁' },
             { id: 'landfill_zero', earned: logsData.filter(l => l.disposal_location?.toLowerCase().includes('landfill')).length === 0 && logsData.length > 0, icon: '✨' },
             { id: 'streak_7', earned: streakData.length >= 7, icon: '📅' },
             { id: 'streak_21', earned: streakData.length >= 21, icon: '🎖️' }
        ];
        return badgesDef;
    };

    const checkMilestones = (oldScore, newScore, oldLogs, newLogs, oldStreak, newStreak) => {
        // 1. Ağaç Kontrolü
        const oldTrees = Math.floor(oldScore / 500);
        const newTrees = Math.floor(newScore / 500);
        
        if (newTrees > oldTrees) {
            addNotification(`🌲 ${t('stats_page.new_tree_planted')} - ${t('stats_page.new_tree_desc')}`, 'success');
        }

        // 2. Seviye Kontrolü (DÜZELTİLDİ)
        const oldTierIdx = getTierIndex(oldScore);
        const newTierIdx = getTierIndex(newScore);

        if (newTierIdx > oldTierIdx) {
            const tierKey = TIERS[newTierIdx].id;
            // 'tiers.eco_explorer' gibi anahtarları çevirir
            const newTierName = t(`tiers.${tierKey}`);
            
            addNotification(`🆙 ${t('stats_page.level_up')} - ${t('stats_page.level_up_desc', { rank: newTierName })}`, 'info');
        }

        // 3. Rozet Kontrolü
        const oldBadges = getEarnedBadgesList(oldLogs, oldScore, oldStreak);
        const newBadges = getEarnedBadgesList(newLogs, newScore, newStreak);

        newBadges.forEach(newBadge => {
            if (newBadge.earned) {
                const wasEarnedBefore = oldBadges.find(old => old.id === newBadge.id)?.earned;
                if (!wasEarnedBefore) {
                    const badgeName = t(`badges_data.${newBadge.id}.name`);
                    const badgeDesc = t(`badges_data.${newBadge.id}.desc`);

                    addNotification(`${newBadge.icon} ${t('badges_page.badge_unlocked')}: ${badgeName} - ${badgeDesc}`, 'success');
                }
            }
        });
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
            
            const oldLogs = [...logs];
            const oldScore = currentTotalScore;
            const oldStreak = [...currentStreakStats];

            await addWasteLog(payload);
            
            const [newLogsRes, newScoreRes, newStreakRes] = await Promise.all([
                getWasteLogs(),
                getUserScore(),
                fetchStreakStats()
            ]);

            const newLogs = Array.isArray(newLogsRes.results) ? newLogsRes.results : (Array.isArray(newLogsRes) ? newLogsRes : []);
            const newTotalScore = newScoreRes.total_score || 0;
            const newStreak = newStreakRes || [];

            checkMilestones(oldScore, newTotalScore, oldLogs, newLogs, oldStreak, newStreak);

            setLogs(newLogs);
            setCurrentTotalScore(newTotalScore);
            setCurrentStreakStats(newStreak);
            
            addNotification(`✅ ${t('waste_log_page.log_added_success')}`, 'success');
            
            setForm({ subcategory: '', quantity: '', disposal_method: '', notes: '' });

        } catch (err) {
            setError('waste_log_page.error_add_log_failed');
            console.error('Error adding log:', err.response?.data || err.message);
            addNotification(`⚠️ ${t('waste_log_page.error_add_log_failed')}`, 'error');
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="wastelog-page-scoped wastelog-page-layout">
            <Navbar isAuthenticated={true} />
            {/* Notification Container */}
            <div className="notification-container" style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {notifications.map(notif => (
                    <div 
                        key={notif.id} 
                        className={`notification notification-${notif.type}`}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '8px',
                            backgroundColor: notif.type === 'error' ? '#fee2e2' : notif.type === 'info' ? '#dbeafe' : '#dcfce7',
                            color: notif.type === 'error' ? '#991b1b' : notif.type === 'info' ? '#1e40af' : '#166534',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            maxWidth: '350px',
                            animation: 'slideIn 0.3s ease'
                        }}
                    >
                        {notif.message}
                    </div>
                ))}
            </div>
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

                    <section className="wastelog-list-card">
                        <h3 className="list-card-title"><Icon name="list"/> {t('waste_log_page.log_list.title')}</h3>
                        {loading && !loadingSubmit && <p className="loading-text">{t('waste_log_page.log_list.loading')}</p>}
                        {!loading && logs.length === 0 && <p className="no-logs-message">{t('waste_log_page.log_list.no_logs')}</p>}
                        
                        {!loading && logs.length > 0 && (
                            <ul className="wastelog-items-list">
                                {logs.slice(0, 10).map((log) => {
                                    const subCategoryDetails = subCategories.find(sc => sc.id === log.sub_category);
                                    let categoryNameForIcon = 'category';
                                    if (subCategoryDetails) {
                                        const catID = subCategoryDetails.category;
                                        categoryNameForIcon = categoryMap[catID] || 'category';
                                    }
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