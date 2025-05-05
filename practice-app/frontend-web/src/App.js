import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import WasteLog from './components/WasteLog';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/waste" element={<WasteLog />} />
            </Routes>
        </Router>
    );
};

export default App;