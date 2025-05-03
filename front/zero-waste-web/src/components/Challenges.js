import React from 'react';
import { Link } from 'react-router-dom';

const Challenges = () => {
  const mockChallenges = [
    { id: 1, title: 'Reduce Plastic', description: 'Use reusable bags for a week.' },
    { id: 2, title: 'Compost Challenge', description: 'Compost organic waste daily.' },
  ];

  return (
    <div>
      <nav>
        <h1>Zero Waste Challenge</h1>
        <div>
          <Link to="/dashboard">Dashboard</Link> | 
          <Link to="/profile">Profile</Link> | 
          <Link to="/waste-logs">Log Waste</Link> | 
          <Link to="/challenges">Challenges</Link> | 
          <Link to="/leaderboard">Leaderboard</Link> | 
          <Link to="/login">Logout</Link>
        </div>
      </nav>
      <section>
        <h2>Community Challenges</h2>
        <ul>
          {mockChallenges.map((challenge) => (
            <li key={challenge.id}>
              {challenge.title}: {challenge.description}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Challenges;