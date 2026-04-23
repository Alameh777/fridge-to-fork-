import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use(c => {
    const t = localStorage.getItem('admin_token');
    if (t) c.headers.Authorization = 'Bearer ' + t;
    return c;
});

api.interceptors.response.use(r => r, e => {
    if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
    }
    return Promise.reject(e);
});

export default api;
