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

// --- Badges Definition List (Statik Veri) ---
// Rozet tanımlarını component dışına veya içine alabiliriz ama 
// dinamik çeviri için render içinde kullanacağız.
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
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    const unitText = type === 'score' ? t('units.pts') : t('units.logs');

    return (
      <div className="custom-tooltip">
        <p className="label"><strong>{label}</strong></p>
        <div className="tooltip-items">
            {payload.map((entry, index) => {
                const dataPoint = entry.payload; 
                const rawKeyPrefix = entry.dataKey.split('_')[0]; 
                
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
  const DEFAULTS = { daily: 10, weekly: 10, monthly: 12, yearly: 10 };
  const [rangeValue, setRangeValue] = useState(DEFAULTS['daily']); 

  const [pieMetric, setPieMetric] = useState('score'); 

  const [chartData, setChartData] = useState([]); 
  const [uniqueCategories, setUniqueCategories] = useState([]); 
  const [categoryStats, setCategoryStats] = useState([]); 
  
  // DÜZELTME: Artık tüm rozet objesini değil, sadece kazanılan rozetlerin ID'lerini tutuyoruz.
  const [earnedBadgeIds, setEarnedBadgeIds] = useState([]);

  const [leaderboardRank, setLeaderboardRank] = useState('N/A');
  const [eventStats, setEventStats] = useState({ participating: 0, total: 0, rate: 0 });
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [rawLogsState, setRawLogsState] = useState([]);
  // rawStreakState grafik için kullanılıyor olabilir ama rozet hesabı için logları kullanacağız
  const [rawStreakState, setRawStreakState] = useState([]); 

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
    setRangeValue(DEFAULTS[timeframe]);
    // eslint-disable-next-line
  }, [timeframe]);

  useEffect(() => {
    if (!loading && rawLogsState.length > 0) {
        processLogsToChartData(rawLogsState, timeframe, subCategoriesMap, rangeValue);
        processCategoryPie(rawLogsState);
        // Dil bağımlılığını kaldırdık, sadece veri değişince hesaplar
        calculateBadges(rawLogsState, scoreData.total_score);
    }
    // eslint-disable-next-line
  }, [rangeValue, timeframe, rawLogsState]);

  const getCategoryTrans = (apiName) => {
      if (!apiName) return t('waste_categories.other');
      const key = apiName.toLowerCase().trim().replace(/\s+/g, "_");
      return t(`waste_categories.${key}`, { defaultValue: apiName });
  };

  // --- Yardımcı: Gerçek Streak Hesaplama ---
  // API'den gelen dizi yerine raw loglardan gerçek ardışık günleri hesaplar
  const calculateRealStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;

    // 1. Tarihleri al ve saatleri sıfırla, benzersiz yap
    const uniqueDates = [...new Set(logs.map(log => {
        const d = new Date(log.date_logged);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }))];

    // 2. Yeniden eskiye sırala
    uniqueDates.sort((a, b) => b - a);

    if (uniqueDates.length === 0) return 0;

    // 3. Streak kontrolü
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    // En son log bugün veya dün değilse streak bozulmuş demektir (0)
    // Ancak kullanıcı "bugün" girmemiş olsa bile, dün girmişse streak devam ediyordur.
    const lastLogDate = uniqueDates[0];
    if (lastLogDate !== todayTime && lastLogDate !== yesterdayTime) {
        return 0; 
    }

    let streak = 1;
    let currentCheck = lastLogDate;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = uniqueDates[i];
        const diffTime = Math.abs(currentCheck - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
            streak++;
            currentCheck = prevDate;
        } else {
            break; // Ardışıklık bozuldu
        }
    }
    return streak;
  };

  const processLogsToChartData = (logs, period, catMap, limit) => {
    const now = new Date();
    const dataMap = new Map();
    const categoriesSet = new Set();
    const timePoints = [];
    const loopLimit = limit - 1; 

    if (period === 'daily') {
        for (let i = loopLimit; i >= 0; i--) {
            const d = new Date(); d.setDate(now.getDate() - i);
            timePoints.push(d);
        }
    } else if (period === 'weekly') {
        for (let i = loopLimit; i >= 0; i--) {
            const d = new Date(); d.setDate(now.getDate() - (i * 7));
            timePoints.push(d);
        }
    } else if (period === 'monthly') {
        for (let i = loopLimit; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            timePoints.push(d);
        }
    } else if (period === 'yearly') {
        for (let i = loopLimit; i >= 0; i--) {
            const d = new Date(now.getFullYear() - i, 0, 1);
            timePoints.push(d);
        }
    }

    const locale = i18n.language; 

    timePoints.forEach(d => {
        let key = '';
        if (period === 'daily') key = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
        else if (period === 'weekly') {
             const day = d.getDay(); 
             const diff = d.getDate() - day + (day === 0 ? -6 : 1);
             const monday = new Date(d); monday.setDate(diff);
             key = `${monday.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} ${t('stats_page.charts.week_suffix')}`; 
        }
        else if (period === 'monthly') key = d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
        else if (period === 'yearly') key = d.getFullYear().toString();
        
        if (!dataMap.has(key)) dataMap.set(key, { name: key });
    });

    logs.forEach(log => {
        const date = new Date(log.date_logged);
        let key = '';

        if (period === 'daily') key = date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
        else if (period === 'weekly') {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date); monday.setDate(diff);
            key = `${monday.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} ${t('stats_page.charts.week_suffix')}`;
        }
        else if (period === 'monthly') key = date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
        else if (period === 'yearly') key = date.getFullYear().toString();

        if (dataMap.has(key)) {
            const entry = dataMap.get(key);
            const catName = log.sub_category_name || 'Other';
            const safeKey = catName.replace(/\s+/g, ''); 
            
            categoriesSet.add(safeKey); 
            
            entry[`${safeKey}_score`] = (entry[`${safeKey}_score`] || 0) + (parseFloat(log.score) || 0);
            entry[`${safeKey}_count`] = (entry[`${safeKey}_count`] || 0) + 1;
            entry[`${safeKey}_rawQty`] = (entry[`${safeKey}_rawQty`] || 0) + (parseFloat(log.quantity) || 0);

            const unit = catMap[log.sub_category]?.unit || 'units';
            entry[`${safeKey}_unit`] = t(`units.${unit.toLowerCase()}`, {defaultValue: unit});
            
            entry[`${safeKey}_originalName`] = catName;
        }
    });

    setUniqueCategories(Array.from(categoriesSet));
    setChartData(Array.from(dataMap.values()));
  };

  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [profileRes, scoreRes, logsRes, eventsRes, leaderboardRes, subCatsRes, streakRes] = await Promise.all([
        axios.get(`${apiUrl}/user/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/scores/me/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/logs/`, { headers }), 
        axios.get(`${apiUrl}/v1/events/events/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/leaderboard/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/subcategories/`, { headers }),
        axios.get(`${apiUrl}/v1/waste/user/stats/?period=daily`, { headers }) 
      ]);

      setProfile(profileRes.data);
      setScoreData(scoreRes.data);
      
      const catMap = {};
      const subCats = subCatsRes.data.results || subCatsRes.data || [];
      subCats.forEach(sc => { catMap[sc.id] = sc; });
      setSubCategoriesMap(catMap);

      const allLogs = logsRes.data.results || [];
      const streakData = streakRes.data.data || []; 

      setRawLogsState(allLogs);
      setRawStreakState(streakData);
      
      processLogsToChartData(allLogs, timeframe, catMap, DEFAULTS[timeframe]);
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

  const processCategoryPie = (logs) => {
    const categoryMap = {};
    logs.forEach(log => {
      const catName = log.sub_category_name || 'Other';
      const transName = getCategoryTrans(catName);

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

  // --- DÜZELTME 1: Mantık Hatası Giderildi ---
  // Artık API'den gelen streak listesinin uzunluğuna (ki bu boş günler de olabilir) bakmıyoruz.
  // raw loglar üzerinden gerçek ardışık günleri hesaplıyoruz.
  const calculateBadges = (logs, score) => {
    const safeLogs = Array.isArray(logs) ? logs : [];
    
    // Gerçek streak sayısını hesapla
    const currentStreak = calculateRealStreak(safeLogs);

    // Kontrol listesi - earned: true/false döner
    const badgeChecks = {
        'first_step': safeLogs.length > 0,
        'plastic_buster': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('plastic')).reduce((acc, curr) => acc + parseFloat(curr.quantity), 0) >= 10,
        'sustainability_streak': currentStreak >= 14, // Düzeltilmiş Streak Kontrolü
        'zero_waste_legend': score >= 5000,
        'eco_warrior': safeLogs.length >= 50,
        'tree_hugger': score >= 1000,
        'recycling_master': safeLogs.filter(l => l.disposal_location?.toLowerCase().includes('recycled') || l.disposal_location?.toLowerCase().includes('recycling')).length >= 30,
        'compost_champion': safeLogs.filter(l => l.disposal_location?.toLowerCase().includes('compost')).length >= 20,
        'milestone_100': safeLogs.length >= 100,
        'score_1500': score >= 1500,
        'consistency_king': currentStreak >= 30, // Düzeltilmiş Streak Kontrolü
        'metal_maven': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('metal')).length >= 15,
        'paper_pride': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('paper')).length >= 25,
        'glass_guru': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('glass')).length >= 10,
        'eco_score_500': score >= 500,
        'score_2000': score >= 2000,
        'score_3000': score >= 3000,
        'logs_200': safeLogs.length >= 200,
        'logs_500': safeLogs.length >= 500,
        'streak_60': currentStreak >= 60, // Düzeltilmiş Streak Kontrolü
        'plastic_50': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('plastic')).reduce((acc, curr) => acc + parseFloat(curr.quantity), 0) >= 50,
        'organic_50': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('organic') || l.sub_category_name?.toLowerCase().includes('food')).length >= 50,
        'electronic_20': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('electronic') || l.sub_category_name?.toLowerCase().includes('e-waste')).length >= 20,
        'textile_30': safeLogs.filter(l => l.sub_category_name?.toLowerCase().includes('textile') || l.sub_category_name?.toLowerCase().includes('cloth')).length >= 30,
        'donate_50': safeLogs.filter(l => l.disposal_location?.toLowerCase().includes('donated') || l.disposal_location?.toLowerCase().includes('reused')).length >= 50,
        'landfill_zero': safeLogs.filter(l => l.disposal_location?.toLowerCase().includes('landfill')).length === 0 && safeLogs.length > 0,
        'streak_7': currentStreak >= 7, // Düzeltilmiş Streak Kontrolü (Haftanın Savaşçısı)
        'streak_21': currentStreak >= 21 // Düzeltilmiş Streak Kontrolü
    };

    // Sadece kazanılanların ID'lerini bir diziye at
    const earnedIds = Object.keys(badgeChecks).filter(id => badgeChecks[id]);
    setEarnedBadgeIds(earnedIds);
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
                  {/* DÜZELTME 2: Rozetler artık ID'ye göre basılıyor ve dinamik çevriliyor */}
                  {earnedBadgeIds.length > 0 ? (
                    earnedBadgeIds.map((badgeId, index) => {
                        const def = BADGE_DEFINITIONS.find(d => d.id === badgeId) || { icon: '🏆' };
                        return (
                          <div key={index} className="badge-item">
                            <div className="badge-icon">{def.icon}</div>
                            {/* Dil değişiminde burası anında güncellenir */}
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