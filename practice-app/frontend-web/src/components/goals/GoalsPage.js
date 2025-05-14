import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../leaderboard/LeaderboardPage.css'; // Reuse existing styles for simplicity

const Icon = ({ name, className = "" }) => {
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
  };
  return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const mockGoals = [
  {
    id: 1,
    category: 'Electronics',
    timeframe: 'Monthly',
    target: 50,
    progress: 25,
  },
  {
    id: 2,
    category: 'Plastic',
    timeframe: 'Weekly',
    target: 10,
    progress: 6,
  },
];

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    // TODO: Replace with API call
    setGoals(mockGoals);
  }, []);

  return (
    <div className="leaderboard-page-layout">
      <header className="dashboard-top-nav">
        <Link to="/" className="app-logo">
          <Icon name="logo" /> Greener
        </Link>
        <nav className="main-actions-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-action-item ${isActive ? "active" : ""}`}>
            <Icon name="dashboard" /> Dashboard
          </NavLink>
          <NavLink to="/waste" className={({ isActive }) => `nav-action-item ${isActive ? "active" : ""}`}>
            <Icon name="waste" /> Waste Log
          </NavLink>
          <NavLink to="/goals" className={({ isActive }) => `nav-action-item ${isActive ? "active" : ""}`}>
            <Icon name="goal" /> Goals
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-action-item ${isActive ? "active" : ""}`}>
            <Icon name="leaderboard" /> Leaderboard
          </NavLink>
        </nav>
      </header>

      <main className="leaderboard-main-content">
        <div className="leaderboard-header-section">
          <h1><Icon name="goal" /> Your Goals</h1>
          <p>Track your sustainability targets and monitor your progress over time.</p>
        </div>

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
              {goals.map(goal => (
                <tr key={goal.id}>
                  <td>{goal.category}</td>
                  <td>{goal.timeframe}</td>
                  <td>{goal.target} units</td>
                  <td>{goal.progress} / {goal.target} ({Math.round((goal.progress / goal.target) * 100)}%)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {goals.length === 0 && (
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
