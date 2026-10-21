import { apiClient } from './api';

export const dictionaryService = {
  async search(query, autoAi = false, limit = 20, raw = false) {
    const res = await apiClient.get('/dictionary/search', {
      params: { q: query, auto_ai: autoAi, limit, raw }
    });
    return res.data;
  },

  async aiLookup(word, raw = false) {
    const res = await apiClient.get('/dictionary/ai-lookup', {
      params: { word, raw }
    });
    return res.data;
  },

  async getWordDetail(wordId) {
    const res = await apiClient.get(`/dictionary/words/${wordId}`);
    return res.data;
  },

  async getSearchHistory(limit = 15) {
    const res = await apiClient.get('/dictionary/history', {
      params: { limit }
    });
    return res.data;
  },

  async addWord(wordData) {
    const res = await apiClient.post('/dictionary/words', wordData);
    return res.data;
  }
};

