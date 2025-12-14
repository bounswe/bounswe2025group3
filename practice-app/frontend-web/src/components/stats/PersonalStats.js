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

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', 
  '#FF4560', '#2ecc71', '#3498db', '#9b59b6', '#34495e'
];

const Icon = ({ name, className = "" }) => {
    const icons = {
        stats: '📈', rank: '🏅', score: '🌟', events: '📅',
        tree: '🌲', seed: '🌱', badge: '🎖️', loading: '⏳', alerts: '⚠️',
        next: '➡️', filter: '🔍'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('tr-TR').format(num); // TR formatı (nokta ile ayrım)
};

// --- Custom Bar/Area Tooltip ---
const CustomTooltip = ({ active, payload, label, type, t }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    const unitText = type === 'score' ? t('units.pts') : t('units.logs');

    return (
      <div className="custom-tooltip">
        <p className="label"><strong>{label}</strong></p>
        <div className="tooltip-items">
            {payload.map((entry, index) => {
                const dataPoint = entry.payload; 
                // dataKey örn: "PlasticBottles_score"
                const rawKeyPrefix = entry.dataKey.split('_')[0]; 
                
                // Orijinal ham miktarı ve birimi al
                const rawQty = dataPoint[`${rawKeyPrefix}_rawQty`];
                const unit = dataPoint[`${rawKeyPrefix}_unit`] || '';

                return (
                    <p key={index} style={{ color: entry.color, margin: '4px 0', fontSize: '0.9rem' }}>
                        <span style={{fontWeight: '600'}}>{entry.name}:</span>{' '}
                        {type === 'score' 
                            ? `${formatNumber(entry.value)} ${t('units.pts')}` 
                            : `${formatNumber(rawQty)} ${unit} (${entry.value} ${t('units.logs')})`
                        }
                    </p>
                );
            })}
        </div>
        <div className="tooltip-total" style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '5px' }}>
            <p><strong>Total: {formatNumber(total)} {unitText}</strong></p>
        </div>
      </div>
    );
  }
  return null;
};

// --- Custom Pie Tooltip ---
const CustomPieTooltip = ({ active, payload, totalValue, t }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value; 
      const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;

      return (
        <div className="custom-tooltip">
          <p className="label" style={{color: payload[0].fill, marginBottom: '5px'}}><strong>{data.name}</strong></p>
          <div className="tooltip-items">
              <p>Impact: <strong>{formatNumber(Math.round(data.score))} {t('units.pts')}</strong></p>
              <p>Frequency: <strong>{data.count} {t('units.logs')}</strong></p>
              <p className="highlight-info" style={{marginTop: '5px', borderTop: '1px dashed #ddd', paddingTop: '3px'}}>
                  Share: <strong>{percent.toFixed(1)}%</strong>
              </p>
          </div>
        </div>
      );
    }
    return null;
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
  const DEFAULTS = { daily: 7, weekly: 10, monthly: 12, yearly: 3 };
  const [rangeValue, setRangeValue] = useState(DEFAULTS['daily']); 

  const [pieMetric, setPieMetric] = useState('score'); 

  const [chartData, setChartData] = useState([]); 
  const [uniqueCategories, setUniqueCategories] = useState([]); 
  const [categoryStats, setCategoryStats] = useState([]); 
  const [badges, setBadges] = useState([]);
  const [leaderboardRank, setLeaderboardRank] = useState('N/A');
  const [eventStats, setEventStats] = useState({ participating: 0, total: 0, rate: 0 });
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [rawLogsState, setRawLogsState] = useState([]);

  // Tiers artık render içinde tanımlanmalı ki dil değişince güncellensin
  const TIERS = [
    { name: t('tiers.eco_explorer'), min: 0, color: '#95a5a6', icon: '🌱' },
    { name: t('tiers.green_starter'), min: 100, color: '#2ecc71', icon: '🍃' },
    { name: t('tiers.eco_advocate'), min: 500, color: '#3498db', icon: '🌍' },
    { name: t('tiers.sustainability_hero'), min: 1000, color: '#e67e22', icon: '🌿' },
    { name: t('tiers.zero_waste_champion'), min: 2500, color: '#f1c40f', icon: '🌟' },
    { name: t('tiers.planet_guardian'), min: 5000, color: '#8e44ad', icon: '🌎' }
  ];

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
    setRangeValue(DEFAULTS[timeframe]);
    // Fetch new stats when timeframe changes
    if (token && !loading) {
      fetchStatsForTimeframe(timeframe);
    }
    // eslint-disable-next-line
  }, [timeframe]);

  // Dil değiştiğinde grafikleri yeniden işle
  useEffect(() => {
    if (!loading && chartData.length > 0) {
        processCategoryPie(rawLogsState); // Pie chart isimlerini de güncelle
        // Badges isimlerini güncelle
        calculateBadges(rawLogsState, scoreData.total_score);
    }
    // eslint-disable-next-line
  }, [i18n.language]);

  // --- Helper: Kategori İsmini Çevir ---
  const getCategoryTrans = (apiName) => {
      if (!apiName) return t('waste_categories.other');
      // "Plastic Bottles" -> "plastic_bottles"
      // "Batteries" -> "batteries", "AA Batteries" -> "aa_batteries"
      const key = apiName.toLowerCase().trim().replace(/\s+/g, "_").replace(/-/g, "_");
      const translated = t(`waste_categories.${key}`, { defaultValue: null });
      
      // If translation not found, return the original name with better formatting
      if (translated === null) {
        console.warn(`Missing translation for: waste_categories.${key} (original: ${apiName})`);
        return apiName; // Fallback to original name
      }
      return translated;
  };

  // --- Grafik Verisi İşleme (from backend stats API) ---
  const processStatsToChartData = (statsData, period, subCatMap = subCategoriesMap) => {
    const locale = i18n.language;
    const categoriesSet = new Set();
    const chartDataArray = [];

    statsData.forEach(stat => {
      const entry = { name: '' };
      
      // Format date range for display
      if (period === 'daily') {
        const date = new Date(stat.start_date);
        entry.name = date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (period === 'weekly') {
        const startDate = new Date(stat.start_date);
        const endDate = new Date(stat.end_date);
        entry.name = `${startDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}-${endDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`;
      } else if (period === 'monthly') {
        const date = new Date(stat.start_date);
        entry.name = date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
      } else if (period === 'yearly') {
        const date = new Date(stat.start_date);
        entry.name = date.getFullYear().toString();
      }

      entry.totalScore = stat.total_score;
      entry.totalLog = stat.total_log;

      // Process subcategory data
      Object.keys(stat).forEach(key => {
        if (key.match(/^subcategory_\d+_score$/)) {
          const subcatId = key.match(/subcategory_(\d+)_score/)[1];
          const safeKey = `subcategory_${subcatId}`;
          categoriesSet.add(safeKey);
          
          entry[`${safeKey}_score`] = stat[key];
          entry[`${safeKey}_count`] = stat[`subcategory_${subcatId}_log`] || 0;
          
          // Get the actual subcategory name from the map
          const subCatData = subCatMap[subcatId];
          const subcatName = subCatData?.name || `Subcategory ${subcatId}`;
          entry[`${safeKey}_originalName`] = subcatName;
        }
      });

      chartDataArray.push(entry);
    });

    setUniqueCategories(Array.from(categoriesSet));
    setChartData(chartDataArray);
  };

  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, scoreRes, statsRes, eventsRes, leaderboardRes, subCatsRes] = await Promise.all([
        axios.get(`${apiUrl}/user/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/scores/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/user/stats/?period=${timeframe}`, { headers }), 
        axios.get(`${apiUrl}/v1/events/events/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/leaderboard/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/subcategories/`, { headers }) 
      ]);

      setProfile(profileRes.data);
      setScoreData(scoreRes.data);
      
      const catMap = {};
      // Handle both paginated and non-paginated responses
      const subCatsList = subCatsRes.data.results || subCatsRes.data || [];
      (Array.isArray(subCatsList) ? subCatsList : []).forEach(sc => { 
        catMap[sc.id] = sc; 
      });
      setSubCategoriesMap(catMap);
      
      // Debug: log missing IDs
      if (Object.keys(catMap).length < 22) {
        console.warn('Not all subcategories loaded. Have:', Object.keys(catMap), 'Expected at least 22');
      }

      // Process stats data from the new backend endpoint
      const statsData = statsRes.data.data || [];
      processStatsToChartData(statsData, timeframe, catMap);
      
      // For pie chart, still need raw logs for category breakdown
      const logsRes = await axios.get(`${apiUrl}/v1/waste/logs/`, { headers });
      const allLogs = logsRes.data.results || [];
      setRawLogsState(allLogs);
      
      processCategoryPie(allLogs);
      calculateBadges(allLogs, scoreRes.data.total_score);
      calculateRank(leaderboardRes.data || [], userId);
      calculateEventStats(eventsRes.data.results || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(t('stats_page.error_load'));
      setLoading(false);
    }
  };

  const fetchStatsForTimeframe = async (period) => {
    try {
      setChartLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const statsRes = await axios.get(`${apiUrl}/v1/waste/user/stats/?period=${period}`, { headers });
      const statsData = statsRes.data.data || [];
      processStatsToChartData(statsData, period, subCategoriesMap);
      setChartLoading(false);
    } catch (err) {
      console.error(err);
      setError(t('stats_page.error_load'));
      setChartLoading(false);
    }
  };

  const getTierInfo = (score) => {
    let current = TIERS[0];
    let currentIndex = 1;
    let next = null;
    
    for (let i = 0; i < TIERS.length; i++) {
      if (score >= TIERS[i].min) {
        current = TIERS[i];
        currentIndex = i + 1;
        next = TIERS[i+1] || null;
      }
    }
    return { current, next, currentIndex };
  };

  // Pie Chart verisini çevirili isimlerle oluştur
  const processCategoryPie = (logs) => {
    const categoryMap = {};
    logs.forEach(log => {
      const catName = log.sub_category_name || 'Other';
      const transName = getCategoryTrans(catName); // Çeviriyi burada al

      if (!categoryMap[transName]) {
          categoryMap[transName] = { 
              name: transName, 
              score: 0, 
              count: 0 
          };
      }
      categoryMap[transName].score += parseFloat(log.score) || 0;
      categoryMap[transName].count += 1;
    });
    setCategoryStats(Object.values(categoryMap));
  };

  const calculateBadges = (logs, score) => {
    const earned = [];
    // Rozet isimleri çeviriden çekiliyor
    if (logs.length > 0) earned.push({ name: t('badges_data.first_step.name'), icon: '🎖', desc: t('badges_data.first_step.desc') });
    if (score >= 5000) earned.push({ name: t('badges_data.zero_waste_legend.name'), icon: '🌍', desc: t('badges_data.zero_waste_legend.desc') });
    const plasticTotal = logs.filter(l => l.sub_category_name?.toLowerCase().includes('plastic')).reduce((acc, c) => acc + parseFloat(c.quantity), 0);
    if (plasticTotal >= 10) earned.push({ name: t('badges_data.plastic_buster.name'), icon: '🥤', desc: t('badges_data.plastic_buster.desc') });
    setBadges(earned);
  };

  const calculateEventStats = (eventsList) => {
    const participating = eventsList.filter(e => e.i_am_participating).length;
    const total = eventsList.length;
    const rate = total > 0 ? Math.round((participating / total) * 100) : 0;
    setEventStats({ participating, total, rate });
  };

  const calculateRank = (leaderboard, myId) => {
    const rank = leaderboard.findIndex(u => String(u.id) === String(myId)) + 1;
    setLeaderboardRank(rank > 0 ? `#${rank}` : 'N/A');
  };

  const treeCount = Math.floor(scoreData.total_score / 500); 
  const { current: currentTier, next: nextTier, currentIndex: currentLevelIndex } = getTierInfo(scoreData.total_score);
  
  let progressPercent = 100;
  let pointsNeeded = 0;
  if (nextTier) {
      const range = nextTier.min - currentTier.min;
      const progress = scoreData.total_score - currentTier.min;
      progressPercent = Math.min(100, Math.max(0, (progress / range) * 100));
      pointsNeeded = nextTier.min - scoreData.total_score;
  }

  const pieTotal = categoryStats.reduce((acc, item) => acc + (item[pieMetric] || 0), 0);

  return (
    <div className="personal-stats-page-scoped personal-stats-layout">
      <Navbar isAuthenticated={true} />
      
      <main className="stats-main-content">
        {loading ? (
            <div className="loader-container-main">
                <div className="loader-spinner-main"></div>
                <p>{t('stats_page.loading')}</p>
            </div>
        ) : error ? (
            <div className="error-message-box-main"><Icon name="alerts" /> {error}</div>
        ) : (
          <>
            <section className="stats-hero-section">
              <div className="hero-header">
                <h1>{t('stats_page.title', { username: profile?.username || 'User' })}</h1>
                
                <div className="level-progress-container">
                    <div className="tier-labels">
                        <span className="current-tier" style={{ color: currentTier.color }}>
                            {currentTier.icon} {currentTier.name} 
                            <span style={{ fontSize: '0.85rem', marginLeft: '10px', opacity: 0.8, fontWeight: 'normal', color: 'var(--dashboard-text-medium)' }}>
                                {t('stats_page.level_indicator', { current: currentLevelIndex, total: TIERS.length })}
                            </span>
                        </span>
                        {nextTier && (
                            <span className="next-tier-hint">
                                {t('stats_page.next_level')}: {nextTier.name} <Icon name="next"/>
                            </span>
                        )}
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: currentTier.color }}></div>
                    </div>
                    <div className="progress-stats">
                        <span className="current-points">{formatNumber(Math.round(scoreData.total_score))} {t('units.pts')}</span>
                        {nextTier ? (
                            <span className="points-needed">{formatNumber(pointsNeeded)} {t('units.pts')} {t('stats_page.to_go')}</span>
                        ) : <span className="max-level">MAX LEVEL!</span>}
                    </div>
                </div>
              </div>
              
              <div className="hero-metrics-grid">
                <div className="metric-card">
                  <h3><Icon name="score" /> {t('stats_page.hero.eco_score')}</h3>
                  <div className="value">{formatNumber(Math.round(scoreData.total_score))}</div>
                </div>
                <div className="metric-card">
                  <h3><Icon name="tree" /> {t('stats_page.hero.trees_planted')}</h3>
                  <div className="value">{formatNumber(treeCount)}</div>
                </div>
                <div className="metric-card">
                  <h3><Icon name="rank" /> {t('stats_page.hero.global_rank')}</h3>
                  <div className="value">{leaderboardRank}</div>
                </div>
              </div>
            </section>

            <div className="stats-grid-layout">
              
              {/* --- CHART 1: Points History --- */}
              <div className="stats-card wide">
                <div className="chart-header">
                    <h2>{t('stats_page.charts.points_history')}</h2>
                    <div className="stats-filter-group">
                        <div className="range-selector">
                            <span style={{fontSize:'0.85rem', color:'var(--dashboard-text-medium)', marginRight:'5px'}}>{t('stats_page.charts.last')}</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="365" 
                                value={rangeValue} 
                                onChange={(e) => setRangeValue(Number(e.target.value))}
                                className="range-input"
                            />
                        </div>
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
                    {chartLoading ? <div className="chart-loader"><Icon name="loading"/></div> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    interval={0} 
                                    angle={-45}  
                                    textAnchor="end" 
                                    tick={{ fontSize: 10, dy: 10 }}
                                />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip type="score" t={t} />} cursor={{fill: 'transparent'}}/>
                                <Legend wrapperStyle={{paddingTop: '40px'}} />
                                {uniqueCategories.map((safeKey, index) => {
                                    // Tooltip'te ve Lejantta çevrili ismi göstermek için
                                    const originalName = chartData.find(d => d[`${safeKey}_originalName`])?.[`${safeKey}_originalName`] || safeKey;
                                    const transName = getCategoryTrans(originalName);
                                    
                                    return (
                                        <Bar 
                                            key={safeKey} 
                                            dataKey={`${safeKey}_score`} 
                                            name={transName}
                                            stackId="a" 
                                            fill={COLORS[index % COLORS.length]} 
                                            barSize={25}
                                        />
                                    );
                                })}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
              </div>

              {/* --- CHART 2: Items Logged --- */}
              <div className="stats-card wide">
                <div className="chart-header">
                    <h2>{t('stats_page.charts.items_logged_frequency')}</h2>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                interval={0} 
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 10, dy: 10 }}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip type="items" t={t} />} cursor={{fill: 'transparent'}}/>
                            <Legend wrapperStyle={{paddingTop: '40px'}} />
                            {uniqueCategories.map((safeKey, index) => {
                                const originalName = chartData.find(d => d[`${safeKey}_originalName`])?.[`${safeKey}_originalName`] || safeKey;
                                const transName = getCategoryTrans(originalName);

                                return (
                                    <Bar 
                                        key={safeKey} 
                                        dataKey={`${safeKey}_count`} 
                                        name={transName}
                                        stackId="b" 
                                        fill={COLORS[index % COLORS.length]} 
                                        barSize={25}
                                    />
                                );
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
              </div>

              {/* --- PIE CHART --- */}
              <div className="stats-card">
                <div className="chart-header" style={{marginBottom: 0, border: 'none'}}>
                    <h2>{t('stats_page.charts.impact_breakdown')}</h2>
                </div>
                <div className="pie-toggle-group">
                    <button className={`filter-btn ${pieMetric === 'score' ? 'active' : ''}`} onClick={() => setPieMetric('score')}>{t('stats_page.charts.by_points')}</button>
                    <button className={`filter-btn ${pieMetric === 'count' ? 'active' : ''}`} onClick={() => setPieMetric('count')}>{t('stats_page.charts.by_frequency')}</button>
                </div>

                <div className="chart-container pie-container">
                  {categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                            data={categoryStats} 
                            cx="50%" cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey={pieMetric} 
                        >
                          {categoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip totalValue={pieTotal} t={t} />} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="empty-state-chart"><p>{t('stats_page.charts.no_breakdown_data')}</p></div>}
                </div>
              </div>

              {/* ... Badges and Forest ... */}
              <div className="stats-card wide">
                <div className="badges-header-with-button">
                  <h2>{t('stats_page.badges.title')}</h2>
                  <button 
                    className="view-all-badges-btn"
                    onClick={() => navigate('/badges')}
                  >
                    {t('stats_page.badges.view_all', { defaultValue: 'View All Badges' })} →
                  </button>
                </div>
                <div className="badges-grid">
                  {badges.length > 0 ? (
                    badges.map((badge, index) => (
                      <div key={index} className="badge-item">
                        <div className="badge-icon">{badge.icon}</div>
                        <span className="badge-name">{badge.name}</span>
                        <span className="badge-desc">{badge.desc}</span>
                      </div>
                    ))
                  ) : <div className="empty-badges"><p>{t('stats_page.badges.empty')}</p></div>}
                </div>
              </div>

              <div className="stats-card forest-card">
                <div className="forest-header">
                    <h2>{t('stats_page.forest.title')}</h2>
                    <span className="forest-info">{t('stats_page.forest.info')}</span>
                </div>
                <div className="forest-visual">
                  {treeCount > 0 ? (
                    Array.from({ length: Math.min(treeCount, 50) }).map((_, i) => (
                      <span key={i} className="tree-icon">🌲</span>
                    ))
                  ) : <div className="empty-forest"><Icon name="seed" className="seed-icon"/><p>{t('stats_page.forest.empty')}</p></div>}
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