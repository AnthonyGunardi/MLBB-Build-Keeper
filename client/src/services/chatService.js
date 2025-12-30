import api from '../api/axios';

const chatService = {
  sendMessage: async (message, context = '') => {
    const response = await api.post('/chat', { message, context });
    return response.data.data.reply;
  }
};

export default chatService;
