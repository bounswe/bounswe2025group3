import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Navbar from '../common/Navbar';
import './PersonalStats.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const Icon = ({ name, className = "" }) => {
    const icons = {
        stats: '📈', rank: '🏅', score: '🌟', events: '📅',
        tree: '🌲', seed: '🌱', badge: '🎖️', loading: '⏳', alerts: '⚠️'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const PersonalStats = () => {

  const { i18n } = useTranslation(); 
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [scoreData, setScoreData] = useState({ total_score: 0 });
  
  const [timeframe, setTimeframe] = useState('daily');
  
  const [statsData, setStatsData] = useState([]); 
  const [categoryStats, setCategoryStats] = useState([]);
  const [badges, setBadges] = useState([]);
  const [eventStats, setEventStats] = useState({ participating: 0, total: 0, rate: 0 });
  const [leaderboardRank, setLeaderboardRank] = useState('N/A');

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInitialData();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (token) {
        fetchChartData(timeframe);
    }
    // eslint-disable-next-line
  }, [timeframe, token]);

  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        profileRes, 
        scoreRes, 
        logsRes,
        eventsRes,
        leaderboardRes
      ] = await Promise.all([
        axios.get(`${apiUrl}/api/user/me/`, { headers }),
        axios.get(`${apiUrl}/api/v1/waste/scores/me/`, { headers }),
        axios.get(`${apiUrl}/api/v1/waste/logs/`, { headers }),
        axios.get(`${apiUrl}/api/v1/events/events/`, { headers }),
        axios.get(`${apiUrl}/api/v1/waste/leaderboard/`, { headers })
      ]);

      setProfile(profileRes.data);
      setScoreData(scoreRes.data);
      
      processCategoryPie(logsRes.data.results || []);
      
      const streakRes = await axios.get(`${apiUrl}/api/v1/waste/user/stats/?period=daily`, { headers });
      calculateBadges(logsRes.data.results || [], scoreRes.data.total_score, streakRes.data.data || []);

      calculateEventStats(eventsRes.data.results || []);
      calculateRank(leaderboardRes.data || [], userId);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching initial stats:", err);
      setError("Failed to load profile data.");
      setLoading(false);
    }
  };

  const fetchChartData = async (selectedPeriod) => {
    setChartLoading(true);
    try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${apiUrl}/api/v1/waste/user/stats/`, { 
            params: { period: selectedPeriod },
            headers 
        });
        
        processChartData(response.data.data || []);
    } catch (err) {
        console.error("Error fetching chart data:", err);
        setStatsData([]);
    } finally {
        setChartLoading(false);
    }
  };

  const getTierInfo = (score) => {
    if (score >= 5000) return { name: 'Planet Guardian', color: '#8e44ad', icon: '🌎' };
    if (score >= 2500) return { name: 'Zero Waste Champion', color: '#f1c40f', icon: '🌟' };
    if (score >= 1000) return { name: 'Sustainability Hero', color: '#e67e22', icon: '🌿' };
    if (score >= 500) return { name: 'Eco Advocate', color: '#3498db', icon: '🌍' };
    if (score >= 100) return { name: 'Green Starter', color: '#2ecc71', icon: '🍃' };
    return { name: 'Eco Explorer', color: '#95a5a6', icon: '🌱' };
  };

  const processChartData = (data) => {
    const formatted = data.map(item => ({
      date: new Date(item.start_date).toLocaleDateString(i18n.language, { 
          weekday: timeframe === 'daily' ? 'short' : undefined, 
          day: 'numeric', 
          month: 'short',
          year: timeframe === 'yearly' ? 'numeric' : undefined
      }),
      Score: item.total_score,
      Logs: item.total_log
    })).reverse(); 
    setStatsData(formatted);
  };

  const processCategoryPie = (logs) => {
    const categoryMap = {};
    logs.forEach(log => {
      const catName = log.sub_category_name || 'Other';
      if (!categoryMap[catName]) categoryMap[catName] = 0;
      categoryMap[catName] += parseFloat(log.quantity);
    });
    const data = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key]
    }));
    setCategoryStats(data);
  };

  const calculateBadges = (logs, score, dailyStats) => {
    const earned = [];
    if (logs.length > 0) earned.push({ name: 'First Step', icon: '🎖', desc: 'Log first waste' });
    const plasticTotal = logs.filter(l => l.sub_category_name?.toLowerCase().includes('plastic'))
                             .reduce((acc, curr) => acc + parseFloat(curr.quantity), 0);
    if (plasticTotal >= 10) earned.push({ name: 'Plastic Buster', icon: '🥤', desc: 'Reduce 10kg plastic' });
    if (dailyStats.length >= 7) earned.push({ name: 'Sustainability Streak', icon: '🔥', desc: '7 Days Streak' });
    if (score >= 5000) earned.push({ name: 'Zero Waste Legend', icon: '🌍', desc: '5000+ Score' });
    setBadges(earned);
  };

  const calculateEventStats = (eventsList) => {
    const participating = eventsList.filter(e => String(e.i_am_participating) === 'true' || e.i_am_participating === true).length;
    const total = eventsList.length;
    const rate = total > 0 ? Math.round((participating / total) * 100) : 0;
    setEventStats({ participating, total, rate });
  };

  const calculateRank = (leaderboard, myId) => {
    const rank = leaderboard.findIndex(u => String(u.id) === String(myId)) + 1;
    setLeaderboardRank(rank > 0 ? `#${rank}` : 'N/A');
  };

  const treeCount = Math.floor(scoreData.total_score / 500); 
  const tier = getTierInfo(scoreData.total_score);

  return (
    <div className="personal-stats-page-scoped personal-stats-layout">
      <Navbar isAuthenticated={true} />
      
      <main className="stats-main-content">
        {loading && (
            <div className="loader-container-main">
                <div className="loader-spinner-main"></div>
                <p>Loading statistics...</p>
            </div>
        )}

        {error && !loading && (
            <div className="error-message-box-main">
                 <Icon name="alerts" className="error-icon" /> {error}
            </div>
        )}

        {!loading && !error && (
          <>
            <section className="stats-hero-section">
              <div className="hero-welcome">
                <h1>Overview for {profile?.username}</h1>
                <span className="tier-badge" style={{ backgroundColor: tier.color }}>
                  {tier.icon} {tier.name}
                </span>
              </div>
              
              <div className="hero-metrics-grid">
                <div className="metric-card">
                  <h3><Icon name="score" /> Eco Score</h3>
                  <div className="value">{Math.round(scoreData.total_score)}</div>
                </div>
                <div className="metric-card">
                  <h3><Icon name="rank" /> Global Rank</h3>
                  <div className="value">{leaderboardRank}</div>
                </div>
                <div className="metric-card">
                  <h3><Icon name="events" /> Event Rate</h3>
                  <div className="value">{eventStats.rate}%</div>
                  <small>{eventStats.participating} / {eventStats.total} joined</small>
                </div>
              </div>
            </section>

            <div className="stats-grid-layout">
              
              {/* --- Chart 1: Activity Trend with Filters --- */}
              <div className="stats-card wide">
                <div className="chart-header">
                    <h2>Activity Trend</h2>
                    <div className="stats-filter-group">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                            <button 
                                key={p}
                                className={`filter-btn ${timeframe === p ? 'active' : ''}`}
                                onClick={() => setTimeframe(p)}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-container">
                  {chartLoading ? (
                      <div className="chart-loader">
                          <Icon name="loading" /> Updating...
                      </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--background-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Legend />
                        <Bar dataKey="Score" fill="var(--nav-dashboard-logo-color)" name="Points" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Logs" fill="var(--accent-navbar)" name="Items" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* --- Chart 2: Pie Chart --- */}
              <div className="stats-card">
                <h2>Impact Breakdown</h2>
                <div className="chart-container">
                  {categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state-chart">
                        <Icon name="loading" />
                        <p>Log waste to see breakdown.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- Badges --- */}
              <div className="stats-card wide">
                <h2>Your Trophy Case</h2>
                <div className="badges-grid">
                  {badges.length > 0 ? (
                    badges.map((badge, index) => (
                      <div key={index} className="badge-item">
                        <div className="badge-icon">{badge.icon}</div>
                        <span className="badge-name">{badge.name}</span>
                        <span className="badge-desc">{badge.desc}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-badges">
                        <p>Start logging to earn badges!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- Eco Forest --- */}
              <div className="stats-card forest-card">
                <div className="forest-header">
                    <h2>My Eco Forest</h2>
                    <span className="forest-info">1 Tree = 500 Points</span>
                </div>
                <div className="forest-visual">
                  {treeCount > 0 ? (
                    Array.from({ length: treeCount }).map((_, i) => (
                      <span key={i} className="tree-icon" title="Virtual Tree">🌲</span>
                    ))
                  ) : (
                    <div className="empty-forest">
                      <Icon name="seed" className="seed-icon"/>
                      <p>Your forest is waiting to grow.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PersonalStats;