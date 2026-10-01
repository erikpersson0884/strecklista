import axios from 'axios';

export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export const api = axios.create({
    baseURL: `/api`,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url: string = error.config?.url ?? '';
        const hadToken = !!error.config?.headers?.Authorization;

        // Only treat it as an expired session if we actually sent a token,
        // and it wasn't the login request itself (wrong credentials also give 401).
        if (status === 401 && hadToken && !url.includes('/oauth2/token')) {
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        }

        return Promise.reject(error);
    }
);

export const setAuthToken = async (token: string | null): Promise<void> => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
