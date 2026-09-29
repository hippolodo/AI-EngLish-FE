import { apiClient } from './api';

export const pronunciationService = {
  async analyzePronunciation(audioBlob, targetText, lessonId = null) {
    const formData = new FormData();
    const fileName = audioBlob instanceof File ? audioBlob.name : 'user_recording.webm';
    formData.append('audio_file', audioBlob, fileName);
    formData.append('target_text', targetText);
    if (lessonId) {
      formData.append('lesson_id', lessonId.toString());
    }

    const res = await apiClient.post('/pronunciation/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 45000
    });
    return res.data;
  },

  async getHistory() {
    const res = await apiClient.get('/pronunciation/history');
    return res.data;
  },

  async getSessionDetail(sessionId) {
    const res = await apiClient.get(`/pronunciation/sessions/${sessionId}`);
    return res.data;
  }
};