import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: `${apiUrl}`,
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

export const getLeaderboard = async () => {
    // This matches the new endpoint: /api/v1/waste/leaderboard/
    const response = await api.get('v1/waste/leaderboard/');
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

export const getEvents = async () => {
    const response = await api.get('v1/events/events/');
    return response.data.results || [];
};

export const getEvent = async (eventId) => {
    const response = await api.get(`v1/events/events/${eventId}/`);
    return response.data.results || [];
};

export const createEvent = async (data) => {
    const response = await api.post('v1/events/events/', data);
    return response.data;
};

export const toggleParticipation = async (eventId) => {
    const response = await api.post(`v1/events/events/${eventId}/participate/`);
    return response.data;
};

export const toggleLike = async (eventId) => {
    const response = await api.post(`v1/events/events/${eventId}/like/`);
    return response.data;
};

export const getUnreadNotifications = async () => {
    const response = await api.get('v1/notifications/?is_read=false');
    return response.data.results || [];
};

export const markNotificationAsRead = async (id) => {
    const response = await api.post(`v1/notifications/${id}/read/`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.post('v1/notifications/mark-all-read/');
    return response.data;
};

export default api;