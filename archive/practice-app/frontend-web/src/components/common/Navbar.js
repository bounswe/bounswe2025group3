import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="logo">Greener</div>
            <ul className="nav-links">
                {isAuthenticated ? (
                    <>
                        <li>
                            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/waste" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                                Waste Log
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                                Profile
                            </NavLink>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="nav-button">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <NavLink to="/home" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                                Home
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;