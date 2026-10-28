import { apiClient } from './api';

// High-speed in-memory RAM cache for curriculum items
const lessonDetailCache = new Map();
const topicLessonsCache = new Map();
let allLessonsCache = null;
let topicsCache = null;

export const curriculumService = {
  getCachedLessonDetail(lessonId) {
    return lessonDetailCache.get(Number(lessonId)) || null;
  },

  hasLessonDetail(lessonId) {
    return lessonDetailCache.has(Number(lessonId));
  },

  prefetchLesson(lessonId) {
    if (!this.hasLessonDetail(lessonId)) {
      this.getLessonDetail(lessonId).catch(() => {});
    }
  },

  async getTopics(level = null) {
    if (!level && topicsCache) return topicsCache;
    const params = level ? { level } : {};
    const res = await apiClient.get('/curriculum/topics', { params });
    if (!level) topicsCache = res.data;
    return res.data;
  },

  async getLessonsByTopic(topicId, type = null) {
    const cacheKey = `${topicId}_${type || 'ALL'}`;
    if (topicLessonsCache.has(cacheKey)) {
      return topicLessonsCache.get(cacheKey);
    }
    const params = type ? { type } : {};
    const res = await apiClient.get(`/curriculum/topics/${topicId}/lessons`, { params });
    topicLessonsCache.set(cacheKey, res.data);
    return res.data;
  },

  async getLessons(type = null) {
    if (!type && allLessonsCache) return allLessonsCache;
    const res = (await apiClient.get('/curriculum/lessons', { params: type ? { type } : {} })).data;
    if (!type) allLessonsCache = res;
    return res;
  },

  // Alias for compatibility
  async getTopicLessons(topicId, type = null) {
    return this.getLessonsByTopic(topicId, type);
  },

  async getLessonDetail(lessonId) {
    const id = Number(lessonId);
    if (lessonDetailCache.has(id)) {
      return lessonDetailCache.get(id);
    }
    const res = await apiClient.get(`/curriculum/lessons/${id}`);
    lessonDetailCache.set(id, res.data);
    return res.data;
  },

  clearCache() {
    lessonDetailCache.clear();
    topicLessonsCache.clear();
    allLessonsCache = null;
    topicsCache = null;
  }
};
