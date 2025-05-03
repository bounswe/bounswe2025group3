import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWasteLogs, createWasteLog, logout } from '../redux/wasteSlice';
import { useNavigate, Link } from 'react-router-dom';

const WasteLogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, wasteLogs, status, error } = useSelector((state) => state.waste);
  const [wasteType, setWasteType] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchWasteLogs());
    } else {
      navigate('/login');
    }
  }, [user, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createWasteLog({ waste_type: wasteType, amount: parseFloat(amount) }));
    setWasteType('');
    setAmount('');
  };

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
        <h2>Waste Logs</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Waste Type:</label>
            <input
              type="text"
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Amount (kg):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              step="0.01"
            />
          </div>
          <button type="submit" disabled={status === 'loading'}>
            Add Waste Log
          </button>
        </form>
        {status === 'loading' && <p>Loading...</p>}
        {error && <p className="error">{error.error || JSON.stringify(error)}</p>}
        <ul>
          {wasteLogs.length === 0 ? (
            <p>No waste logs yet.</p>
          ) : (
            wasteLogs.map((log) => (
              <li key={log.id}>
                {log.waste_type}: {log.amount} kg (Logged on {log.date_logged})
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

export default WasteLogList;