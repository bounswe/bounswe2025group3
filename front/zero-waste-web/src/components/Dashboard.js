import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWasteLogs, logout } from '../redux/wasteSlice';
import Tips from './Tips';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, wasteLogs, status, error } = useSelector((state) => state.waste);

  useEffect(() => {
    if (user) {
      dispatch(fetchWasteLogs());
    } else {
      navigate('/login');
    }
  }, [user, dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!user) return null;

  return (
    <div>
      <nav>
        <h1>Zero Waste Challenge</h1>
        <div>
          <Link to="/dashboard">Dashboard</Link> | 
          <Link to="/profile">Profile</Link> | 
          <Link to="/waste-logs">Log Waste</Link> | 
          <Link to="/challenges">Challenges</Link> | 
          <Link to="/leaderboard">Leaderboard</Link> | 
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <section>
        <h2>Welcome, {user.email || 'User'}!</h2>
        {status === 'loading' && <p>Loading waste logs...</p>}
        {error && <p className="error">{error.error || JSON.stringify(error)}</p>}
        <div>
          <div>
            <h3>Quick Stats</h3>
            <p>Total Waste Logged: {wasteLogs.length} entries</p>
            <p>Active Challenges: 0</p>
            <p>Leaderboard Rank: N/A</p>
            <p>Goal Progress: 0%</p>
          </div>
          <div>
            <h3>Recent Activity</h3>
            {wasteLogs.length === 0 ? (
              <p>No waste logs yet.</p>
            ) : (
              <ul>
                {wasteLogs.slice(0, 3).map((log) => (
                  <li key={log.id}>
                    {log.waste_type}: {log.amount} kg on {log.date_logged}
                  </li>
                ))}
              </ul>
            )}
            <Link to="/waste-logs">
              <button>Log New Waste</button>
            </Link>
          </div>
        </div>
        <Tips />
      </section>
    </div>
  );
};

export default Dashboard;