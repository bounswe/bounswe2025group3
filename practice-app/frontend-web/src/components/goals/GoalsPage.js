import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import './GoalsPage.css';

// ----- Config -----
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

// ----- Icon util -----
const Icon = ({ name, className = '' }) => {
  const icons = {
    logo: '🌿', waste: '🗑️', leaderboard: '📊', challenges: '🏆', dashboard: '🏠', goal: '🎯', plus: '➕'
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const GoalsPage = () => {
  /* -------------------- state -------------------- */
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]); // <‑‑ fetched from backend
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [creating, setCreating] = useState(false);
  const [newGoal, setNewGoal] = useState({
    category_id: '', goal_type: 'reduction', timeframe: 'daily', target: '', start_date: '', end_date: ''
  });

  const token = localStorage.getItem('access_token');

  /* -------------------- helpers -------------------- */
  const authHeader = { Authorization: `Bearer ${token}` };

  /* -------------------- fetch on mount -------------------- */
  useEffect(() => {
    if (!token) { setError('You must be logged in.'); setLoading(false); return; }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [goalRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/goals/goals/`, { headers: authHeader }),
          axios.get(`${API_URL}/api/v1/waste/categories/`, { headers: authHeader }) // path reused from WasteLog
        ]);
        const goalList = Array.isArray(goalRes.data) ? goalRes.data : goalRes.data.results ?? [];
        const catList  = Array.isArray(catRes.data)  ? catRes.data  : catRes.data.results  ?? [];
        setGoals(goalList);
        setCategories(catList);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load goals or categories.');
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []); // eslint‑disable‑line

  /* -------------------- form handlers -------------------- */
  const handleFieldChange = (e) => setNewGoal({ ...newGoal, [e.target.name]: e.target.value });

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.category_id || !newGoal.target) { setError('Category and target are required.'); return; }
    setCreating(true);
    try {
      const user = Number(localStorage.getItem('user_id'));
      const payload = {
        user,
        category_id: Number(newGoal.category_id),
        goal_type: newGoal.goal_type,
        timeframe: newGoal.timeframe,
        target: Number(newGoal.target),
        ...(newGoal.start_date && { start_date: newGoal.start_date }),
        ...(newGoal.end_date   && { end_date:   newGoal.end_date   })
      };
      await axios.post(`${API_URL}/api/v1/goals/goals/`, payload, { headers: authHeader });
      // refresh list
      const fresh = await axios.get(`${API_URL}/api/v1/goals/goals/`, { headers: authHeader });
      setGoals(Array.isArray(fresh.data) ? fresh.data : fresh.data.results ?? []);
      setNewGoal({ category_id: '', goal_type: 'reduction', timeframe: 'daily', target: '', start_date: '', end_date: '' });
      setError('');
    } catch (err) {
      const apiMsg = err?.response?.data ? JSON.stringify(err.response.data) : 'Bad request';
      setError(`Unable to create goal: ${apiMsg}`);
    } finally { setCreating(false); }
  };

  /* -------------------- render -------------------- */
  return (
    <div className="goals-page-layout">
      {/* nav */}
      <header className="dashboard-top-nav">
        <Link to="/" className="app-logo"><Icon name="logo"/> Greener</Link>
        <nav className="main-actions-nav">
          <NavLink to="/dashboard"   className={({isActive})=>`nav-action-item ${isActive?'active':''}`}> <Icon name="dashboard"/> Dashboard </NavLink>
          <NavLink to="/waste"       className={({isActive})=>`nav-action-item ${isActive?'active':''}`}> <Icon name="waste"/> Waste Log </NavLink>
          <NavLink to="/goals"       className={({isActive})=>`nav-action-item ${isActive?'active':''}`}> <Icon name="goal"/> Goals </NavLink>
          <NavLink to="/leaderboard" className={({isActive})=>`nav-action-item ${isActive?'active':''}`}> <Icon name="leaderboard"/> Leaderboard </NavLink>
          <NavLink to="/challenges"  className={({isActive})=>`nav-action-item ${isActive?'active':''}`}> <Icon name="challenges"/> Challenges </NavLink>
        </nav>
      </header>

      <main className="goals-main-content">
        <div className="goals-header-section">
          <h1><Icon name="goal"/> Your Goals</h1>
          <p>Set targets and watch your progress.</p>
        </div>

        {/* form */}
        <div className="goal-form-card" style={{marginBottom:'2rem',padding:'1.5rem'}}>
          <h2 style={{marginBottom:'1rem',fontSize:'1.25rem'}}><Icon name="plus"/> Add a New Goal</h2>
          {categories.length === 0 && <p style={{color:'var(--text-medium)'}}>No waste categories available – cannot create goals.</p>}
          <form onSubmit={handleAddGoal} className="goal-form">
            <select name="category_id" value={newGoal.category_id} onChange={handleFieldChange} required disabled={creating||categories.length===0}>
              <option value="">Select Category…</option>
              {categories.map(c=> <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>)}
            </select>
            <select name="goal_type" value={newGoal.goal_type} onChange={handleFieldChange} required disabled={creating}>
              <option value="reduction">Reduction</option>
              <option value="increase">Increase</option>
            </select>
            <select name="timeframe" value={newGoal.timeframe} onChange={handleFieldChange} required disabled={creating}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input type="number" name="target" placeholder="Target units" value={newGoal.target} onChange={handleFieldChange} required disabled={creating}/>
            <input type="date" name="start_date" value={newGoal.start_date} onChange={handleFieldChange} disabled={creating}/>
            <input type="date" name="end_date"   value={newGoal.end_date}   onChange={handleFieldChange} disabled={creating}/>
            <button type="submit" disabled={creating||categories.length===0} style={{gridColumn:'span 2'}}>
              {creating?'Saving…':'Create Goal'}
            </button>
          </form>
        </div>

        {/* status */}
        {loading && <div className="loader-container-main"><div className="loader-spinner-main"/> <p>Loading…</p></div>}
        {error && !loading && <div className="error-message-box-main">{error}</div>}

        {/* list */}
        {!loading && !error && goals.length>0 && (
          <div className="goals-table-wrapper">
            <table className="goals-table">
              <thead><tr><th>Category</th><th>Timeframe</th><th>Target</th><th>Progress</th></tr></thead>
              <tbody>
                {goals.map(g=>{
                  const cat = categories.find(c=>c.id===g.category_id) || g.category;
                  const target = g.target ?? g.target_amount;
                  return (
                    <tr key={g.id}>
                      <td>{cat?.name ?? cat}</td>
                      <td>{g.timeframe}</td>
                      <td>{target} units</td>
                      <td>{g.progress} / {target} ({target?Math.round(((g.progress||0)/target)*100):0}%)</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && goals.length===0 && (
          <div className="empty-goals-message"><Icon name="goal"/><p>No goals yet – add one above.</p></div>
        )}
      </main>
    </div>
  );
};

export default GoalsPage;
