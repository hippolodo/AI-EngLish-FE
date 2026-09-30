import axios from 'axios';

export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${SERVER_BASE_URL}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function getFullAudioUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${SERVER_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}