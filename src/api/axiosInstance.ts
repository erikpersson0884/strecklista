import axios from 'axios';

export const api = axios.create({
    baseURL: `/api`,
});

export const setAuthToken = async (token: string | null): Promise<void> => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
