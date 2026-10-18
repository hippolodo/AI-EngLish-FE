import { apiClient } from './api';

export const studyService = {
  async getFlashcardDecks(lessonId = null) {
    const res = await apiClient.get('/flashcards/decks', { params: lessonId ? { lesson_id: lessonId } : {} });
    return res.data;
  },

  async getCardsForReview(deckId = null) {
    const params = deckId ? { deck_id: deckId } : {};
    const res = await apiClient.get('/flashcards/review', { params });
    return res.data;
  },

  async reviewCard(cardId, isRemembered) {
    const res = await apiClient.post(`/flashcards/cards/${cardId}/review`, {
      is_remembered: isRemembered
    });
    return res.data;
  },

  async toggleReminder(cardId, enable = null) {
    const params = enable !== null ? { enable } : {};
    const res = await apiClient.post(`/flashcards/cards/${cardId}/reminder`, null, { params });
    return res.data;
  },

  async markCardMastered(cardId) {
    const res = await apiClient.post(`/flashcards/cards/${cardId}/master`);
    return res.data;
  },

  async saveWord(word, meaning, example = '', ipa = null) {
    const payload = { word, meaning, hint_example: example };
    if (ipa) payload.ipa = ipa;
    return (await apiClient.post('/flashcards/saved', payload)).data;
  },

  async getQuizzes(lessonId = null, topicId = null) {
    const params = {};
    if (lessonId) params.lesson_id = lessonId;
    if (topicId) params.topic_id = topicId;
    const res = await apiClient.get('/quizzes', { params });
    return res.data;
  },

  async getQuizDetail(quizId) {
    const res = await apiClient.get(`/quizzes/${quizId}`);
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
  }
};
