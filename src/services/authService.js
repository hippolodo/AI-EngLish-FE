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
    const token = this.getToken();
    const res = await apiClient.get('/auth/me');
    if (res.data && token === this.getToken()) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async updateTargetLevel(targetLevel) {
    const token = this.getToken();
    const res = await apiClient.put('/auth/target-level', {
      target_level: targetLevel
    });
    if (res.data && token === this.getToken()) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async updatePreferences(preferences) {
    const token = this.getToken();
    const res = await apiClient.put('/auth/preferences', preferences);
    if (res.data?.user && token === this.getToken()) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
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
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
      if (typeof exp === 'number' && exp * 1000 > Date.now()) return true;
    } catch {
      // Invalid cached tokens are discarded; the server remains the authority for authentication.
    }
    this.logout();
    return false;
  }
};
