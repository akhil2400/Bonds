import api from './api';

export const thoughtService = {
  async getThoughts() {
    try {
      const response = await api.get('/thought');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserThoughts() {
    try {
      const response = await api.get('/thought/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createThought(thoughtData) {
    try {
      const response = await api.post('/thought', thoughtData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};