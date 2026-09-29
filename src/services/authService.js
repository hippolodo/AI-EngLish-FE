import { apiClient } from './api';

export const authService = {
  async login(email, password) {
    const res = await apiClient.post('/auth/login', {
      email,
      password
    });
    if (res.data && res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  async register(email, password, fullName, targetLevel = 'Intermediate') {
    const res = await apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      target_level: targetLevel
    });
    if (res.data && res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  async getProfile() {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      return res.data;
    } catch (err) {
      return null;
    }
  },

  async updateTargetLevel(targetLevel) {
    const res = await apiClient.put('/auth/target-level', {
      target_level: targetLevel
    });
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    const u = localStorage.getItem('user');
    try {
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
