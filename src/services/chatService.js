import { apiClient, getAudioFileName } from './api';

export const chatService = {
  async getScenarios() {
    const res = await apiClient.get('/chat/scenarios');
    return res.data;
  },

  async startConversation(scenarioId, customTopic = null) {
    const res = await apiClient.post('/chat/conversations', {
      scenario_id: scenarioId || 'custom',
      custom_topic: customTopic || null
    });
    return res.data;
  },

  async generateCustomScenario(topic) {
    const res = await apiClient.post('/chat/scenarios/generate', {
      topic: topic
    });
    return res.data;
  },

  async getConversations() {
    const res = await apiClient.get('/chat/conversations');
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
    const fileName = getAudioFileName(audioBlob, 'user_voice');
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
