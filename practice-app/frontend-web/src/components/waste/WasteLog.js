import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Added Link, NavLink
import { getWasteLogs, addWasteLog, getSubCategories } from '../../services/api'; // Assuming path is correct
// Removed: import Navbar from '../common/Navbar';
import './WasteLog.css'; // We will heavily update this

// Re-usable Icon component (or import if you've centralized it)
const Icon = ({ name, className = "" }) => {
    const icons = {
        logo: '🌿',
        waste: '🗑️',
        leaderboard: '📊',
        challenges: '🏆',
        logNew: '➕',
        list: '📋',
        alerts: '⚠️',
        dashboard: '🏠',
        back: '↩️', // Or a left arrow icon
        category: '🏷️',
        quantity: '⚖️',
        disposal: '♻️',
        notes: '📝',
        retry: '🔄',
        goal: '🎯',
        submit: '✔️'
    };
    return <span className={`icon ${className}`}>{icons[name] || ''}</span>;
};


const WasteLog = () => {
    const [logs, setLogs] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [form, setForm] = useState({
        subcategory: '', // Changed from sub_category for consistency with label
        quantity: '',
        disposal_method: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false); // Separate loading for submit
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [logsData, subCategoriesData] = await Promise.all([
                getWasteLogs(),
                getSubCategories(),
            ]);
            setLogs(Array.isArray(logsData) ? logsData : []);
            setSubCategories(Array.isArray(subCategoriesData) ? subCategoriesData : []);
            if (!Array.isArray(subCategoriesData) || subCategoriesData.length === 0) {
                setError('No waste categories available to log. Please contact support or try again later.');
            }
        } catch (err) {
            setError('Failed to fetch initial data. Please check your connection.');
            console.error('Error fetching data:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
     
        fetchData();
    }, [navigate]); // Added navigate to dependency array

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subcategory || !form.quantity) {
            setError('Please select a category and enter a quantity.');
            return;
        }
        const quantity = parseFloat(form.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            setError('Quantity must be a positive number.');
            return;
        }

        setLoadingSubmit(true);
        setError(null);
        try {
            const payload = {
                sub_category: parseInt(form.subcategory), // API expects sub_category
                quantity,
                disposal_method: form.disposal_method || undefined,
                notes: form.notes || undefined,
            };
            await addWasteLog(payload);
            // Refetch logs to include the new one
            const updatedLogsData = await getWasteLogs();
            setLogs(Array.isArray(updatedLogsData) ? updatedLogsData : []);
            setForm({ subcategory: '', quantity: '', disposal_method: '', notes: '' }); // Reset form
            alert('Waste log added successfully!');
        } catch (err) {
            const errorMessage = err.response?.data
                ? Object.entries(err.response.data)
                      .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
                      .join('; ') || 'Failed to add waste log.'
                : 'Failed to add waste log. Please check your connection or try again.';
            setError(errorMessage);
            console.error('Error adding log:', err.response?.data || err.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="wastelog-page-layout">
            {/* --- Top Navigation Bar --- */}
           
            {/* --- Top Navigation Bar --- */}
            <header className="dashboard-top-nav">
                <Link to="/" className="app-logo">
                    <Icon name="logo" /> Greener
                </Link>
                <nav className="main-actions-nav">
                    {/* Add Dashboard link here */}
                    <NavLink to="/dashboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="dashboard" /> Dashboard {/* Make sure 'dashboard' icon is in your Icon component */}
                    </NavLink>
                    <NavLink to="/waste" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="waste" /> Waste Log
                    </NavLink>
                    <NavLink to="/goals"  className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="goal" /> Goals
                    </NavLink>
                    <NavLink to="/leaderboard" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="leaderboard" /> Leaderboard
                    </NavLink>
                    <NavLink to="/challenges" className={({isActive}) => `nav-action-item ${isActive ? "active" : ""}`}>
                        <Icon name="challenges" /> Challenges
                    </NavLink>
                </nav>
            </header>
            {/* --- Main Content Area for Waste Log --- */}
            <main className="wastelog-main-content">
                <div className="wastelog-header-section">
                    <h1><Icon name="waste" /> Log Your Waste</h1>
                    <p>Track your waste generation to understand and reduce your environmental impact.</p>
                </div>

                {error && (
                    <div className="error-message-box-main wastelog-error"> {/* Reusing error style */}
                        <Icon name="alerts" className="error-icon"/> {error}
                        {error.includes('No waste categories available') && (
                            <button onClick={fetchData} disabled={loading} className="retry-button">
                                <Icon name="retry"/> Retry Fetching Categories
                            </button>
                        )}
                    </div>
                )}

                <div className="wastelog-form-and-list-container">
                    {/* Form Section */}
                    <section className="wastelog-form-card">
                        <h3 className="form-card-title"><Icon name="logNew"/> Add New Entry</h3>
                        <form onSubmit={handleSubmit} className="wastelog-form">
                            <div className="form-field">
                                <label htmlFor="subcategory"><Icon name="category"/> Category</label>
                                <select
                                    id="subcategory"
                                    name="subcategory" // Name attribute for controlled component
                                    value={form.subcategory}
                                    onChange={handleInputChange}
                                    disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0}
                                    required
                                >
                                    <option value="">Select a waste category...</option>
                                    {Array.isArray(subCategories) && subCategories.map((sc) => (
                                        <option key={sc.id} value={sc.id}>
                                            {sc.name} ({sc.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="quantity"><Icon name="quantity"/> Quantity</label>
                                <input
                                    id="quantity"
                                    name="quantity" // Name attribute
                                    type="number"
                                    placeholder="e.g., 2.5"
                                    value={form.quantity}
                                    onChange={handleInputChange}
                                    min="0.01"
                                    step="any" // Allow more flexible decimal input
                                    disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="disposal_method"><Icon name="disposal"/> Disposal Method (Optional)</label>
                                <select
                                    id="disposal_method"
                                    name="disposal_method" // Name attribute
                                    value={form.disposal_method}
                                    onChange={handleInputChange}
                                    disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0}
                                >
                                    <option value="">Select if applicable...</option>
                                    <option value="recycled">Recycled</option>
                                    <option value="composted">Composted</option>
                                    <option value="landfill">Landfill</option>
                                    <option value="donated">Donated/Reused</option>
                                    <option value="incinerated">Incinerated (Energy Recovery)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="notes"><Icon name="notes"/> Notes (Optional)</label>
                                <textarea
                                    id="notes"
                                    name="notes" // Name attribute
                                    placeholder="Any details, e.g., specific items, source..."
                                    value={form.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0}
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-log-button"
                                disabled={loading || loadingSubmit || !subCategories || subCategories.length === 0}
                            >
                                {loadingSubmit ? (
                                    <>
                                        <span className="button-spinner"></span> Adding...
                                    </>
                                ) : (
                                    <><Icon name="submit"/> Add Log Entry</>
                                )}
                            </button>
                        </form>
                    </section>

                    {/* Log List Section */}
                    <section className="wastelog-list-card">
                        <h3 className="list-card-title"><Icon name="list"/> Your Recent Logs</h3>
                        {loading && !loadingSubmit && <p className="loading-text">Loading logs...</p>}
                        {!loading && logs.length === 0 && (
                            <p className="no-logs-message">You haven't logged any waste yet. Use the form to start tracking!</p>
                        )}
                        {!loading && logs.length > 0 && (
                            <ul className="wastelog-items-list">
                                {logs
                                    .sort((a, b) => new Date(b.date_logged) - new Date(a.date_logged)) // Ensure sorting
                                    .slice(0, 10) // Show recent 10, for example
                                    .map((log) => {
                                        const subCategoryDetails = subCategories.find(sc => sc.id === log.sub_category);
                                        return (
                                            <li key={log.id} className="wastelog-item">
                                                <div className="item-main-info">
                                                    <span className="item-category">
                                                        <Icon name="category" /> {log.sub_category_name || subCategoryDetails?.name || 'Unknown Category'}
                                                    </span>
                                                    <span className="item-quantity">
                                                        {Number(log.quantity).toFixed(2)} {subCategoryDetails?.unit || 'units'}
                                                    </span>
                                                </div>
                                                <div className="item-meta-info">
                                                    <span className="item-score">Score: {log.score || 'N/A'}</span>
                                                    {log.disposal_method && <span className="item-disposal">Method: {log.disposal_method}</span>}
                                                </div>
                                                {log.notes && <p className="item-notes">Notes: {log.notes}</p>}
                                                <span className="item-date">
                                                    Logged: {new Date(log.date_logged).toLocaleDateString()}
                                                    {/* {new Date(log.date_logged).toLocaleString()} */}
                                                </span>
                                            </li>
                                        );
                                })}
                            </ul>
                        )}
                         {!loading && logs.length > 10 && (
                            <p className="view-all-logs-link">View all logs in your profile (coming soon!)</p>
                        )}
                    </section>
                </div>
                <div className="page-actions">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="back-to-dashboard-button"
                    >
                        <Icon name="back"/> Back to Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
};

export default WasteLog;