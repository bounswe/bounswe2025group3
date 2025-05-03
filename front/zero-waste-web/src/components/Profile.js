import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector((state) => state.waste);

  if (!user) return null;

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
        <h2>Your Profile</h2>
        <div>
          <p>Email: {user.email || 'N/A'}</p>
          <p>Name: {user.name || 'N/A'}</p>
          <p>Bio: {user.bio || 'N/A'}</p>
          <p>Location: {user.city || 'N/A'}, {user.country || 'N/A'}</p>
          <button>Edit Profile</button>
        </div>
        <div>
          <h3>Achievements</h3>
          <p>No badges earned yet.</p>
        </div>
        <div>
          <h3>Account Actions</h3>
          <button>Reset Password</button>
          <button>Delete Account</button>
        </div>
      </section>
    </div>
  );
};

export default Profile;