import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getWasteLogs = async () => {
    const response = await api.get('/api/v1/waste/logs/');
    return response.data.results; // Extract results from paginated response
};

export const addWasteLog = async (data) => {
    const response = await api.post('/api/v1/waste/logs/', data);
    return response.data;
};

export const getSubCategories = async () => {
    const response = await api.get('/api/v1/waste/subcategories/');
    return response.data;
};