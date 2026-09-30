import { apiClient } from './api';

export const chatService = {
  async getScenarios() {
    const res = await apiClient.get('/chat/scenarios');
    return res.data;
  },

  async startConversation(scenarioId) {
    const res = await apiClient.post('/chat/conversations', {
      scenario_id: scenarioId
    });
    return res.data;
  },

  async getConversationDetail(conversationId) {
    const res = await apiClient.get(`/chat/conversations/${conversationId}`);
    return res.data;
  },

  async sendMessage(conversationId, messageText) {
    const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, {
      message_text: messageText
    });
    return res.data;
  },

  async sendVoiceMessage(conversationId, audioBlob) {
    const formData = new FormData();
    const fileName = audioBlob instanceof File ? audioBlob.name : 'user_voice.webm';
    formData.append('audio_file', audioBlob, fileName);

    const res = await apiClient.post(`/chat/conversations/${conversationId}/voice`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 40000
    });
    return res.data;
  }
};
