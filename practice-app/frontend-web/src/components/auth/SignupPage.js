import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // For shared base styles
import './SignupPage.css'; // For signup-specific styles

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '', 
    password2: '',
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    country: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password1 !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    // Prepare data for submission, backend might expect 'password' not 'password1'
    const submissionData = { ...formData };
    //delete submissionData.password2; // Don't send password2 to backend

    try {
      // Ensure your backend endpoint for registration is correct
      // and it expects 'password' field not 'password1'.
      // If it expects 'password1', change 'password' back to 'password1' in state and here.
      await axios.post('http://127.0.0.1:8000/api/auth/register/', submissionData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const msg = data
        ? Object.entries(data)
            .map(([k, v]) => {
              const fieldName = k.replace('_', ' '); // Make field names more readable
              return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${Array.isArray(v) ? v.join(', ') : v}`;
            })
            .join('; ')
        : err.message || 'Unknown error';
      setError(`Registration failed: ${msg}`);
      console.error('Signup failed:', data || err.message);
    }
  };

  return (
    <div className="login-page signup-page"> {/* Added signup-page for specific scoping if needed */}
      <div className="nav-container">
        <nav className="navbar">
          <ul className="main-nav">
            <li className="nav-item">
              <Link to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/about">About us</Link>
            </li>
            <li className="nav-item">
              <Link to="/blog">Blog</Link>
            </li>
            <li className="nav-item">
              <Link to="/login">Login</Link>
            </li>
            <li className="nav-item active"> {/* Sign Up is active */}
              <Link to="/signup">Sign Up</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="login-container"> {/* Reusing login-container for layout */}
        <div className="main-content">
          <div className="form-section">
            <h1 className="main-heading"> {/* Changed to h1 */}
              Join the <span style={{ color: 'var(--accent)' }}>Zero Waste</span> Movement
            </h1>
            <p className="welcome-text">Create an account to start logging and recycling your waste.</p>
            <p className="mandatory-note">
              Fields marked with <span className="asterisk">*</span> are mandatory.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-columns">
                <div className="form-col">
                  <div className="input-box">
                    <label htmlFor="username">
                      Username<span className="asterisk">*</span>
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="email">
                      Email<span className="asterisk">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="password">
                      Password<span className="asterisk">*</span>
                    </label>
                    <input
                      id="password"
                      name="password1" 
                      type="password"
                      placeholder="Enter Password"
                      value={formData.password1} 
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="password2">
                      Confirm Password<span className="asterisk">*</span>
                    </label>
                    <input
                      id="password2"
                      name="password2"
                      type="password"
                      placeholder="Confirm Password"
                      value={formData.password2}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-col">
                  <div className="input-box">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="Enter First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Enter Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Enter City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      placeholder="Enter Country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="input-box bio-input-box"> {/* Added class for specific styling if needed */}
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself (optional)"
                  rows={4} // Reduced rows for a more compact default
                  value={formData.bio}
                  onChange={handleChange}
                  className="bio-full" // This class will make it full width
                />
              </div>

              {error && <p className="error-message">{error}</p>} {/* Standardized error class */}

              <div className="action-buttons"> {/* Standardized button container class */}
                <button type="submit" className="login-btn">Sign Up</button> {/* Reusing login-btn style */}
                <button type="button" className="signup-btn" onClick={() => navigate('/login')}> {/* Reusing signup-btn style */}
                  Back to Login
                </button>
              </div>
            </form>
            <p className="alternate-action-text">
                Already have an account? <Link to="/login">Log In</Link>
            </p>
          </div>

          <div className="image-section">
            <img src="/wasteimage.png" alt="Recycling illustration" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML+='<p>Image not found</p>' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;