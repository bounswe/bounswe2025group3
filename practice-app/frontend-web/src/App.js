import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home/Home';
import Login from './components/auth/LoginPage'; // Assuming updated path
import Signup from './components/auth/SignupPage'; // Assuming exists
import WasteLog from './components/waste/WasteLog';
import Dashboard from './components/dashboard/Dashboard'; // Assuming exists
import Profile from './components/profile/Profile'; // Assuming exists

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/waste" element={<WasteLog />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<Home />} /> {/* Redirect root to /home */}
            </Routes>
        </Router>
    );
};

export default App;