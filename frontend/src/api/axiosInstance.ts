import axios from 'axios';
console.log('API_BASE:', __API_BASE__); // Check the value of __API_BASE__  
export const api = axios.create({
    baseURL: `${__API_BASE__}/`,
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
