import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import WasteLogList from './components/WasteLogList';
import Challenges from './components/Challenges';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/waste-logs" element={<WasteLogList />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/leaderboard" element={<div>Leaderboard Page (TBD)</div>} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;