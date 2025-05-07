import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Navbar isAuthenticated={false} />
            <div className="home-content">
                <h1>Welcome to Zero Waste Challenge</h1>
                <p>Join our community to track and reduce waste, compete in challenges, and earn rewards!</p>
                <div className="home-buttons">
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                    <Link to="/signup">
                        <button>Sign Up</button>
                    </Link>
                </div>
                <h3>Why Join?</h3>
                <ul>
                    <li>Track your waste reduction progress</li>
                    <li>Compete with friends on leaderboards</li>
                    <li>Discover eco-friendly tips and products</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;