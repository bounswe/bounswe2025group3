import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import '../leaderboard/LeaderboardPage.css';

// ----- Config -----
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

// ----- Small util for emojis / icons -----
const Icon = ({ name, className = '' }) => {
  const icons = {
    logo: '🌿',
    waste: '🗑️',
    leaderboard: '📊',
    challenges: '🏆',
    profile: '👤',
    trophy: '🏆',
    star: '⭐',
    dashboard: '🏠',
    goal: '🎯',
    plus: '➕',
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

// ----- Main Component -----
const GoalsPage = () => {
  /* ------------------------------ state ------------------------------ */
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form state for new goal
  const [newGoal, setNewGoal] = useState({
    category_id: '',
    goal_type: 'reduction',
    timeframe: 'daily',
    target: '',
    start_date: '',
    end_date: '',
  });
  const [creating, setCreating] = useState(false);

  /* ------------------------- fetch existing goals ------------------------- */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to view your goals.');
      setLoading(false);
      return;
    }

    const fetchGoals = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/v1/goals/goals/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // DRF default pagination shape => {results: [...]} OR plain array
        const list = Array.isArray(res.data) ? res.data : res.data.results ?? [];
        setGoals(list);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load goals.');
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  /* --------------------------- create new goal --------------------------- */
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({ ...prev, [name]: value }));
  };

    const handleAddGoal = async (e) => {
    e.preventDefault();

    // --- simple client‑side validation ---
    if (!newGoal.category_id || !newGoal.target) {
      setError('Category and target are required.');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('access_token');

      // build payload dynamically → leave out empty fields so DRF doesn’t choke on "" dates
            const userId = Number(localStorage.getItem('user_id'));
      const payload = {
        user: userId,                // <- backend requires this field
        category_id: Number(newGoal.category_id),
        goal_type: newGoal.goal_type,
        timeframe: newGoal.timeframe,
        target: Number(newGoal.target),
      };
      if (newGoal.start_date) payload.start_date = newGoal.start_date;
      if (newGoal.end_date)   payload.end_date   = newGoal.end_date;

      await axios.post(`${API_URL}/api/v1/goals/goals/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // refresh list
      const refreshed = await axios.get(`${API_URL}/api/v1/goals/goals/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(refreshed.data) ? refreshed.data : refreshed.data.results ?? [];
      setGoals(list);

      // reset form
      setNewGoal({ category_id: '', goal_type: 'reduction', timeframe: 'daily', target: '', start_date: '', end_date: '' });
      setError('');
    } catch (err) {
      console.error(err);
      // Try to surface DRF validation details if available
      const apiMsg = err?.response?.data ? JSON.stringify(err.response.data) : 'Bad request';
      setError(`Unable to create goal: ${apiMsg}`);
    } finally {
      setCreating(false);
    }
  };

  /* ------------------------------ render ------------------------------ */
  return (
    <div className="leaderboard-page-layout">
      {/* ---------- top nav ---------- */}
      <header className="dashboard-top-nav">
        <Link to="/" className="app-logo">
          <Icon name="logo" /> Greener
        </Link>
        <nav className="main-actions-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
            <Icon name="dashboard" /> Dashboard
          </NavLink>
          <NavLink to="/waste" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
            <Icon name="waste" /> Waste Log
          </NavLink>
          <NavLink to="/goals" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
            <Icon name="goal" /> Goals
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-action-item ${isActive ? 'active' : ''}`}>
            <Icon name="leaderboard" /> Leaderboard
          </NavLink>
            <NavLink to="/challenges" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                <Icon name="challenges" /> Challenges
            </NavLink>
        </nav>
      </header>

      <main className="leaderboard-main-content">
        <div className="leaderboard-header-section">
          <h1>
            <Icon name="goal" /> Your Goals
          </h1>
          <p>Track your sustainability targets and monitor your progress over time.</p>
        </div>

        {/* ---------- Add‑Goal Form ---------- */}
        <div className="leaderboard-table-wrapper" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            <Icon name="plus" /> Add a New Goal
          </h2>
          <form onSubmit={handleAddGoal} className="goal-form" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
            <input
              type="number"
              name="category_id"
              placeholder="Category ID"
              value={newGoal.category_id}
              onChange={handleFieldChange}
              required
            />
            <select name="goal_type" value={newGoal.goal_type} onChange={handleFieldChange} required>
              <option value="reduction">Reduction</option>
              <option value="increase">Increase</option>
            </select>
            <select name="timeframe" value={newGoal.timeframe} onChange={handleFieldChange} required>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              type="number"
              name="target"
              placeholder="Target units"
              value={newGoal.target}
              onChange={handleFieldChange}
              required
            />
            <input type="date" name="start_date" value={newGoal.start_date} onChange={handleFieldChange} />
            <input type="date" name="end_date" value={newGoal.end_date} onChange={handleFieldChange} />
            <button type="submit" className="nav-action-item" disabled={creating} style={{ gridColumn: 'span 2' }}>
              {creating ? 'Saving…' : 'Create Goal'}
            </button>
          </form>
        </div>

        {/* ---------- status messages ---------- */}
        {loading && (
          <div className="loader-container-main">
            <div className="loader-spinner-main"></div>
            <p>Loading goals…</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-message-box-main">
            {error}
          </div>
        )}

        {/* ---------- Goals list ---------- */}
        {!loading && !error && goals.length > 0 && (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Timeframe</th>
                  <th>Target</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal) => (
                  <tr key={goal.id}>
                    <td>{goal.category?.name ?? goal.category ?? goal.category_id}</td>
                    <td>{goal.timeframe}</td>
                    <td>{goal.target ?? goal.target_amount} units</td>
                    <td>
                      {goal.progress} / {(goal.target ?? goal.target_amount) || 1}{' '}
                      ({(goal.target ?? goal.target_amount)
                        ? Math.round(((goal.progress || 0) / (goal.target ?? goal.target_amount)) * 100)
                        : 0}
                      %)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && goals.length === 0 && (
          <div className="empty-leaderboard-message">
            <Icon name="goal" />
            <p>No goals found. Start by creating your first sustainability target!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GoalsPage;
