import { apiClient } from './api';

export const curriculumService = {
  async getTopics(level = null) {
    const params = level ? { level } : {};
    const res = await apiClient.get('/curriculum/topics', { params });
    return res.data;
  },

  async getLessonsByTopic(topicId, type = null) {
    const params = type ? { type } : {};
    const res = await apiClient.get(`/curriculum/topics/${topicId}/lessons`, { params });
    return res.data;
  },

  // Alias for compatibility
  async getTopicLessons(topicId, type = null) {
    return this.getLessonsByTopic(topicId, type);
  },

  async getLessonDetail(lessonId) {
    const res = await apiClient.get(`/curriculum/lessons/${lessonId}`);
    return res.data;
  }
};