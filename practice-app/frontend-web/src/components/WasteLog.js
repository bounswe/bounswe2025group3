import React, { useState, useEffect } from 'react';
import { getWasteLogs, addWasteLog, getSubCategories } from '../services/api';
import './WasteLog.css';

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

    return (
        <div className="waste-log-container">
            <h2>Waste Logs</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}
            <form onSubmit={handleSubmit} className="waste-log-form">
                <select
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
                <input
                    type="number"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    min="0.01"
                    step="0.01"
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>Add Log</button>
            </form>
            <h3>Logged Waste</h3>
            {logs.length === 0 ? (
                <p>No waste logs yet.</p>
            ) : (
                <ul>
                    {logs.map((log) => (
                        <li key={log.id}>
                            {log.sub_category_name}: {log.quantity} {subCategories.find(sc => sc.id === log.sub_category)?.unit}, Score: {log.score}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WasteLog;