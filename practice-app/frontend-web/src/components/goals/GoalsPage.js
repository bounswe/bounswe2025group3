import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import axios from 'axios';
import Navbar from '../common/Navbar'; // 2. Import shared Navbar
import './GoalsPage.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Icon = ({ name, className = '' }) => {
  const icons = {
    goal: '🎯', plus: '➕'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const GoalsPage = () => {
  const { t } = useTranslation(); // 3. Initialize hook
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Will store keys or plain strings
  const [creating, setCreating] = useState(false);
  const [newGoal, setNewGoal] = useState({ category_id: '', timeframe: 'daily', target: '' });

  const token = localStorage.getItem('access_token');
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { setError('You must be logged in.'); setLoading(false); return; }
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [goalRes, catRes] = await Promise.all([
          axios.get(`${apiUrl}/api/v1/goals/goals/`, { headers: authHeader }),
          axios.get(`${apiUrl}/api/v1/waste/subcategories/`, { headers: authHeader })
        ]);
        setGoals(Array.isArray(goalRes.data) ? goalRes.data : goalRes.data.results ?? []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results ?? []);
        setError('');
      } catch (err) {
        setError('goals_page.error_load_failed'); // Set key
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []); // eslint-disable-line

  const handleFieldChange = (e) => setNewGoal({ ...newGoal, [e.target.name]: e.target.value });

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.category_id || !newGoal.target) {
      setError('goals_page.error_form_required'); // Set key
      return;
    }
    setCreating(true);
    // ... (rest of add goal logic remains the same, but uses translated errors) ...
    try {
        const user = Number(localStorage.getItem('user_id'));
        const payload = {
        user,
        category_id: Number(newGoal.category_id),
        timeframe: newGoal.timeframe,
        target: Number(newGoal.target)
        }; 
        await axios.post(`${apiUrl}/api/v1/goals/goals/`, payload, { headers: authHeader });
        const fresh = await axios.get(`${apiUrl}/api/v1/goals/goals/`, { headers: authHeader });
        setGoals(Array.isArray(fresh.data) ? fresh.data : fresh.data.results ?? []);
        setNewGoal({ category_id: '', timeframe: 'daily', target: '' });
        setError('');
    } catch (err) {
        const apiMsg = err?.response?.data ? JSON.stringify(err.response.data) : 'Bad request';
        setError(t('goals_page.error_create_failed', { apiMsg })); // Translate with dynamic data
    } finally { setCreating(false); }
  };

  return (
    <div className="goals-page-scoped goals-page-layout">
      {/* 4. Use the shared Navbar component */}
      <Navbar isAuthenticated={true} />

      <main className="goals-main-content">
        {/* 5. Replace all static text with the t() function */}
        <div className="goals-header-section">
          <h1><Icon name="goal" /> {t('goals_page.title')}</h1>
          <p>{t('goals_page.subtitle')}</p>
        </div>

        <div className="goal-form-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}><Icon name="plus" /> {t('goals_page.form_title')}</h2>
          {categories.length === 0 && <p style={{ color: 'var(--text-medium)' }}>{t('goals_page.error_no_categories')}</p>}
          <form onSubmit={handleAddGoal} className="goal-form">
            <select name="category_id" value={newGoal.category_id} onChange={handleFieldChange} required disabled={creating || categories.length === 0}>
              <option value="">{t('goals_page.form.select_category')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>)}
            </select>
            <select name="timeframe" value={newGoal.timeframe} onChange={handleFieldChange} required disabled={creating}>
              <option value="daily">{t('goals_page.form.timeframe_daily')}</option>
              <option value="weekly">{t('goals_page.form.timeframe_weekly')}</option>
              <option value="monthly">{t('goals_page.form.timeframe_monthly')}</option>
            </select>
            <input type="number" name="target" placeholder={t('goals_page.form.placeholder_target')} value={newGoal.target} onChange={handleFieldChange} required disabled={creating} />
            <button type="submit" disabled={creating || categories.length === 0} style={{ gridColumn: 'span 2' }}>
              {creating ? t('goals_page.form.button_saving') : t('goals_page.form.button_create')}
            </button>
          </form>
        </div>

        {loading && <div className="loader-container-main"><div className="loader-spinner-main" /> <p>{t('goals_page.loading')}</p></div>}
        {error && !loading && <div className="error-message-box-main">{t(error)}</div>} {/* Translate key here */}

        {!loading && !error && goals.length > 0 && (
          <div className="goals-table-wrapper">
            <table className="goals-table">
              <thead>
                <tr>
                  <th>{t('goals_page.table.header_category')}</th>
                  <th>{t('goals_page.table.header_timeframe')}</th>
                  <th>{t('goals_page.table.header_target')}</th>
                  <th>{t('goals_page.table.header_progress')}</th>
                </tr>
              </thead>
              <tbody>
                {goals.map(g => {
                  const cat = categories.find(c => c.id === g.category_id) || g.category;
                  const target = g.target ?? g.target_amount;
                  return (
                    <tr key={g.id}>
                      <td>{cat?.name ?? cat}</td>
                      <td>{g.timeframe}</td>
                      <td>{target} {t('goals_page.table.unit')}</td>
                      <td>{g.progress} / {target} ({target ? Math.round(((g.progress || 0) / target) * 100) : 0}%)</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && goals.length === 0 && (
          <div className="empty-goals-message"><Icon name="goal" /><p>{t('goals_page.no_goals_message')}</p></div>
        )}
      </main>
    </div>
  );
};

export default GoalsPage;