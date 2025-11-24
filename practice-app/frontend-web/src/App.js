import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './components/home/Home';
import Login from './components/auth/LoginPage'; 
import Signup from './components/auth/SignupPage'; 
import WasteLog from './components/waste/WasteLog';
import Dashboard from './components/dashboard/Dashboard'; 
import Profile from './components/profile/Profile'; 
import About from './components/aboutus/AboutUsPage';
import Blog from './components/blog/BlogPage';
import Leaderboard from './components/leaderboard/LeaderboardPage'; 
import Challanges from './components/challenges/ChallengesPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage'; 
import BlogPostPage from './components/blog/BlogPostPage';
import GoalsPage from './components/goals/GoalsPage';
import GithubCallback from './components/auth/GithubCallback';
import EventsPage from './components/events/EventsPage';
import TermsPage from './components/auth/TermsPage';
import ChallengeDetailPage from './components/challenges/ChallengeDetail';
import EventCreate from './components/events/EventCreate';
import './i18n';
import PersonalStats from './components/stats/PersonalStats';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './services/api';

// Add debugging information for build and environment
console.debug('App Initialization:', {
    NODE_ENV: process.env.NODE_ENV,
    PUBLIC_URL: process.env.PUBLIC_URL,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    BUILD_TIME: new Date().toISOString()
});

//import Pricing from './components/pricing/PricingPage';
//<Route path="/pricing" element={<Pricing />} />

const App = () => {
    const [notifications, setNotifications] = useState([]);

    const markAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications([]);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    useEffect(() => {
        const pollNotifications = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.debug('No auth token found, skipping notification poll.');
                    return;
                }

                const results = await getUnreadNotifications();
                setNotifications(results);

            } catch (error) {
                console.error('Error polling notifications:', error);
            }
        };

        // Initial poll
        pollNotifications();

        // Poll every 1 minute (60000 ms)
        const intervalId = setInterval(pollNotifications, 60000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Router>
            {notifications.length > 0 && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxWidth: '350px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>Notifications ({notifications.length})</h4>
                        <button 
                            onClick={markAllRead}
                            style={{ fontSize: '12px', padding: '4px 8px', cursor: 'pointer', background: '#f0f0f0', border: 'none', borderRadius: '4px' }}
                        >
                            Mark all read
                        </button>
                    </div>
                    {notifications.map(notification => (
                        <div key={notification.id} style={{ borderBottom: '1px solid #f5f5f5', padding: '10px 0' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{notification.message}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <small style={{ color: '#888', fontSize: '11px' }}>
                                    {new Date(notification.created_at).toLocaleString()}
                                </small>
                                <button 
                                    onClick={() => markAsRead(notification.id)}
                                    style={{ fontSize: '11px', color: '#007bff', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/waste" element={<WasteLog />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/challenges" element={<Challanges />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/create" element={<EventCreate />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                {/* Assuming slug is passed as URL parameter */}
                <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                {/* Assuming uid and token are passed as URL parameters */}
                
                {/* Assuming these components exist */}
                
                <Route path="/challenges/:id" element={<ChallengeDetailPage />} />

                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/github-callback" element={<GithubCallback />} />
                <Route path="/" element={<Home />} /> {/* Redirect root to /home */}
                <Route path="/stats" element={<PersonalStats />} />
            </Routes>
        </Router>
    );
};

export default App;