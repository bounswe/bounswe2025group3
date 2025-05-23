import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

console.debug('API Configuration:', { 
    API_URL,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV 
});

const api = axios.create({
    baseURL: `${API_URL}/api/`,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getWasteLogs = async () => {
    const response = await api.get('v1/waste/logs/');
    // Ensure response.data is an array
    return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const addWasteLog = async (data) => {
    const response = await api.post('v1/waste/logs/', data);
    return response.data;
};

export const getSubCategories = async () => {
    const response = await api.get('v1/waste/subcategories/');
    return response.data.results || response.data;
};

export const getUserScore = async () => {
    const response = await api.get('v1/waste/scores/me/');
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('user/me/');
    return response.data;
};

export const updateUserProfile = async (data) => {
    const response = await api.patch('user/me/', data);
    return response.data;
};

export default api;