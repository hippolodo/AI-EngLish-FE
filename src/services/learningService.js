import { apiClient } from './api';

export const learningService = {
  async getState() { return (await apiClient.get('/learning/me')).data; },
  async saveState(state) { return (await apiClient.put('/learning/me', state)).data; }
};
