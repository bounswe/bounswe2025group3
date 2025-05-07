import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWasteLogs, addWasteLog, getSubCategories } from '../../services/api';
import Navbar from '../common/Navbar';
import './WasteLog.css';

const WasteLog = () => {
    const [logs, setLogs] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [form, setForm] = useState({
        subcategory: '',
        quantity: '',
        disposal_method: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
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
            console.log('Subcategories data:', subCategoriesData);
            console.log('Logs data (fetchData):', logsData);
            setLogs(Array.isArray(logsData) ? logsData : []);
            setSubCategories(Array.isArray(subCategoriesData) ? subCategoriesData : []);
            if (subCategoriesData.length === 0) {
                setError('No subcategories available. Try again or contact support.');
            }
        } catch (err) {
            setError('Failed to fetch data. Please check your connection or login status.');
            console.error('Error fetching data:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subcategory || !form.quantity) {
            setError('Please select a subcategory and enter a quantity.');
            return;
        }
        const quantity = parseFloat(form.quantity);
        if (quantity <= 0 || isNaN(quantity)) {
            setError('Quantity must be a positive number.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const payload = {
                sub_category: parseInt(form.subcategory),
                quantity,
                disposal_method: form.disposal_method || undefined,
                notes: form.notes || undefined,
            };
            console.log('Submitting payload:', payload);
            const addResponse = await addWasteLog(payload);
            console.log('Add waste log response:', addResponse);
            // Optional: Add delay to ensure backend processes POST
            await new Promise((resolve) => setTimeout(resolve, 500));
            const logsData = await getWasteLogs();
            console.log('Logs data (handleSubmit):', logsData);
            setLogs(Array.isArray(logsData) ? logsData : []);
            setForm({ subcategory: '', quantity: '', disposal_method: '', notes: '' });
            alert('Waste log added!');
        } catch (err) {
            const errorMessage = err.response?.data
                ? Object.entries(err.response.data)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('; ') || 'Failed to add waste log.'
                : 'Failed to add waste log. Please check your connection.';
            setError(errorMessage);
            console.error('Error adding log:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="waste-log-container">
            <Navbar isAuthenticated={true} />
            <h2>Waste Logs</h2>
            {error && (
                <div className="error-container">
                    <p className="error">{error}</p>
                    {error.includes('No subcategories available') && (
                        <button onClick={fetchData} disabled={loading} className="retry-button">
                            Retry
                        </button>
                    )}
                </div>
            )}
            {loading && <p>Loading data...</p>}
            <div className="waste-log-content">
                <section className="waste-log-form-section">
                    <h3>Log New Waste</h3>
                    <form onSubmit={handleSubmit} className="waste-log-form">
                        <div className="form-group">
                            <label htmlFor="subcategory">Subcategory</label>
                            <select
                                id="subcategory"
                                value={form.subcategory}
                                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                                disabled={loading || subCategories.length === 0}
                            >
                                <option value="">Select Subcategory</option>
                                {Array.isArray(subCategories) && subCategories.length > 0 ? (
                                    subCategories.map((sc) => (
                                        <option key={sc.id} value={sc.id}>
                                            {sc.name} ({sc.unit})
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No subcategories available</option>
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="quantity">Quantity</label>
                            <input
                                id="quantity"
                                type="number"
                                placeholder="e.g., 2.5"
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                min="0.01"
                                step="0.01"
                                disabled={loading || subCategories.length === 0}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="disposal_method">Disposal Method (Optional)</label>
                            <select
                                id="disposal_method"
                                value={form.disposal_method}
                                onChange={(e) => setForm({ ...form, disposal_method: e.target.value })}
                                disabled={loading || subCategories.length === 0}
                            >
                                <option value="">Select Disposal Method</option>
                                <option value="recycled">Recycled</option>
                                <option value="composted">Composted</option>
                                <option value="landfill">Landfill</option>
                                <option value="donated">Donated</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Notes (Optional)</label>
                            <textarea
                                id="notes"
                                placeholder="e.g., Plastic bottles from event"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                disabled={loading || subCategories.length === 0}
                            />
                        </div>
                        <button type="submit" disabled={loading || subCategories.length === 0}>
                            Add Log
                        </button>
                    </form>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="back-button"
                    >
                        Back to Dashboard
                    </button>
                </section>
                <section className="waste-log-list-section">
                    <h3>Logged Waste</h3>
                    {logs.length === 0 ? (
                        <p>No waste logs yet. Start logging above!</p>
                    ) : (
                        <ul className="waste-log-list">
                            {logs
                                .sort((a, b) => new Date(b.date_logged) - new Date(a.date_logged))
                                .map((log) => (
                                    <li key={log.id} className="waste-log-item">
                                        <span>
                                            {log.sub_category_name}: {Number(log.quantity).toFixed(2)}{' '}
                                            {subCategories.find((sc) => sc.id === log.sub_category)?.unit || 'unit'}
                                        </span>
                                        <span>Score: {log.score}</span>
                                        {log.disposal_method && <span>Method: {log.disposal_method}</span>}
                                        {log.notes && <span>Notes: {log.notes}</span>}
                                        <span>Logged: {new Date(log.date_logged).toLocaleString()}</span>
                                    </li>
                                ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};

export default WasteLog;