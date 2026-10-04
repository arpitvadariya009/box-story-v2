/**
 * Centralized Axios API Service
 * ---------------------------------
 * URL sirf yahan change karo — poore project mein automatically reflect hoga.
 * .env mein VITE_API_URL set karo (recommended), warna niche ka fallback use hoga.
 */
import axios from 'axios';

// --- Base URL ----------------------------------------------------------------
export const BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://194.238.17.199:1119';

// --- Axios Instance ----------------------------------------------------------
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor: auto-attach Bearer token --------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: global 401 → auto logout -------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
