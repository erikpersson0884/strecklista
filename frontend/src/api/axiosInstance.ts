import axios from 'axios';

export const api = axios.create({
    // baseURL: API_URL,
    baseURL: '/',
});

export const setAuthToken = async (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

const token = localStorage.getItem('authToken');
if (token) setAuthToken(token);

export default api;
