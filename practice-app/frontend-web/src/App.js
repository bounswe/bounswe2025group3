import React, { useEffect } from 'react';
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
    return (
        <Router>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/waste" element={<WasteLog />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/challenges" element={<Challanges />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                {/* Assuming slug is passed as URL parameter */}
                <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                {/* Assuming uid and token are passed as URL parameters */}
                
                {/* Assuming these components exist */}
                
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/github-callback" element={<GithubCallback />} />
                <Route path="/" element={<Home />} /> {/* Redirect root to /home */}
            </Routes>
        </Router>
    );
};

export default App;