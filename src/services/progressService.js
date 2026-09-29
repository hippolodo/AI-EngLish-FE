import { apiClient } from './api';

export const progressService = {
  async getDashboard() {
    const res = await apiClient.get('/progress/dashboard');
    return res.data;
  }
};