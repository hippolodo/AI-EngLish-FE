import { apiClient } from './api';

const decksCache = new Map();
const flashcardsCache = new Map();
const quizzesCache = new Map();
const quizDetailCache = new Map();

export const studyService = {
  async getFlashcardDecks(lessonId = null) {
    const key = lessonId ? Number(lessonId) : 'ALL';
    if (decksCache.has(key)) return decksCache.get(key);
    const res = await apiClient.get('/flashcards/decks', { params: lessonId ? { lesson_id: lessonId } : {} });
    decksCache.set(key, res.data);
    return res.data;
  },

  async getFlashcards(deckId = null, notedOnly = false) {
    const key = `${deckId || 'ALL'}_${notedOnly}`;
    if (!notedOnly && deckId && flashcardsCache.has(key)) {
      return flashcardsCache.get(key);
    }
    const params = { noted_only: notedOnly };
    if (deckId) params.deck_id = deckId;
    const res = await apiClient.get('/flashcards/cards', { params });
    if (!notedOnly && deckId) flashcardsCache.set(key, res.data);
    return res.data;
  },

  async setCardNote(cardId, isNoted) {
    flashcardsCache.clear();
    const res = await apiClient.put(`/flashcards/cards/${cardId}/note`, { is_noted: isNoted });
    return res.data;
  },

  async saveWord(word, meaning, example = '', ipa = null) {
    flashcardsCache.clear();
    decksCache.clear();
    const payload = { word, meaning, hint_example: example };
    if (ipa) payload.ipa = ipa;
    return (await apiClient.post('/flashcards/saved', payload)).data;
  },

  async getQuizzes(lessonId = null, topicId = null) {
    const key = `${lessonId || 'null'}_${topicId || 'null'}`;
    if (quizzesCache.has(key)) return quizzesCache.get(key);
    const params = {};
    if (lessonId) params.lesson_id = lessonId;
    if (topicId) params.topic_id = topicId;
    const res = await apiClient.get('/quizzes', { params });
    quizzesCache.set(key, res.data);
    return res.data;
  },

  async getQuizDetail(quizId) {
    const id = Number(quizId);
    if (quizDetailCache.has(id)) return quizDetailCache.get(id);
    const res = await apiClient.get(`/quizzes/${id}`);
    quizDetailCache.set(id, res.data);
    return res.data;
  },

  async submitQuiz(quizId, answers) {
    const res = await apiClient.post(`/quizzes/${quizId}/submit`, {
      answers: answers
    });
    return res.data;
  },

  async checkQuizAnswer(quizId, answer) {
    return (await apiClient.post(`/quizzes/${quizId}/check`, answer)).data;
  },

  async generateQuiz(payload) {
    quizzesCache.clear();
    const res = await apiClient.post('/quizzes/generate', payload);
    return res.data;
  },

  async createQuiz(payload) {
    quizzesCache.clear();
    const res = await apiClient.post('/quizzes', payload);
    return res.data;
  },

  async getMyQuizHistory() {
    const res = await apiClient.get('/quizzes/history/my');
    return res.data;
  },

  clearCache() {
    decksCache.clear();
    flashcardsCache.clear();
    quizzesCache.clear();
    quizDetailCache.clear();
  }
};
