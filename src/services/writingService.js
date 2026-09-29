import { apiClient } from './api';

export const writingService = {
  async evaluateEssay(text, lessonId = null) {
    const payload = {
      original_text: text,
      content: text,
      lesson_id: lessonId
    };
    const res = await apiClient.post('/writing/evaluate', payload, {
      timeout: 45000
    });
    return res.data;
  },

  async getHistory() {
    const res = await apiClient.get('/writing/history');
    return res.data;
  },

  async getWritingDetail(id) {
    const res = await apiClient.get(`/writing/${id}`);
    return res.data;
  }
};