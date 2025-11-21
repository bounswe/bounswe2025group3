import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import './PersonalStats.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const Icon = ({ name, className = "" }) => {
    const icons = {
        stats: '📈', rank: '🏅', score: '🌟', events: '📅',
        tree: '🌲', seed: '🌱', badge: '🎖️', loading: '⏳', alerts: '⚠️'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

// Basit Bar Chart Component
const SimpleBarChart = ({ data, t }) => {
  if (!data || data.length === 0) {
    return <div className="empty-state-chart"><Icon name="loading" /><p>{t('stats_page.charts.no_data')}</p></div>;
  }

  const maxScore = Math.max(...data.map(d => d.Score), 1);
  const maxLogs = Math.max(...data.map(d => d.Logs), 1);
  const maxValue = Math.max(maxScore, maxLogs);

  return (
    <div className="simple-chart">
      <div className="chart-legend">
        <span><span className="legend-box" style={{backgroundColor: '#4CAF50'}}></span> {t('stats_page.charts.points')}</span>
        <span><span className="legend-box" style={{backgroundColor: '#2196F3'}}></span> {t('stats_page.charts.items')}</span>
      </div>
      <div className="bar-chart-container">
        {data.map((item, idx) => (
          <div key={idx} className="bar-group">
            <div className="bar-pair">
              <div 
                className="bar bar-score" 
                style={{ height: `${(item.Score / maxValue) * 200}px` }}
                title={`${t('stats_page.charts.points')}: ${item.Score}`}
              >
                <span className="bar-value">{item.Score}</span>
              </div>
              <div 
                className="bar bar-logs" 
                style={{ height: `${(item.Logs / maxValue) * 200}px` }}
                title={`${t('stats_page.charts.items')}: ${item.Logs}`}
              >
                <span className="bar-value">{item.Logs}</span>
              </div>
            </div>
            <div className="bar-label">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Basit Pie Chart Component
const SimplePieChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="simple-pie-container">
      <svg viewBox="0 0 200 200" className="pie-chart-svg">
        {data.map((item, idx) => {
          const percentage = item.value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          currentAngle += angle;

          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (currentAngle - 90) * Math.PI / 180;
          
          const x1 = 100 + 80 * Math.cos(startRad);
          const y1 = 100 + 80 * Math.sin(startRad);
          const x2 = 100 + 80 * Math.cos(endRad);
          const y2 = 100 + 80 * Math.sin(endRad);
          
          const largeArc = angle > 180 ? 1 : 0;
          const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <g key={idx}>
              <path
                d={pathData}
                fill={COLORS[idx % COLORS.length]}
                stroke="#fff"
                strokeWidth="2"
              />
            </g>
          );
        })}
        <circle cx="100" cy="100" r="50" fill="var(--background-primary)" />
      </svg>
      <div className="pie-legend">
        {data.map((item, idx) => (
          <div key={idx} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
            <span>{item.name}: {Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PersonalStats = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [scoreData, setScoreData] = useState({ total_score: 0 });
  const [timeframe, setTimeframe] = useState('daily');
  const [leaderboardRank, setLeaderboardRank] = useState('N/A');
  const [eventStats, setEventStats] = useState({ participating: 0, total: 0, rate: 0 });

  const [rawLogs, setRawLogs] = useState([]);
  const [rawChartData, setRawChartData] = useState([]);
  const [rawStreakStats, setRawStreakStats] = useState([]);

  const [statsData, setStatsData] = useState([]); 
  const [categoryStats, setCategoryStats] = useState([]);
  const [badges, setBadges] = useState([]);
  
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

  useEffect(() => {
      if (rawChartData.length > 0) processChartData(rawChartData);
      if (rawLogs.length > 0) processCategoryPie(rawLogs);
      if (rawLogs.length > 0 || rawStreakStats.length > 0) {
          calculateBadges(rawLogs, scoreData.total_score, rawStreakStats);
      }
      // eslint-disable-next-line
  }, [i18n.language, rawChartData, rawLogs, rawStreakStats, scoreData.total_score]);


  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        profileRes, 
        scoreRes, 
        dailyStatsRes,
        logsRes,
        eventsRes,
        leaderboardRes
      ] = await Promise.all([
        axios.get(`${apiUrl}/user/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/scores/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/user/stats/?period=daily`, { headers }),
        axios.get(`${apiUrl}/v1/waste/logs/`, { headers }),
        axios.get(`${apiUrl}/v1/events/events/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/leaderboard/`, { headers })
      ]);

      setProfile(profileRes.data);
      setScoreData(scoreRes.data);
      setRawLogs(logsRes.data.results || []);
      setRawStreakStats(dailyStatsRes.data.data || []);
      setRawChartData(dailyStatsRes.data.data || []);

      calculateEventStats(eventsRes.data.results || []);
      calculateRank(leaderboardRes.data || [], userId);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching initial stats:", err);
      setError(t('stats_page.error_load'));
      setLoading(false);
    }
  };

  const fetchChartData = async (selectedPeriod) => {
    setChartLoading(true);
    try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${apiUrl}/v1/waste/user/stats/`, { 
            params: { period: selectedPeriod },
            headers 
        });
        
        setRawChartData(response.data.data || []);
    } catch (err) {
        console.error("Error fetching chart data:", err);
        setRawChartData([]);
    } finally {
        setChartLoading(false);
    }
  };

  const getCategoryTrans = (apiName) => {
      if (!apiName) return t('waste_categories.other');
      const key = apiName.toLowerCase().replace(/ /g, "_");
      return t(`waste_categories.${key}`, { defaultValue: apiName });
  };

  const getTierInfo = (score) => {
    if (score >= 5000) return { name: t('tiers.planet_guardian'), color: '#8e44ad', icon: '🌎' };
    if (score >= 2500) return { name: t('tiers.zero_waste_champion'), color: '#f1c40f', icon: '🌟' };
    if (score >= 1000) return { name: t('tiers.sustainability_hero'), color: '#e67e22', icon: '🌿' };
    if (score >= 500) return { name: t('tiers.eco_advocate'), color: '#3498db', icon: '🌍' };
    if (score >= 100) return { name: t('tiers.green_starter'), color: '#2ecc71', icon: '🍃' };
    return { name: t('tiers.eco_explorer'), color: '#95a5a6', icon: '🌱' };
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

  // Login kontrolü - token yoksa login'e yönlendir
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchInitialData();
    // eslint-disable-next-line
  }, [token, navigate]);


  

  const processCategoryPie = (logs) => {
    const categoryMap = {};
    logs.forEach(log => {
      const catName = log.sub_category_name || 'Other';
      if (!categoryMap[catName]) categoryMap[catName] = 0;
      categoryMap[catName] += parseFloat(log.quantity);
    });
    
    const data = Object.keys(categoryMap).map((key) => ({
      name: getCategoryTrans(key), 
      value: categoryMap[key]
    }));
    setCategoryStats(data);
  };

  const calculateBadges = (logs, score, dailyStats) => {
    const earned = [];
    
    if (logs.length > 0) {
        earned.push({ 
            name: t('badges_data.first_step.name'), 
            icon: '🎖', 
            desc: t('badges_data.first_step.desc') 
        });
    }
    const plasticTotal = logs.filter(l => l.sub_category_name?.toLowerCase().includes('plastic'))
                             .reduce((acc, curr) => acc + parseFloat(curr.quantity), 0);
    if (plasticTotal >= 10) {
        earned.push({ 
            name: t('badges_data.plastic_buster.name'), 
            icon: '🥤', 
            desc: t('badges_data.plastic_buster.desc') 
        });
    }
    if (dailyStats.length >= 7) {
        earned.push({ 
            name: t('badges_data.sustainability_streak.name'), 
            icon: '🔥', 
            desc: t('badges_data.sustainability_streak.desc') 
        });
    }
    if (score >= 5000) {
        earned.push({ 
            name: t('badges_data.zero_waste_legend.name'), 
            icon: '🌍', 
            desc: t('badges_data.zero_waste_legend.desc') 
        });
    }
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
                <p>{t('stats_page.loading')}</p>
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
                <h1>{t('stats_page.title', { username: profile?.username || 'User' })}</h1>
                <span className="tier-badge" style={{ backgroundColor: tier.color }}>
                  {tier.icon} {tier.name}
                </span>
              </div>
              
              <div className="hero-metrics-grid">
                <div className="metric-card">
                  <h3><Icon name="score" /> {t('stats_page.hero.eco_score')}</h3>
                  <div className="value">{Math.round(scoreData.total_score)}</div>
                </div>
                <div className="metric-card">
                  <h3><Icon name="rank" /> {t('stats_page.hero.global_rank')}</h3>
                  <div className="value">{leaderboardRank}</div>
                </div>
                <div className="metric-card">
                  <h3><Icon name="events" /> {t('stats_page.hero.event_rate')}</h3>
                  <div className="value">{eventStats.rate}%</div>
                  <small>{eventStats.participating} / {eventStats.total} {t('stats_page.hero.joined_subtext')}</small>
                </div>
              </div>
            </section>

            <div className="stats-grid-layout">
              
              <div className="stats-card wide">
                <div className="chart-header">
                    <h2>{t('stats_page.charts.activity_trend')}</h2>
                    <div className="stats-filter-group">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                            <button 
                                key={p}
                                className={`filter-btn ${timeframe === p ? 'active' : ''}`}
                                onClick={() => setTimeframe(p)}
                            >
                                {t(`stats_page.charts.filters.${p}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-container">
                  {chartLoading ? (
                      <div className="chart-loader">
                          <Icon name="loading" /> {t('stats_page.charts.updating')}
                      </div>
                  ) : (
                    <SimpleBarChart data={statsData} t={t} />
                  )}
                </div>
              </div>

              <div className="stats-card">
                <h2>{t('stats_page.charts.impact_breakdown')}</h2>
                <div className="chart-container">
                  {categoryStats.length > 0 ? (
                    <SimplePieChart data={categoryStats} />
                  ) : (
                    <div className="empty-state-chart">
                        <Icon name="loading" />
                        <p>{t('stats_page.charts.no_breakdown_data')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="stats-card wide">
                <h2>{t('stats_page.badges.title')}</h2>
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
                        <p>{t('stats_page.badges.empty')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="stats-card forest-card">
                <div className="forest-header">
                    <h2>{t('stats_page.forest.title')}</h2>
                    <span className="forest-info">{t('stats_page.forest.info')}</span>
                </div>
                <div className="forest-visual">
                  {treeCount > 0 ? (
                    Array.from({ length: treeCount }).map((_, i) => (
                      <span key={i} className="tree-icon" title="Virtual Tree">🌲</span>
                    ))
                  ) : (
                    <div className="empty-forest">
                      <Icon name="seed" className="seed-icon"/>
                      <p>{t('stats_page.forest.empty')}</p>
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