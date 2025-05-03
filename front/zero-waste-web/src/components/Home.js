import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <nav>
        <h1>Zero Waste Challenge</h1>
        <div>
          <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
        </div>
      </nav>
      <section>
        <h2>Welcome to Zero Waste Challenge!</h2>
        <p>Join us to reduce waste, participate in challenges, and climb the leaderboard!</p>
        <Link to="/signup">
          <button>Get Started</button>
        </Link>
      </section>
      <section>
        <h3>Features</h3>
        <div className="feature-grid">
          <div>
            <h4>Challenges</h4>
            <p>Join group or individual challenges to reduce waste.</p>
          </div>
          <div>
            <h4>Waste Logs</h4>
            <p>Track your daily waste to monitor progress.</p>
          </div>
          <div>
            <h4>Leaderboards</h4>
            <p>Compete with others to be the top eco-warrior!</p>
          </div>
        </div>
      </section>
      <section>
        <h3>Eco Tips</h3>
        <p>Compost organic waste to reduce landfill use.</p>
      </section>
      <footer>
        <p>© 2025 Zero Waste Challenge</p>
      </footer>
    </div>
  );
};

export default Home;