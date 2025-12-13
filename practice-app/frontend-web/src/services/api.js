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

// --- YARDIMCI FONKSİYON: TÜM SAYFALARI ÇEKME ---
// Bu fonksiyon, "next" linki olduğu sürece istek atmaya devam eder.
const fetchAllPages = async (endpoint) => {
    let allResults = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
        try {
            // Sayfa parametresini ekleyerek istek atıyoruz
            const response = await api.get(`${endpoint}?page=${page}`);
            const data = response.data;

            // Eğer API sayfalama kullanmıyorsa direkt diziyi dön
            if (Array.isArray(data)) {
                return data;
            }

            // Sayfalama varsa results kısmını ana diziye ekle
            if (data.results) {
                allResults = [...allResults, ...data.results];
            }

            // Eğer "next" (sonraki sayfa linki) yoksa döngüyü bitir
            if (!data.next) {
                hasNext = false;
            } else {
                page++; // Sonraki sayfaya geç
            }
        } catch (error) {
            console.error(`Error fetching page ${page} for ${endpoint}`, error);
            hasNext = false; // Hata durumunda sonsuz döngüye girmemek için bitir
        }
    }
    return allResults;
};

// ---------------------------------------------------

export const getWasteLogs = async () => {
    // Loglar çok fazla olabileceği için hepsini çekmek yerine ilk sayfayı alıyoruz (şimdilik)
    // İleride "Load More" butonu eklenebilir.
    const response = await api.get('v1/waste/logs/');
    return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const addWasteLog = async (data) => {
    const response = await api.post('v1/waste/logs/', data);
    return response.data;
};

// GÜNCELLENDİ: Tüm kategorileri (sayfalarca olsa bile) çeker
export const getWasteCategories = async () => {
    return await fetchAllPages('v1/waste/categories/');
};

// GÜNCELLENDİ: Tüm alt kategorileri (sayfalarca olsa bile) çeker
export const getSubCategories = async () => {
    return await fetchAllPages('v1/waste/subcategories/');
};

export const getUserScore = async () => {
    const response = await api.get('v1/waste/scores/me/');
    return response.data;
};

export const getLeaderboard = async (period = 'all') => {
    const response = await api.get(`v1/waste/leaderboard/?period=${period}`);
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