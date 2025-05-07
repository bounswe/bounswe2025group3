import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/api';
import Navbar from '../common/Navbar';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        city: '',
        country: '',
        notifications_enabled: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setProfile(data);
            } catch (err) {
                setError('Failed to fetch profile.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await updateUserProfile(profile);
            alert('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        }
    };

    return (
        <div className="profile-container">
            <Navbar isAuthenticated={true} />
            <div className="profile-content">
                <h2>Your Profile</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            id="first_name"
                            type="text"
                            value={profile.first_name}
                            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            id="last_name"
                            type="text"
                            value={profile.last_name}
                            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                            id="city"
                            type="text"
                            value={profile.city}
                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <input
                            id="country"
                            type="text"
                            value={profile.country}
                            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={profile.notifications_enabled}
                                onChange={(e) => setProfile({ ...profile, notifications_enabled: e.target.checked })}
                            />
                            Enable Notifications
                        </label>
                    </div>
                    <button type="submit" disabled={loading}>
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;