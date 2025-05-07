import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home/Home';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Dashboard from './components/dashboard/Dashboard';
import WasteLog from './components/waste/WasteLog';
import Profile from './components/profile/Profile';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/waste" element={<WasteLog />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/challenges" element={<div>Challenges Page (Placeholder)</div>} />
                <Route path="/leaderboard" element={<div>Leaderboard Page (Placeholder)</div>} />
                <Route path="/about" element={<div>About Us Page (Placeholder)</div>} />
                <Route path="/blog" element={<div>Blog Page (Placeholder)</div>} />
                <Route path="/pricing" element={<div>Pricing Page (Placeholder)</div>} />
            </Routes>
        </Router>
    );
};

export default App;