import api from './api';

export const memoryService = {
  async getMemories() {
    try {
      const response = await api.get('/memory');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserMemories() {
    try {
      const response = await api.get('/memory/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createMemory(memoryData) {
    try {
      const response = await api.post('/memory', memoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};