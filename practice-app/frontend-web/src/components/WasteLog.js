import React, { useState, useEffect } from 'react';
import { getWasteLogs, addWasteLog, getSubCategories } from '../services/api';
import './WasteLog.css'; // Import the CSS file

const WasteLog = () => {
    const [logs, setLogs] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [form, setForm] = useState({ sub_category: '', quantity: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [logsData, subCategoriesData] = await Promise.all([
                    getWasteLogs(),
                    getSubCategories()
                ]);
                setLogs(logsData);
                setSubCategories(subCategoriesData);
            } catch (err) {
                setError('Failed to fetch data. Please try again.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.sub_category || !form.quantity) {
            setError('Please select a subcategory and enter a quantity.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await addWasteLog({
                sub_category: parseInt(form.sub_category),
                quantity: parseFloat(form.quantity)
            });
            const logsData = await getWasteLogs();
            setLogs(logsData);
            setForm({ sub_category: '', quantity: '' });
            alert('Waste log added!');
        } catch (err) {
            setError('Failed to add waste log. Please check your input.');
            console.error('Error adding log:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to determine score class
    const getScoreClass = (score) => {
        if (score >= 75) return 'high-score';
        if (score >= 40) return 'medium-score';
        return 'low-score';
    };

    return (
        <div className="waste-log-container">
            <div className="header">
                <h2><span className="leaf-icon">🍃</span> Environmental Waste Logger</h2>
                <p>Track and monitor your waste to help build a greener future</p>
            </div>

            <div className="form-container">
                <h3 className="form-title"><span className="leaf-icon">➕</span> Add New Waste Log</h3>
                
                {error && (
                    <div className="error-message">
                        <span className="leaf-icon">⚠️</span> {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div className="input-container">
                            <label htmlFor="sub-category">Waste Category</label>
                            <select
                                id="sub-category"
                                value={form.sub_category}
                                onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                                disabled={loading}
                            >
                                <option value="">Select Subcategory</option>
                                {subCategories.map((sc) => (
                                    <option key={sc.id} value={sc.id}>
                                        {sc.name} ({sc.unit})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="input-container">
                            <label htmlFor="quantity">Quantity</label>
                            <input
                                id="quantity"
                                type="number"
                                placeholder="Enter amount"
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                min="0.01"
                                step="0.01"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    
                    <button className="submit-btn" type="submit" disabled={loading}>
                        <span className="leaf-icon">🌱</span> Add Log
                    </button>
                </form>
            </div>

            <div className="logs-section">
                <h3><span className="leaf-icon">📊</span> Logged Waste</h3>
                
                {loading && (
                    <div className="loader">
                        <div className="loader-spinner"></div>
                    </div>
                )}
                
                {logs.length === 0 ? (
                    <div className="logs-empty">
                        <p>No waste logs yet. Start tracking your environmental impact today!</p>
                    </div>
                ) : (
                    <ul className="logs-list">
                        {logs.map((log) => {
                            const category = subCategories.find(sc => sc.id === log.sub_category);
                            const unit = category?.unit || '';
                            
                            return (
                                <li key={log.id} className="log-item">
                                    <div className="log-details">
                                        <div className="log-category">{log.sub_category_name}</div>
                                        <div className="log-quantity">{log.quantity} {unit}</div>
                                    </div>
                                    <div className={`log-score ${getScoreClass(log.score)}`}>
                                        Score: {log.score}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default WasteLog;