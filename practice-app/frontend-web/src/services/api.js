import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    const publicEndpoints = ['/api/auth/register/', '/api/token/', '/api/token/refresh/'];
    if (token && !publicEndpoints.includes(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getWasteLogs = async () => {
    const response = await api.get('/api/v1/waste/logs/');
    return response.data.results;
};

export const addWasteLog = async (data) => {
    const response = await api.post('/api/v1/waste/logs/', data);
    return response.data;
};

export const getSubCategories = async () => {
    const response = await api.get('/api/v1/waste/subcategories/');
    return response.data.results;
};

export const getUserScore = async () => {
    const response = await api.get('/api/v1/waste/scores/me/');
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('/api/user/me/');
    return response.data;
};

export const updateUserProfile = async (data) => {
    const response = await api.patch('/api/user/me/', data);
    return response.data;
};