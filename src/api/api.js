import axios from 'axios';

// Konfigurasi dasar Axios untuk menembak ke Laravel
const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Otomatis tempelkan token ke Header jika tokennya ada di LocalStorage browser
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;