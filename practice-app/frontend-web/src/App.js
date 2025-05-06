import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import WasteLog from './components/WasteLog';
import Profile from './components/Profile';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/waste" element={<WasteLog />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/challenges" element={<div>Challenges Page (Placeholder)</div>} />
                <Route path="/leaderboard" element={<div>Leaderboard Page (Placeholder)</div>} />
            </Routes>
        </Router>
    );
};

export default App;