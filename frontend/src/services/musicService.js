import api from './api';

export const musicService = {
  async getMusic() {
    try {
      const response = await api.get('/music');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserMusic() {
    try {
      const response = await api.get('/music/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createMusic(musicData) {
    try {
      const response = await api.post('/music', musicData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};