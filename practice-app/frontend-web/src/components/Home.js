import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Welcome to Zero Waste Challenge</h1>
            <p>Join our community to track and reduce waste, compete in challenges, and earn rewards!</p>
            <div>
                <Link to="/login">
                    <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
                </Link>
                <Link to="/signup">
                    <button style={{ margin: '10px', padding: '10px 20px' }}>Sign Up</button>
                </Link>
            </div>
            <h3>Why Join?</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>Track your waste reduction progress</li>
                <li>Compete with friends on leaderboards</li>
                <li>Discover eco-friendly tips and products</li>
            </ul>
        </div>
    );
};

export default Home;