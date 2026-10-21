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

apiClient.interceptors.response.use(
  response => response,
  error => {
    const token = localStorage.getItem('token');
    const sentToken = error.config?.headers?.Authorization;
    const isLogin = /\/auth\/(login|register|token)(?:\?|$)/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isLogin && token && sentToken === `Bearer ${token}`) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'An error occurred. Please try again.') {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map(item => item.msg).join(', ');
  if (typeof detail === 'string') return detail;
  if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return error.message && !error.response ? error.message : fallback;
}

export function getAudioFileName(blob, basename = 'recording') {
  if (blob instanceof File) return blob.name;
  const mime = blob.type?.split(';')[0];
  const extension = { 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/mpeg': 'mp3' }[mime] || 'webm';
  return `${basename}.${extension}`;
}

export function getFullAudioUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${SERVER_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
