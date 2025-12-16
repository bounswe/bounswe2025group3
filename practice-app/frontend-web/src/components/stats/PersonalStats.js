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

// --- Badges Definition List (Static Data) ---
const BADGE_DEFINITIONS = [
    { id: 'first_step', icon: '🎖' },
    { id: 'plastic_buster', icon: '🥤' },
    { id: 'sustainability_streak', icon: '🔥' },
    { id: 'zero_waste_legend', icon: '🌍' },
    { id: 'eco_warrior', icon: '⚔️' },
    { id: 'tree_hugger', icon: '🌿' },
    { id: 'recycling_master', icon: '♻️' },
    { id: 'compost_champion', icon: '🌱' },
    { id: 'milestone_100', icon: '💯' },
    { id: 'score_1500', icon: '🏆' },
    { id: 'consistency_king', icon: '👑' },
    { id: 'metal_maven', icon: '🔧' },
    { id: 'paper_pride', icon: '📄' },
    { id: 'glass_guru', icon: '🥃' },
    { id: 'eco_score_500', icon: '⭐' },
    { id: 'score_2000', icon: '🥇' },
    { id: 'score_3000', icon: '🥈' },
    { id: 'logs_200', icon: '📋' },
    { id: 'logs_500', icon: '🎯' },
    { id: 'streak_60', icon: '🚀' },
    { id: 'plastic_50', icon: '💪' },
    { id: 'organic_50', icon: '🍃' },
    { id: 'electronic_20', icon: '🔌' },
    { id: 'textile_30', icon: '👕' },
    { id: 'donate_50', icon: '🎁' },
    { id: 'landfill_zero', icon: '✨' },
    { id: 'streak_7', icon: '📅' },
    { id: 'streak_21', icon: '🎖️' }
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
  return new Intl.NumberFormat('tr-TR').format(num); 
};

// --- Custom Bar/Area Tooltip ---
const CustomTooltip = ({ active, payload, label, type, t }) => {
  // Helper to translate units
  const getUnitTrans = (u) => {
      if(!u) return '';
      const key = u.toLowerCase().trim();
      return t(`units.${key}`, { defaultValue: u });
  };

  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    const unitText = type === 'score' ? t('units.pts') : t('units.logs');

    return (
      <div className="custom-tooltip" style={{
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc', 
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 1000,
          pointerEvents: 'none' 
      }}>
        <p className="label" style={{marginBottom: '5px', borderBottom:'1px solid #eee', paddingBottom:'3px'}}>
            <strong>{label}</strong>
        </p>
        <div className="tooltip-items">
            {payload.map((entry, index) => {
                const dataPoint = entry.payload; 
                const rawKeyPrefix = entry.dataKey.split('_').slice(0, 2).join('_'); 
                
                const rawQty = dataPoint[`${rawKeyPrefix}_rawQty`];
                const unit = dataPoint[`${rawKeyPrefix}_unit`] || '';
                const translatedUnit = getUnitTrans(unit);

                return (
                    <p key={index} style={{ color: entry.color, margin: '2px 0', fontSize: '0.85rem' }}>
                        <span style={{fontWeight: '600'}}>{entry.name}:</span>{' '}
                        {type === 'score' 
                            ? `${formatNumber(entry.value)} ${t('units.pts')}` 
                            : `${formatNumber(rawQty)} ${translatedUnit} (${entry.value} ${t('units.logs')})`
                        }
                    </p>
                );
            })}
        </div>
        <div className="tooltip-total" style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '5px' }}>
            <p><strong>{t('stats_page.tooltips.total', 'Total')}: {formatNumber(total)} {unitText}</strong></p>
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
        <div className="custom-tooltip" style={{
            backgroundColor: '#fff', 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000
        }}>
          <p className="label" style={{color: payload[0].fill, marginBottom: '5px'}}><strong>{data.name}</strong></p>
          <div className="tooltip-items">
              <p>{t('stats_page.tooltips.impact', 'Impact')}: <strong>{formatNumber(Math.round(data.score))} {t('units.pts')}</strong></p>
              <p>{t('stats_page.tooltips.frequency', 'Frequency')}: <strong>{data.count} {t('units.logs')}</strong></p>
              <p className="highlight-info" style={{marginTop: '5px', borderTop: '1px dashed #ddd', paddingTop: '3px'}}>
                  {t('stats_page.tooltips.share', 'Share')}: <strong>{percent.toFixed(1)}%</strong>
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
  const [pieMetric, setPieMetric] = useState('score'); 

  const [chartData, setChartData] = useState([]); 
  const [uniqueCategories, setUniqueCategories] = useState([]); 
  const [categoryStats, setCategoryStats] = useState([]); 
  
  const [earnedBadgeIds, setEarnedBadgeIds] = useState([]);
  const [leaderboardRank, setLeaderboardRank] = useState('N/A');
  
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [rawLogsState, setRawLogsState] = useState([]);
  
  const [rawStatsData, setRawStatsData] = useState([]);

  const TIERS = [
    { key: 'eco_explorer', min: 0, color: '#95a5a6', icon: '🌱' },
    { key: 'green_starter', min: 100, color: '#2ecc71', icon: '🍃' },
    { key: 'eco_advocate', min: 500, color: '#3498db', icon: '🌍' },
    { key: 'sustainability_hero', min: 1000, color: '#e67e22', icon: '🌿' },
    { key: 'zero_waste_champion', min: 2500, color: '#f1c40f', icon: '🌟' },
    { key: 'planet_guardian', min: 5000, color: '#8e44ad', icon: '🌎' }
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
    if (token && !loading) {
      fetchStatsForTimeframe(timeframe);
    }
    // eslint-disable-next-line
  }, [timeframe]);

  useEffect(() => {
    if (!loading && rawLogsState.length > 0) {
        calculateBadges(rawLogsState, scoreData.total_score);
    }
    // eslint-disable-next-line
  }, [rawLogsState]);

  useEffect(() => {
    if (!loading && rawStatsData.length > 0) {
        processStatsData(rawStatsData, timeframe, subCategoriesMap, rawLogsState);
    }
    // eslint-disable-next-line
  }, [i18n.language]);

  const getCategoryTrans = (apiName) => {
      if (!apiName) return t('waste_categories.other');
      const key = apiName.toLowerCase().trim().replace(/[\s-]+/g, "_");
      return t(`waste_categories.${key}`, { defaultValue: apiName });
  };

  // --- HELPER: Recursively Fetch All Pages ---
  // This ensures we get ALL data regardless of pagination limits (e.g. 10 items)
  const fetchAllPages = async (endpoint, headers) => {
    let allResults = [];
    let nextUrl = `${apiUrl}${endpoint}`;
    
    // Add page_size param safely
    if (nextUrl.includes('?')) nextUrl += '&page_size=1000';
    else nextUrl += '?page_size=1000';

    try {
        while (nextUrl) {
            const res = await axios.get(nextUrl, { headers });
            const data = res.data;

            if (Array.isArray(data)) {
                // If backend does not paginate and returns list
                allResults = data;
                nextUrl = null;
            } else if (data.results) {
                // If backend paginates
                allResults = [...allResults, ...data.results];
                nextUrl = data.next; // Go to next page
            } else {
                // Unknown format or single object (shouldn't happen for lists)
                nextUrl = null;
            }
        }
    } catch (error) {
        console.warn("Error fetching pages:", error);
    }
    return allResults;
  };

  // --- GRAPH DATA PROCESSING ---
  const processStatsData = (statsData, period, subCatMap = subCategoriesMap, logs = rawLogsState) => {
    const locale = i18n.language; 
    const categoriesSet = new Set();
    const chartDataArray = [];
    const pieAggregates = {};

    statsData.forEach(stat => {
        const startDate = new Date(stat.start_date);
        let displayKey = '';

        if (period === 'daily') {
             displayKey = startDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
        } else if (period === 'weekly') {
             const day = startDate.getDay();
             const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
             const monday = new Date(startDate); monday.setDate(diff);
             displayKey = `${monday.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} ${t('stats_page.charts.week_suffix')}`;
        } else if (period === 'monthly') {
             displayKey = startDate.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
        } else if (period === 'yearly') {
             displayKey = startDate.getFullYear().toString();
        }

        const entry = { name: displayKey };
        entry.totalScore = stat.total_score;
        entry.totalLog = stat.total_log;

        Object.keys(stat).forEach(k => {
             if (k.match(/^subcategory_\d+_score$/)) {
                 const subcatId = k.match(/subcategory_(\d+)_score/)[1];
                 const safeKey = `subcategory_${subcatId}`;
                 const scoreValue = stat[k];
                 const logValue = stat[`subcategory_${subcatId}_log`] || 0;

                 const rawQty = logs
                    .filter(l => {
                        if (l.sub_category !== parseInt(subcatId)) return false;
                        const logDate = new Date(l.date_logged).toISOString().split('T')[0];
                        return logDate >= stat.start_date && logDate <= stat.end_date;
                    })
                    .reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);

                 if (scoreValue > 0 || logValue > 0) {
                     categoriesSet.add(safeKey);
                     entry[`${safeKey}_score`] = scoreValue;
                     entry[`${safeKey}_count`] = logValue;
                     entry[`${safeKey}_rawQty`] = parseFloat(rawQty.toFixed(2)); 

                     let displayName = `Subcategory ${subcatId}`;
                     let unit = '';

                     // Map lookup - now guaranteed to be populated for all active categories
                     const subCatData = subCatMap[subcatId];
                     if (subCatData) {
                       displayName = subCatData.name;
                       unit = subCatData.unit; 
                     } else {
                       // Fallback only if really missing (e.g. inactive category)
                       const fallbackLog = logs.find(l => l.sub_category === parseInt(subcatId));
                       if (fallbackLog && fallbackLog.sub_category_name) {
                           displayName = fallbackLog.sub_category_name;
                       }
                     }
                     
                     entry[`${safeKey}_originalName`] = displayName;
                     entry[`${safeKey}_unit`] = unit;

                     const transName = getCategoryTrans(displayName);
                     if (!pieAggregates[transName]) {
                         pieAggregates[transName] = { name: transName, score: 0, count: 0 };
                     }
                     pieAggregates[transName].score += scoreValue;
                     pieAggregates[transName].count += logValue;
                 }
             }
        });

        chartDataArray.push(entry);
    });

    setUniqueCategories(Array.from(categoriesSet));
    setChartData(chartDataArray);
    setCategoryStats(Object.values(pieAggregates));
  };

  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // We fetch independent endpoints in parallel, but handle SubCategories & Logs with the fetchAllPages helper
      // to ensure we get ALL data despite pagination.
      const [profileRes, scoreRes, leaderboardRes, eventsRes] = await Promise.all([
        axios.get(`${apiUrl}/user/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/scores/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/leaderboard/`, { headers }),
        axios.get(`${apiUrl}/v1/events/events/`, { headers })
      ]);

      // Fetch ALL Subcategories (Recursively)
      const allSubCats = await fetchAllPages('/v1/waste/subcategories/', headers);
      
      // Fetch ALL Logs (Recursively) - just in case logs also paginate heavily
      const allLogs = await fetchAllPages('/v1/waste/logs/', headers);

      // Fetch Stats (Standard fetch, usually returns fixed list)
      const statsRes = await axios.get(`${apiUrl}/v1/waste/user/stats/?period=${timeframe}`, { headers });

      setProfile(profileRes.data);
      setScoreData(scoreRes.data);
      
      const catMap = {};
      allSubCats.forEach(sc => { catMap[sc.id] = sc; });
      setSubCategoriesMap(catMap);

      const statsData = statsRes.data.data || [];

      setRawLogsState(allLogs);
      setRawStatsData(statsData);

      processStatsData(statsData, timeframe, catMap, allLogs);
      calculateBadges(allLogs, scoreRes.data.total_score);
      calculateRank(leaderboardRes.data || [], userId);

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
      
      setRawStatsData(statsData);
      processStatsData(statsData, period, subCategoriesMap, rawLogsState);
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

  const calculateBadges = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const badges = await axios.get(`${apiUrl}/v1/rewards/badges/me/`, { headers });
      const earnedBadges = badges.data.filter(badge => badge.earned === true).map(badge => badge.code);
      setEarnedBadgeIds(earnedBadges);
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
                            {currentTier.icon} {t(`stats_page.tiers.${currentTier.key}`, currentTier.key)} 
                            <span style={{ fontSize: '0.85rem', marginLeft: '10px', opacity: 0.8, fontWeight: 'normal', color: 'var(--dashboard-text-medium)' }}>
                                {t('stats_page.level_indicator', { current: currentLevelIndex, total: TIERS.length })}
                            </span>
                        </span>
                        {nextTier && (
                            <span className="next-tier-hint">
                                {t('stats_page.next_level')}: {t(`stats_page.tiers.${nextTier.key}`, nextTier.key)} <Icon name="next"/>
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
                        ) : (
                            <span className="max-level">{t('stats_page.max_level', 'MAX LEVEL!')}</span>
                        )}
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
                                <Tooltip 
                                    content={<CustomTooltip type="score" t={t} />} 
                                    cursor={{fill: 'transparent'}}
                                    wrapperStyle={{ zIndex: 1000 }}
                                />
                                <Legend wrapperStyle={{paddingTop: '40px'}} />
                                {uniqueCategories.map((safeKey, index) => {
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
                            <Tooltip 
                                content={<CustomTooltip type="items" t={t} />} 
                                cursor={{fill: 'transparent'}}
                                wrapperStyle={{ zIndex: 1000 }}
                            />
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
                        <Tooltip 
                            content={<CustomPieTooltip totalValue={pieTotal} t={t} />} 
                            wrapperStyle={{ zIndex: 1000 }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="empty-state-chart"><p>{t('stats_page.charts.no_breakdown_data')}</p></div>}
                </div>
              </div>

              {/* --- Badges and Forest --- */}
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
                  {earnedBadgeIds.length > 0 ? (
                    earnedBadgeIds.map((badgeId, index) => {
                        const def = BADGE_DEFINITIONS.find(d => d.id === badgeId) || { icon: '🏆' };
                        return (
                          <div key={index} className="badge-item">
                            <div className="badge-icon">{def.icon}</div>
                            <span className="badge-name">{t(`badges_data.${badgeId}.name`)}</span>
                            <span className="badge-desc">{t(`badges_data.${badgeId}.desc`)}</span>
                          </div>
                        );
                    })
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